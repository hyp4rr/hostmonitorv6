<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Add hardware_detail_id foreign key
            $table->foreignId('hardware_detail_id')->nullable()->after('location_id')->constrained('hardware_details')->nullOnDelete();
            
            // Remove old manufacturer and model columns if they exist
            if (Schema::hasColumn('devices', 'manufacturer')) {
                $table->dropColumn('manufacturer');
            }
            if (Schema::hasColumn('devices', 'model')) {
                $table->dropColumn('model');
            }
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['hardware_detail_id']);
            $table->dropColumn('hardware_detail_id');
            
            // Restore old columns
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
        });
    }
};
