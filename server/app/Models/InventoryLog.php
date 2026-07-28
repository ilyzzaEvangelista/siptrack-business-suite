<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLog extends Model
{
    protected $fillable = [
        'inventory_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
        ];
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
