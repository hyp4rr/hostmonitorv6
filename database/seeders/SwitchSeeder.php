<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SwitchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing switches from devices table
        Device::where('category', 'switch')->delete();
        
        // Load switch data from JSON file
        $jsonPath = database_path('seeders/data/switches.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Switch data file not found: {$jsonPath}");
            return;
        }
        
        $switchData = json_decode(File::get($jsonPath), true);
        
        if (empty($switchData)) {
            $this->command->warning("No switch data found in JSON file");
            return;
        }
        
        // Get default branch (you may want to make this configurable)
        $defaultBranch = DB::table('branches')->first();
        if (!$defaultBranch) {
            $this->command->error("No branch found. Please create a branch first.");
            return;
        }
        
        $imported = 0;
        $skipped = 0;
        
        foreach ($switchData as $switch) {
            try {
                // Extract location and building from name
                $building = $this->extractBuilding($switch['name']);
                $location = $this->extractLocation($switch['name']);
                
                Device::create([
                    'branch_id' => $defaultBranch->id,
                    'name' => $switch['name'],
                    'ip_address' => $switch['ip_address'],
                    'mac_address' => null,
                    'barcode' => 'SW-' . strtoupper(uniqid()),
                    'category' => 'switch',
                    'status' => 'offline', // Will be updated by ping jobs
                    'building' => $building,
                    'uptime_percentage' => 0,
                    'response_time' => null,
                    'is_active' => true,
                    'last_ping' => null,
                    'offline_reason' => null,
                    'offline_acknowledged_by' => null,
                    'offline_acknowledged_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $imported++;
            } catch (\Exception $e) {
                $this->command->error("Error importing switch {$switch['name']}: {$e->getMessage()}");
                $skipped++;
            }
        }
        
        $this->command->info("✅ Switch import complete:");
        $this->command->info("   Imported: {$imported} switches");
        $this->command->info("   Skipped: {$skipped} switches");
        $this->command->info("   Total processed: " . ($imported + $skipped));
    }
    
    /**
     * Extract building from switch name
     */
    private function extractBuilding(string $name): string
    {
        // Common patterns for building extraction
        if (preg_match('/^([A-Z])\d+/', $name, $matches)) {
            return $matches[1];
        }
        
        if (preg_match('/^([A-Z])\s/', $name, $matches)) {
            return $matches[1];
        }
        
        return 'Unknown';
    }
    
    /**
     * Extract location from switch name
     */
    private function extractLocation(string $name): string
    {
        // Common patterns for location extraction
        $patterns = [
            '/(A\d+[A-Z]*\s*[^-]*)/',
            '/(B\d+[A-Z]*\s*[^-]*)/',
            '/(C\d+[A-Z]*\s*[^-]*)/',
            '/(D\d+[A-Z]*\s*[^-]*)/',
            '/(E\d+[A-Z]*\s*[^-]*)/',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $name, $matches)) {
                return trim($matches[1]);
            }
        }
        
        return $name; // Return full name if no pattern matches
    }
}
