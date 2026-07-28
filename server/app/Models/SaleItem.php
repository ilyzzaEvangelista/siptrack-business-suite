<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'flavor_id',
        'size_id',
        'item_name',
        'quantity',
        'unit_price',
        'unit_cost',
        'discount',
        'line_total',
        'line_cost',
        'line_profit',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'line_total' => 'decimal:2',
            'line_cost' => 'decimal:2',
            'line_profit' => 'decimal:2',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
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
