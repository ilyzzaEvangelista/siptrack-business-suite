<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // powder|cups|lids|straws|ice|sugar|water|syrups|other
            $table->string('unit');
            $table->decimal('quantity', 12, 3)->default(0);
            $table->decimal('reorder_level', 12, 3)->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
