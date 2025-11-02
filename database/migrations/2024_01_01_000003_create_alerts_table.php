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
            $table->string('type')->nullable();
            $table->string('severity')->default('medium');
            $table->string('category');
            $table->string('title')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('active');
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('triggered_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->string('acknowledged_by')->nullable();
            $table->text('reason')->nullable();
            $table->string('downtime')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['device_id', 'acknowledged']);
            $table->index(['status', 'severity']);
            $table->index('triggered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};