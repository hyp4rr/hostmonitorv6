<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('ip_address')->unique();
            $table->string('mac_address')->nullable();
            $table->string('barcode')->unique();
            $table->string('type');
            $table->string('category')->default('switches');
            $table->string('status')->default('offline');
            $table->string('location')->nullable();
            $table->string('building')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->integer('priority')->default(3);
            $table->decimal('uptime_percentage', 5, 2)->default(0);
            $table->integer('response_time')->nullable();
            $table->boolean('is_monitored')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_check')->nullable();
            $table->text('offline_reason')->nullable();
            $table->string('offline_acknowledged_by')->nullable();
            $table->timestamp('offline_acknowledged_at')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
            
            $table->index(['branch_id', 'status', 'is_active']);
            $table->index('category');
            $table->index('type');
            $table->index('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};