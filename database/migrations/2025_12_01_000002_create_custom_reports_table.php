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
        Schema::create('custom_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('report_type')->default('custom'); // e.g., 'uptime', 'sla', 'incidents', 'comprehensive', 'custom'
            $table->json('categories')->nullable(); // JSON array of categories
            $table->foreignId('managed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('included_fields')->nullable(); // JSON array of field IDs
            $table->json('included_metrics')->nullable(); // JSON array of metric IDs
            $table->json('filters')->nullable(); // JSON object with filter configuration
            $table->json('summary_config')->nullable(); // JSON object with summary configuration
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_reports');
    }
};

