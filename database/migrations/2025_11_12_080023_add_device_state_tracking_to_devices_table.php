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
        Schema::table('devices', function (Blueprint $table) {
            $table->timestamp('last_status_change')->nullable()->after('offline_since');
            $table->string('previous_status')->nullable()->after('last_status_change');
            $table->timestamp('last_notification_sent')->nullable()->after('offline_alert_sent');
            $table->boolean('daily_digest_sent')->default(false)->after('last_notification_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn([
                'last_status_change',
                'previous_status', 
                'last_notification_sent',
                'daily_digest_sent'
            ]);
        });
    }
};
