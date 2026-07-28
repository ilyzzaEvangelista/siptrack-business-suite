<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $todaySales = (float) Sale::whereDate('sold_at', $today)->sum('total');
        $monthlySales = (float) Sale::where('sold_at', '>=', $monthStart)->sum('total');
        $totalProfit = (float) Sale::sum('profit');
        $monthlyExpenses = (float) Expense::where('expense_date', '>=', $monthStart->toDateString())->sum('amount');
        $totalExpenses = (float) Expense::sum('amount');

        $topFlavor = SaleItem::query()
            ->select('flavor_id', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(line_total) as revenue'))
            ->whereNotNull('flavor_id')
            ->with('flavor:id,name')
            ->groupBy('flavor_id')
            ->orderByDesc('qty')
            ->first();

        $bestSize = SaleItem::query()
            ->select('size_id', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(line_total) as revenue'))
            ->whereNotNull('size_id')
            ->with('size:id,name')
            ->groupBy('size_id')
            ->orderByDesc('qty')
            ->first();

        $days = (int) $request->query('days', 7);
        $days = in_array($days, [7, 30], true) ? $days : 7;

        $chartStart = Carbon::today()->subDays($days - 1);
        $salesChart = Sale::query()
            ->select(DB::raw('DATE(sold_at) as date'), DB::raw('SUM(total) as total'), DB::raw('SUM(profit) as profit'))
            ->where('sold_at', '>=', $chartStart)
            ->groupBy(DB::raw('DATE(sold_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $chartStart->copy()->addDays($i)->toDateString();
            $row = $salesChart->get($date);
            $chart[] = [
                'date' => $date,
                'total' => $row ? (float) $row->total : 0,
                'profit' => $row ? (float) $row->profit : 0,
            ];
        }

        return response()->json([
            'today_sales' => $todaySales,
            'monthly_sales' => $monthlySales,
            'total_profit' => $totalProfit,
            'monthly_expenses' => $monthlyExpenses,
            'total_expenses' => $totalExpenses,
            'net_profit' => $totalProfit - $totalExpenses,
            'top_flavor' => $topFlavor,
            'best_size' => $bestSize,
            'sales_chart' => $chart,
            'chart_days' => $days,
        ]);
    }
}
