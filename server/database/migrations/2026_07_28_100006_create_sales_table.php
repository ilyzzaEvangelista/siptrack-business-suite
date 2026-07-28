<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->string('customer_name')->nullable();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('cost_total', 12, 2)->default(0);
            $table->decimal('profit', 12, 2)->default(0);
            $table->string('payment_method'); // cash|gcash|maya|card
            $table->string('payment_status')->default('paid');
            $table->dateTime('sold_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
