<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::query()->orderBy('name');

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }
        if ($request->boolean('low_stock')) {
            $query->whereColumn('quantity', '<=', 'reorder_level');
        }

        return response()->json($query->with('logs')->paginate((int) $request->query('per_page', 50)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:powder,cups,lids,straws,ice,sugar,water,syrups,other'],
            'unit' => ['required', 'string', 'max:50'],
            'quantity' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $item = Inventory::create([
            ...$data,
            'quantity' => $data['quantity'] ?? 0,
            'reorder_level' => $data['reorder_level'] ?? 0,
            'unit_cost' => $data['unit_cost'] ?? 0,
        ]);

        if (($data['quantity'] ?? 0) > 0) {
            InventoryLog::create([
                'inventory_id' => $item->id,
                'type' => 'in',
                'quantity' => $data['quantity'],
                'notes' => 'Initial stock',
                'user_id' => $request->user()->id,
            ]);
        }

        return response()->json($item, 201);
    }

    public function update(Request $request, Inventory $inventory): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'in:powder,cups,lids,straws,ice,sugar,water,syrups,other'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'reorder_level' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $inventory->update($data);

        return response()->json($inventory);
    }

    public function adjust(Request $request, Inventory $inventory): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'notes' => ['nullable', 'string'],
        ]);

        $item = DB::transaction(function () use ($data, $request, $inventory) {
            $qty = (float) $data['quantity'];
            $current = (float) $inventory->quantity;

            if ($data['type'] === 'in') {
                $inventory->quantity = $current + $qty;
            } elseif ($data['type'] === 'out') {
                $inventory->quantity = max(0, $current - $qty);
            } else {
                $inventory->quantity = $qty;
            }

            $inventory->save();

            InventoryLog::create([
                'inventory_id' => $inventory->id,
                'type' => $data['type'],
                'quantity' => $qty,
                'notes' => $data['notes'] ?? null,
                'user_id' => $request->user()->id,
            ]);

            return $inventory->fresh('logs');
        });

        return response()->json($item);
    }

    public function destroy(Inventory $inventory): JsonResponse
    {
        $inventory->logs()->delete();
        $inventory->delete();

        return response()->json(['message' => 'Inventory item deleted.']);
    }
}
