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
        // Devices table
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ip_address');
            $table->string('type'); // switch, server, router, firewall, etc.
            $table->string('category')->nullable();
            $table->string('status')->default('unknown'); // up, down, warning, unknown
            $table->string('location')->nullable();
            $table->string('building')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->integer('priority')->default(5);
            $table->float('uptime_percentage')->default(0);
            $table->integer('response_time')->nullable(); // in ms
            $table->boolean('is_monitored')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_check')->nullable();
            $table->timestamps();
        });

        // Alerts table
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('type'); // ping_failed, high_cpu, high_memory, etc.
            $table->string('severity'); // critical, warning, info
            $table->string('title');
            $table->text('message');
            $table->string('status')->default('open'); // open, acknowledged, resolved, closed
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            $table->string('acknowledged_by')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // Monitoring history table
        Schema::create('monitoring_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('status'); // up, down, warning
            $table->integer('response_time')->nullable();
            $table->float('cpu_usage')->nullable();
            $table->float('memory_usage')->nullable();
            $table->float('disk_usage')->nullable();
            $table->timestamp('checked_at');
            $table->timestamps();
            
            $table->index(['device_id', 'checked_at']);
        });

        // Device statistics table
        Schema::create('device_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->float('avg_response_time')->nullable();
            $table->float('uptime_percentage')->default(100);
            $table->integer('total_checks')->default(0);
            $table->integer('failed_checks')->default(0);
            $table->timestamps();
            
            $table->unique(['device_id', 'date']);
        });

        // Maintenance schedules table
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed, cancelled
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        // Device notes table
        Schema::create('device_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->text('note');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_notes');
        Schema::dropIfExists('maintenance_schedules');
        Schema::dropIfExists('device_statistics');
        Schema::dropIfExists('monitoring_history');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('devices');
    }
};
