<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    protected $table = 'inventory';

    protected $fillable = [
        'name',
        'category',
        'unit',
        'quantity',
        'reorder_level',
        'unit_cost',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'unit_cost' => 'decimal:2',
        ];
    }

    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
