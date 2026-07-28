<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flavor;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\Size;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with(['items.flavor', 'items.size', 'user:id,name'])
            ->orderByDesc('sold_at');

        if ($request->filled('from')) {
            $query->whereDate('sold_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('sold_at', '<=', $request->query('to'));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,gcash,maya,card'],
            'payment_status' => ['sometimes', 'in:paid,pending,refunded'],
            'sold_at' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.flavor_id' => ['nullable', 'exists:flavors,id'],
            'items.*.size_id' => ['nullable', 'exists:sizes,id'],
            'items.*.item_name' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.unit_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $sale = DB::transaction(function () use ($data, $request) {
            $taxRate = (float) (Setting::where('key', 'tax_rate')->value('value') ?? 0);
            $subtotal = 0;
            $costTotal = 0;
            $lineRows = [];

            foreach ($data['items'] as $item) {
                $flavor = isset($item['flavor_id']) ? Flavor::find($item['flavor_id']) : null;
                $size = isset($item['size_id']) ? Size::find($item['size_id']) : null;

                $unitPrice = isset($item['unit_price'])
                    ? (float) $item['unit_price']
                    : (float) ($flavor?->price ?? 0) + (float) ($size?->price ?? 0);

                $unitCost = isset($item['unit_cost'])
                    ? (float) $item['unit_cost']
                    : (float) ($flavor?->cost ?? 0);

                $qty = (float) $item['quantity'];
                $lineDiscount = (float) ($item['discount'] ?? 0);
                $lineTotal = max(0, ($unitPrice * $qty) - $lineDiscount);
                $lineCost = $unitCost * $qty;
                $lineProfit = $lineTotal - $lineCost;

                $itemName = $item['item_name']
                    ?? trim(($flavor?->name ?? 'Item').($size ? ' - '.$size->name : ''));

                $subtotal += $lineTotal;
                $costTotal += $lineCost;

                $lineRows[] = [
                    'flavor_id' => $flavor?->id,
                    'size_id' => $size?->id,
                    'item_name' => $itemName,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'unit_cost' => $unitCost,
                    'discount' => $lineDiscount,
                    'line_total' => $lineTotal,
                    'line_cost' => $lineCost,
                    'line_profit' => $lineProfit,
                    'flavor_name' => $flavor?->name,
                ];
            }

            $saleDiscount = (float) ($data['discount'] ?? 0);
            $taxable = max(0, $subtotal - $saleDiscount);
            $tax = round($taxable * ($taxRate / 100), 2);
            $total = $taxable + $tax;
            $profit = $total - $costTotal;

            $sale = Sale::create([
                'invoice_no' => $this->generateInvoiceNo(),
                'customer_name' => $data['customer_name'] ?? null,
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'discount' => $saleDiscount,
                'tax' => $tax,
                'total' => $total,
                'cost_total' => $costTotal,
                'profit' => $profit,
                'payment_method' => $data['payment_method'],
                'payment_status' => $data['payment_status'] ?? 'paid',
                'sold_at' => isset($data['sold_at']) ? Carbon::parse($data['sold_at']) : now(),
            ]);

            foreach ($lineRows as $row) {
                $flavorName = $row['flavor_name'] ?? null;
                unset($row['flavor_name']);

                SaleItem::create([...$row, 'sale_id' => $sale->id]);

                $this->deductInventoryForItem(
                    (float) $row['quantity'],
                    $flavorName,
                    $sale->id,
                    $request->user()->id
                );
            }

            return $sale->load(['items.flavor', 'items.size', 'user:id,name']);
        });

        return response()->json($sale, 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        return response()->json($sale->load(['items.flavor', 'items.size', 'user:id,name']));
    }

    private function generateInvoiceNo(): string
    {
        do {
            $invoice = 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(5));
        } while (Sale::where('invoice_no', $invoice)->exists());

        return $invoice;
    }

    private function deductInventoryForItem(float $qty, ?string $flavorName, int $saleId, int $userId): void
    {
        $packaging = ['cups', 'lids', 'straws'];

        foreach ($packaging as $category) {
            $item = Inventory::where('category', $category)->orderBy('id')->first();
            if ($item) {
                $this->applyStockOut($item, $qty, $saleId, $userId, "Sale packaging: {$category}");
            }
        }

        if ($flavorName) {
            $match = Inventory::query()
                ->where(function ($q) use ($flavorName) {
                    $q->where('name', 'like', '%'.$flavorName.'%')
                        ->orWhere('name', 'like', '%'.Str::before($flavorName, ' ').'%');
                })
                ->whereIn('category', ['powder', 'syrups', 'other'])
                ->orderBy('id')
                ->first();

            if ($match) {
                $this->applyStockOut($match, $qty * 0.05, $saleId, $userId, "Sale flavor: {$flavorName}");
            }
        }
    }

    private function applyStockOut(Inventory $item, float $qty, int $saleId, int $userId, string $notes): void
    {
        $item->quantity = max(0, (float) $item->quantity - $qty);
        $item->save();

        InventoryLog::create([
            'inventory_id' => $item->id,
            'type' => 'out',
            'quantity' => $qty,
            'reference_type' => Sale::class,
            'reference_id' => $saleId,
            'notes' => $notes,
            'user_id' => $userId,
        ]);
    }
}
