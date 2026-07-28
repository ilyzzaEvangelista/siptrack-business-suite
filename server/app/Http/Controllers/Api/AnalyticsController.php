<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function revenueChart(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $start = Carbon::today()->subDays(max(1, $days) - 1);

        $rows = Sale::query()
            ->select(DB::raw('DATE(sold_at) as date'), DB::raw('SUM(total) as revenue'))
            ->where('sold_at', '>=', $start)
            ->groupBy(DB::raw('DATE(sold_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();
            $chart[] = [
                'date' => $date,
                'revenue' => $rows->has($date) ? (float) $rows->get($date)->revenue : 0,
            ];
        }

        return response()->json($chart);
    }

    public function profitChart(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $start = Carbon::today()->subDays(max(1, $days) - 1);

        $rows = Sale::query()
            ->select(DB::raw('DATE(sold_at) as date'), DB::raw('SUM(profit) as profit'))
            ->where('sold_at', '>=', $start)
            ->groupBy(DB::raw('DATE(sold_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();
            $chart[] = [
                'date' => $date,
                'profit' => $rows->has($date) ? (float) $rows->get($date)->profit : 0,
            ];
        }

        return response()->json($chart);
    }

    public function bestSellers(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 10);

        $items = SaleItem::query()
            ->select(
                'item_name',
                'flavor_id',
                'size_id',
                DB::raw('SUM(quantity) as qty_sold'),
                DB::raw('SUM(line_total) as revenue'),
                DB::raw('SUM(line_profit) as profit')
            )
            ->with(['flavor:id,name', 'size:id,name'])
            ->groupBy('item_name', 'flavor_id', 'size_id')
            ->orderByDesc('qty_sold')
            ->limit($limit)
            ->get();

        return response()->json($items);
    }

    public function slowMoving(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 10);
        $days = (int) $request->query('days', 30);
        $since = Carbon::now()->subDays($days);

        $items = SaleItem::query()
            ->select(
                'item_name',
                'flavor_id',
                'size_id',
                DB::raw('SUM(quantity) as qty_sold'),
                DB::raw('SUM(line_total) as revenue')
            )
            ->where('created_at', '>=', $since)
            ->with(['flavor:id,name', 'size:id,name'])
            ->groupBy('item_name', 'flavor_id', 'size_id')
            ->orderBy('qty_sold')
            ->limit($limit)
            ->get();

        return response()->json($items);
    }

    public function inventoryUsage(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $since = Carbon::now()->subDays($days);

        $usage = InventoryLog::query()
            ->select(
                'inventory_id',
                DB::raw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as qty_out"),
                DB::raw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as qty_in")
            )
            ->where('created_at', '>=', $since)
            ->with('inventory:id,name,category,unit,quantity')
            ->groupBy('inventory_id')
            ->orderByDesc('qty_out')
            ->get();

        $lowStock = Inventory::whereColumn('quantity', '<=', 'reorder_level')->get();

        return response()->json([
            'usage' => $usage,
            'low_stock' => $lowStock,
            'period_days' => $days,
        ]);
    }
}
