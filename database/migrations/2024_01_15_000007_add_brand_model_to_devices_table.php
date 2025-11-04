<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            if (!Schema::hasColumn('devices', 'brand')) {
                $table->string('brand')->nullable()->after('building');
            }
            if (!Schema::hasColumn('devices', 'model')) {
                $table->string('model')->nullable()->after('brand');
            }
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            if (Schema::hasColumn('devices', 'brand')) {
                $table->dropColumn('brand');
            }
            if (Schema::hasColumn('devices', 'model')) {
                $table->dropColumn('model');
            }
        });
    }
};
