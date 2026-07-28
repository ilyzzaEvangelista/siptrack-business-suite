<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('flavor_id')->nullable()->constrained('flavors')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('sizes')->nullOnDelete();
            $table->string('item_name');
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->decimal('line_cost', 12, 2)->default(0);
            $table->decimal('line_profit', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
