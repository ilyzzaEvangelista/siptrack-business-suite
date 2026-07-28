<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query()->orderBy('group')->orderBy('key');

        if ($request->filled('group')) {
            $query->where('group', $request->query('group'));
        }

        return response()->json($query->get());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array', 'min:1'],
            'settings.*.key' => ['required', 'string', 'max:255'],
            'settings.*.value' => ['nullable', 'string'],
            'settings.*.group' => ['nullable', 'string', 'max:100'],
        ]);

        $updated = [];

        foreach ($data['settings'] as $row) {
            $setting = Setting::updateOrCreate(
                ['key' => $row['key']],
                [
                    'value' => $row['value'] ?? null,
                    'group' => $row['group'] ?? 'general',
                ]
            );
            $updated[] = $setting;
        }

        return response()->json($updated);
    }
}
