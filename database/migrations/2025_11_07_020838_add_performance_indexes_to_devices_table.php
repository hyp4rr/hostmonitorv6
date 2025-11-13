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
        // Use raw SQL to create indexes if they don't exist (PostgreSQL syntax)
        DB::statement('CREATE INDEX IF NOT EXISTS idx_devices_branch_active_status ON devices (branch_id, is_active, status)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_devices_category_status ON devices (category, status)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_devices_last_ping ON devices (last_ping)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_devices_ip_address ON devices (ip_address)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropIndex('idx_devices_branch_active_status');
            $table->dropIndex('idx_devices_category_status');
            $table->dropIndex('idx_devices_status_active');
            $table->dropIndex('idx_devices_last_ping');
            $table->dropIndex('idx_devices_ip_address');
        });
    }
};
