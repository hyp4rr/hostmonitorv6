<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('type'); // offline, high_response_time, threshold_exceeded
            $table->enum('severity', ['info', 'warning', 'critical'])->default('warning');
            $table->string('title');
            $table->text('message');
            $table->enum('status', ['active', 'acknowledged', 'resolved'])->default('active');
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            $table->string('acknowledged_by')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'severity']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
