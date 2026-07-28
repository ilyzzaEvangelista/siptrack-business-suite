<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $data = $request->validate([
            'period' => ['required', 'in:daily,weekly,monthly,yearly'],
            'date' => ['nullable', 'date'],
        ]);

        $anchor = isset($data['date']) ? Carbon::parse($data['date']) : Carbon::now();

        [$from, $to] = match ($data['period']) {
            'daily' => [$anchor->copy()->startOfDay(), $anchor->copy()->endOfDay()],
            'weekly' => [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()],
            'monthly' => [$anchor->copy()->startOfMonth(), $anchor->copy()->endOfMonth()],
            'yearly' => [$anchor->copy()->startOfYear(), $anchor->copy()->endOfYear()],
        };

        $revenue = (float) Sale::whereBetween('sold_at', [$from, $to])->sum('total');
        $cost = (float) Sale::whereBetween('sold_at', [$from, $to])->sum('cost_total');
        $grossProfit = (float) Sale::whereBetween('sold_at', [$from, $to])->sum('profit');
        $expenses = (float) Expense::whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->sum('amount');
        $netProfit = $grossProfit - $expenses;
        $salesCount = Sale::whereBetween('sold_at', [$from, $to])->count();

        return response()->json([
            'period' => $data['period'],
            'from' => $from->toDateTimeString(),
            'to' => $to->toDateTimeString(),
            'revenue' => $revenue,
            'cost' => $cost,
            'gross_profit' => $grossProfit,
            'expenses' => $expenses,
            'profit' => $netProfit,
            'sales_count' => $salesCount,
        ]);
    }
}
