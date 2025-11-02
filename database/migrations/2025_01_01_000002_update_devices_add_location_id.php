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
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
            $table->integer('priority')->default(5);
            $table->boolean('is_monitored')->default(true);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
        });
    }
};
