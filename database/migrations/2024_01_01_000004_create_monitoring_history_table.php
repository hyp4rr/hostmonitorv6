<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->integer('response_time')->nullable();
            $table->timestamp('checked_at');
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['device_id', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_history');
    }
};