<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at']));
    }

    public function store(Request $request): JsonResponse
    {
        if (! $request->user()->isOwnerOrAdmin()) {
            return response()->json(['message' => 'Only owner or admin can create users.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'in:owner,cashier,admin'],
        ]);

        $user = User::create($data);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'created_at']), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->isOwnerOrAdmin() && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $rules = [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['sometimes', Password::defaults()],
        ];

        if ($request->user()->isOwnerOrAdmin()) {
            $rules['role'] = ['sometimes', 'in:owner,cashier,admin'];
        }

        $data = $request->validate($rules);
        $user->update($data);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'created_at']));
    }
}
