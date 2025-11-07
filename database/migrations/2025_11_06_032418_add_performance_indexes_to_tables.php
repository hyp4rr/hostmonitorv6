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
        // Devices table - composite indexes for common queries
        Schema::table('devices', function (Blueprint $table) {
            $table->index(['branch_id', 'status', 'is_active'], 'idx_devices_branch_status_active');
            $table->index(['branch_id', 'category'], 'idx_devices_branch_category');
            $table->index(['status', 'is_active'], 'idx_devices_status_active');
            $table->index('last_ping', 'idx_devices_last_ping');
        });

        // Alerts table - indexes for filtering and sorting
        Schema::table('alerts', function (Blueprint $table) {
            $table->index(['device_id', 'status'], 'idx_alerts_device_status');
            $table->index(['status', 'severity'], 'idx_alerts_status_severity');
            $table->index('triggered_at', 'idx_alerts_triggered_at');
        });

        // Monitoring history - critical for report performance
        Schema::table('monitoring_history', function (Blueprint $table) {
            $table->index(['device_id', 'status', 'checked_at'], 'idx_monitoring_device_status_time');
            $table->index('status', 'idx_monitoring_status');
        });

        // Activity logs - for recent activity queries
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['branch_id', 'created_at'], 'idx_activity_branch_time');
            $table->index('created_at', 'idx_activity_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Devices table
        Schema::table('devices', function (Blueprint $table) {
            $table->dropIndex('idx_devices_branch_status_active');
            $table->dropIndex('idx_devices_branch_category');
            $table->dropIndex('idx_devices_status_active');
            $table->dropIndex('idx_devices_last_ping');
        });

        // Alerts table
        Schema::table('alerts', function (Blueprint $table) {
            $table->dropIndex('idx_alerts_device_status');
            $table->dropIndex('idx_alerts_status_severity');
            $table->dropIndex('idx_alerts_triggered_at');
        });

        // Monitoring history
        Schema::table('monitoring_history', function (Blueprint $table) {
            $table->dropIndex('idx_monitoring_device_status_time');
            $table->dropIndex('idx_monitoring_status');
        });

        // Activity logs
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_branch_time');
            $table->dropIndex('idx_activity_created_at');
        });
    }
};
