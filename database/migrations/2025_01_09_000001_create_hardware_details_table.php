<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hardware_details', function (Blueprint $table) {
            $table->id();
            $table->string('manufacturer');
            $table->string('model');
            $table->timestamps();
            
            // Add unique constraint on manufacturer + model combination
            $table->unique(['manufacturer', 'model']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hardware_details');
    }
};
