<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Size::query()->orderBy('price');

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'volume_ml' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $size = Size::create([
            ...$data,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json($size, 201);
    }

    public function update(Request $request, Size $size): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'volume_ml' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $size->update($data);

        return response()->json($size);
    }
}
