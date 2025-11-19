<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('floors', function (Blueprint $table) {
            $table->id();
            // Optional link to an existing location/building context
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->string('name');
            $table->integer('level')->nullable(); // e.g., 1, 2, 3 or -1 for basement
            $table->string('plan_image_path')->nullable(); // storage path to the floor plan image
            $table->timestamps();

            $table->index(['branch_id', 'location_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('floors');
    }
};


