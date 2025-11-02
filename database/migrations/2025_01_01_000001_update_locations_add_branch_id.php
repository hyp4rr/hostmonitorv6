<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            // Drop old branch column if exists
            if (Schema::hasColumn('locations', 'branch')) {
                $table->dropColumn('branch');
            }
            
            // Add branch_id foreign key
            if (!Schema::hasColumn('locations', 'branch_id')) {
                $table->foreignId('branch_id')->after('id')->constrained('branches')->onDelete('cascade');
            }
            
            // Make latitude and longitude required
            $table->decimal('latitude', 10, 8)->nullable(false)->change();
            $table->decimal('longitude', 11, 8)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
            $table->string('branch')->nullable();
        });
    }
};
