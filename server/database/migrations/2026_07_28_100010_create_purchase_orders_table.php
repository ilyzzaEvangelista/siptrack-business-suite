<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('item_name');
            $table->foreignId('inventory_id')->nullable()->constrained('inventory')->nullOnDelete();
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->string('status')->default('pending'); // pending|ordered|received|cancelled
            $table->dateTime('ordered_at')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
