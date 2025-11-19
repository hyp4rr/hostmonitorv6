<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_positions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id');
            $table->unsignedBigInteger('floor_id');
            // Normalized coordinates (0..1) relative to the floor plan image dimensions
            $table->decimal('x', 6, 4)->default(0.0);
            $table->decimal('y', 6, 4)->default(0.0);
            // Optional: subtype like 'wifi', 'switch', etc. falls back to device category
            $table->string('marker_type')->nullable();
            $table->timestamps();

            $table->unique(['device_id', 'floor_id']);
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
            $table->foreign('floor_id')->references('id')->on('floors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_positions');
    }
};


