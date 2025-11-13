<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('device_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('notification_type')->default('offline'); // offline, online, warning
            $table->string('recipient_email');
            $table->timestamp('sent_at');
            $table->timestamps();
            
            // Index for faster lookups
            $table->index(['device_id', 'notification_type', 'sent_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_notifications');
    }
};
