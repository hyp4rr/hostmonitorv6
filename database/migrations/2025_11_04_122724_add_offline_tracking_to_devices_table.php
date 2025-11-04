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
            $table->timestamp('offline_since')->nullable()->after('last_ping');
            $table->integer('offline_duration_minutes')->default(0)->after('offline_since');
            $table->boolean('offline_alert_sent')->default(false)->after('offline_duration_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['offline_since', 'offline_duration_minutes', 'offline_alert_sent']);
        });
    }
};
