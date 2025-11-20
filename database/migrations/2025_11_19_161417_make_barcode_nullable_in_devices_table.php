<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Drop the unique index first (PostgreSQL requires this)
            $table->dropUnique(['barcode']);
        });
        
        // Use raw SQL to alter the column to nullable
        DB::statement('ALTER TABLE devices ALTER COLUMN barcode DROP NOT NULL');
        
        Schema::table('devices', function (Blueprint $table) {
            // Re-add unique index (PostgreSQL allows multiple NULLs in unique columns)
            $table->unique('barcode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Drop unique index
            $table->dropUnique(['barcode']);
        });
        
        // Set column back to NOT NULL (only if no NULL values exist)
        DB::statement('ALTER TABLE devices ALTER COLUMN barcode SET NOT NULL');
        
        Schema::table('devices', function (Blueprint $table) {
            // Re-add unique index
            $table->unique('barcode');
        });
    }
};
