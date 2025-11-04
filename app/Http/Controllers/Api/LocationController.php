<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Location::with('branch')->orderBy('id', 'asc');
            
            // Filter by branch if provided
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }
            
            $locations = $query->get();
            return response()->json($locations);
        } catch (\Exception $e) {
            Log::error('Error fetching locations: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch locations'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'branch_id' => 'required|exists:branches,id',
                'description' => 'nullable|string|max:1000',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $location = Location::create([
                'name' => $request->name,
                'branch_id' => $request->branch_id,
                'description' => $request->description,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            return response()->json($location->load('branch'), 201);
        } catch (\Exception $e) {
            Log::error('Error creating location: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create location', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $location = Location::with('branch')->findOrFail($id);
            return response()->json($location);
        } catch (\Exception $e) {
            Log::error('Error fetching location: ' . $e->getMessage());
            return response()->json(['error' => 'Location not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $location = Location::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'branch_id' => 'sometimes|required|exists:branches,id',
                'description' => 'nullable|string|max:1000',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            if ($request->has('name')) $location->name = $request->name;
            if ($request->has('branch_id')) $location->branch_id = $request->branch_id;
            if ($request->has('description')) $location->description = $request->description;
            if ($request->has('latitude')) $location->latitude = $request->latitude;
            if ($request->has('longitude')) $location->longitude = $request->longitude;

            $location->save();

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
            
            // Check if location has associated devices
            $deviceCount = $location->devices()->count();
            if ($deviceCount > 0) {
                return response()->json([
                    'error' => "Cannot delete location with {$deviceCount} associated devices. Reassign devices first."
                ], 409);
            }

            $location->delete();

            return response()->json(['message' => 'Location deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting location: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete location'], 500);
        }
    }
}