<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('user:id,name')->orderByDesc('expense_date');

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }
        if ($request->filled('from')) {
            $query->whereDate('expense_date', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('expense_date', '<=', $request->query('to'));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category' => ['required', 'in:rent,electricity,ice,transportation,supplies,miscellaneous'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
        ]);

        $expense = Expense::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($expense->load('user:id,name'), 201);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $data = $request->validate([
            'category' => ['sometimes', 'in:rent,electricity,ice,transportation,supplies,miscellaneous'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'expense_date' => ['sometimes', 'date'],
        ]);

        $expense->update($data);

        return response()->json($expense->load('user:id,name'));
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['message' => 'Expense deleted.']);
    }
}
