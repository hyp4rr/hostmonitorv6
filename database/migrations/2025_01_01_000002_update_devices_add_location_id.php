<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Add location_id foreign key
            if (!Schema::hasColumn('devices', 'location_id')) {
                $table->foreignId('location_id')->nullable()->after('branch_id')->constrained('locations')->onDelete('set null');
            }
            
            // Add hardware_detail_id foreign key
            if (!Schema::hasColumn('devices', 'hardware_detail_id')) {
                $table->foreignId('hardware_detail_id')->nullable()->after('location_id')->constrained('hardware_details')->onDelete('set null');
            }
            
            // Remove priority column if exists
            if (Schema::hasColumn('devices', 'priority')) {
                $table->dropColumn('priority');
            }
            
            // Remove is_monitored column if exists
            if (Schema::hasColumn('devices', 'is_monitored')) {
                $table->dropColumn('is_monitored');
            }
            
            // Remove latitude and longitude from devices (now in locations)
            if (Schema::hasColumn('devices', 'latitude')) {
                $table->dropColumn(['latitude', 'longitude']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            if (Schema::hasColumn('devices', 'location_id')) {
                $table->dropForeign(['location_id']);
                $table->dropColumn('location_id');
            }
            if (Schema::hasColumn('devices', 'hardware_detail_id')) {
                $table->dropForeign(['hardware_detail_id']);
                $table->dropColumn('hardware_detail_id');
            }
        });
    }
};
