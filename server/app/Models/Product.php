<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'name',
        'type',
        'flavor_id',
        'size_id',
        'price',
        'cost',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function flavor(): BelongsTo
    {
        return $this->belongsTo(Flavor::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }
}
