<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class LocationController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('locations')) {
                return response()->json([]);
            }

            $locations = Location::with('branch')
                ->orderBy('name')
                ->get()
                ->map(function ($location) {
                    return [
                        'id' => $location->id,
                        'branch_id' => $location->branch_id,
                        'name' => $location->name,
                        'branch' => $location->branch ? $location->branch->name : 'N/A',
                        'description' => $location->description,
                        'latitude' => $location->latitude,
                        'longitude' => $location->longitude,
                        'created_at' => $location->created_at,
                    ];
                });
            
            return response()->json($locations);
        } catch (\Exception $e) {
            Log::error('Error fetching locations: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch locations'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'branch_id' => 'required|exists:branches,id',
                'description' => 'nullable|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $location = Location::create($validated);

            return response()->json($location->load('branch'), 201);
        } catch (\Exception $e) {
            Log::error('Error creating location: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create location', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $location = Location::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'branch_id' => 'required|exists:branches,id',
                'description' => 'nullable|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            $location->update($validated);

            return response()->json($location->load('branch'));
        } catch (\Exception $e) {
            Log::error('Error updating location: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update location', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $location = Location::findOrFail($id);
            
            // Check if location has devices
            if ($location->devices()->count() > 0) {
                return response()->json(['error' => 'Cannot delete location with existing devices'], 400);
            }

            $location->delete();

            return response()->json(['message' => 'Location deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting location: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete location', 'message' => $e->getMessage()], 500);
        }
    }
}
