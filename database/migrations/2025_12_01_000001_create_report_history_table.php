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
        Schema::create('report_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('report_name');
            $table->string('report_type'); // e.g., 'uptime', 'sla', 'incidents', 'comprehensive', or custom report name
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->json('categories')->nullable(); // Store as JSON array
            $table->foreignId('managed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('email_sent_to')->nullable();
            $table->string('file_path'); // Path to the generated XLSX file
            $table->unsignedBigInteger('file_size')->nullable(); // Size in bytes
            $table->json('summary_stats')->nullable(); // Store summary statistics as JSON
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_histories');
    }
};

