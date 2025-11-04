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
            $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('set null');
            $table->foreignId('model_id')->nullable()->constrained('hardware_models')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['brand_id', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hardware_details');
    }
};
