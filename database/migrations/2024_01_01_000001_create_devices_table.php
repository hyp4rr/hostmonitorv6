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
            $table->foreignId('branch_id')->default(1)->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('ip_address')->unique();
            $table->string('type'); // switch, server, router, firewall, wifi, access_point
            $table->string('category')->default('other');
            $table->enum('status', ['online', 'offline', 'warning', 'unknown'])->default('unknown');
            $table->string('location')->nullable();
            $table->string('building')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->integer('priority')->default(3); // 1=critical, 2=high, 3=normal, 4=low
            $table->decimal('uptime_percentage', 5, 2)->default(0);
            $table->integer('response_time')->nullable(); // in milliseconds
            $table->boolean('is_monitored')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_check')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'is_active']);
            $table->index('type');
            $table->index('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
