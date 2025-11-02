<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HardwareDetail;
use Illuminate\Support\Facades\Log;

class HardwareDetailController extends Controller
{
    public function manufacturers()
    {
        try {
            $manufacturers = HardwareDetail::distinct()
                ->orderBy('manufacturer')
                ->pluck('manufacturer');
            
            return response()->json($manufacturers);
        } catch (\Exception $e) {
            Log::error('Error fetching manufacturers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch manufacturers'], 500);
        }
    }

    public function models()
    {
        try {
            $models = HardwareDetail::distinct()
                ->orderBy('model')
                ->pluck('model');
            
            return response()->json($models);
        } catch (\Exception $e) {
            Log::error('Error fetching models: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch models'], 500);
        }
    }
}
