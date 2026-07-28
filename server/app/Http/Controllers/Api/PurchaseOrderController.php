<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PurchaseOrder::with(['supplier', 'inventory', 'user:id,name'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'item_name' => ['required', 'string', 'max:255'],
            'inventory_id' => ['nullable', 'exists:inventory,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:pending,ordered,received,cancelled'],
            'ordered_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $qty = (float) $data['quantity'];
        $unitPrice = (float) $data['unit_price'];

        $po = PurchaseOrder::create([
            'po_number' => $this->generatePoNumber(),
            'supplier_id' => $data['supplier_id'],
            'item_name' => $data['item_name'],
            'inventory_id' => $data['inventory_id'] ?? null,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'total_price' => $qty * $unitPrice,
            'status' => $data['status'] ?? 'pending',
            'ordered_at' => $data['ordered_at'] ?? (($data['status'] ?? 'pending') === 'ordered' ? now() : null),
            'notes' => $data['notes'] ?? null,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($po->load(['supplier', 'inventory', 'user:id,name']), 201);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $data = $request->validate([
            'supplier_id' => ['sometimes', 'exists:suppliers,id'],
            'item_name' => ['sometimes', 'string', 'max:255'],
            'inventory_id' => ['nullable', 'exists:inventory,id'],
            'quantity' => ['sometimes', 'numeric', 'min:0.001'],
            'unit_price' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:pending,ordered,received,cancelled'],
            'ordered_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($data['quantity']) || isset($data['unit_price'])) {
            $qty = (float) ($data['quantity'] ?? $purchaseOrder->quantity);
            $unitPrice = (float) ($data['unit_price'] ?? $purchaseOrder->unit_price);
            $data['total_price'] = $qty * $unitPrice;
        }

        if (($data['status'] ?? null) === 'ordered' && ! $purchaseOrder->ordered_at) {
            $data['ordered_at'] = now();
        }

        $purchaseOrder->update($data);

        return response()->json($purchaseOrder->fresh(['supplier', 'inventory', 'user:id,name']));
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if ($purchaseOrder->status === 'received') {
            return response()->json(['message' => 'Purchase order already received.'], 422);
        }

        if ($purchaseOrder->status === 'cancelled') {
            return response()->json(['message' => 'Cannot receive a cancelled purchase order.'], 422);
        }

        $po = DB::transaction(function () use ($request, $purchaseOrder) {
            $purchaseOrder->update([
                'status' => 'received',
                'received_at' => now(),
            ]);

            if ($purchaseOrder->inventory_id) {
                $inventory = Inventory::find($purchaseOrder->inventory_id);
                if ($inventory) {
                    $inventory->quantity = (float) $inventory->quantity + (float) $purchaseOrder->quantity;
                    if ((float) $purchaseOrder->unit_price > 0) {
                        $inventory->unit_cost = $purchaseOrder->unit_price;
                    }
                    $inventory->save();

                    InventoryLog::create([
                        'inventory_id' => $inventory->id,
                        'type' => 'in',
                        'quantity' => $purchaseOrder->quantity,
                        'reference_type' => PurchaseOrder::class,
                        'reference_id' => $purchaseOrder->id,
                        'notes' => "PO received: {$purchaseOrder->po_number}",
                        'user_id' => $request->user()->id,
                    ]);
                }
            }

            return $purchaseOrder->fresh(['supplier', 'inventory', 'user:id,name']);
        });

        return response()->json($po);
    }

    private function generatePoNumber(): string
    {
        do {
            $po = 'PO-'.now()->format('Ymd').'-'.Str::upper(Str::random(4));
        } while (PurchaseOrder::where('po_number', $po)->exists());

        return $po;
    }
}
