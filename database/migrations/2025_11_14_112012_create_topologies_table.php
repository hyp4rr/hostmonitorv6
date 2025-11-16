<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topologies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('canvas_data'); // Stores nodes and edges for the topology
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['branch_id', 'is_active']);
        });

        // Pivot table for topology devices (many-to-many relationship)
        Schema::create('topology_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topology_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('node_id'); // ID used in the canvas
            $table->decimal('position_x', 10, 2)->default(0);
            $table->decimal('position_y', 10, 2)->default(0);
            $table->json('node_data')->nullable(); // Additional node configuration
            $table->timestamps();
            
            $table->unique(['topology_id', 'node_id']);
            $table->index(['topology_id', 'device_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topology_devices');
        Schema::dropIfExists('topologies');
    }
};
