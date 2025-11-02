<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
            
            $table->unique(['brand_id', 'name']);
        });

        // Insert common brands
        DB::table('brands')->insert([
            ['name' => 'Cisco', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'HP', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Dell', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Juniper', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Aruba', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ubiquiti', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'TP-Link', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Netgear', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'D-Link', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lenovo', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert common models for Cisco
        $ciscoId = DB::table('brands')->where('name', 'Cisco')->value('id');
        DB::table('models')->insert([
            ['brand_id' => $ciscoId, 'name' => 'Catalyst 2960', 'created_at' => now(), 'updated_at' => now()],
            ['brand_id' => $ciscoId, 'name' => 'Catalyst 3750', 'created_at' => now(), 'updated_at' => now()],
            ['brand_id' => $ciscoId, 'name' => 'Catalyst 9300', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('models');
        Schema::dropIfExists('brands');
    }
};
