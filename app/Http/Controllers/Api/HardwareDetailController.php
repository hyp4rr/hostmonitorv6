<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HardwareDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HardwareDetailController extends Controller
{
    public function manufacturers()
    {
        try {
            $manufacturers = HardwareDetail::distinct()
                ->whereNotNull('manufacturer')
                ->pluck('manufacturer')
                ->sort()
                ->values();

            return response()->json($manufacturers);
        } catch (\Exception $e) {
            Log::error('Error fetching manufacturers: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    public function models()
    {
        try {
            $models = HardwareDetail::distinct()
                ->whereNotNull('model')
                ->pluck('model')
                ->sort()
                ->values();

            return response()->json($models);
        } catch (\Exception $e) {
            Log::error('Error fetching models: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }
}
