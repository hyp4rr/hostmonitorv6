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
            $table->foreignId('managed_by')->nullable()->after('barcode')->constrained('users')->onDelete('set null');
            $table->string('serial_number')->nullable()->after('managed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['managed_by']);
            $table->dropColumn(['managed_by', 'serial_number']);
        });
    }
};
