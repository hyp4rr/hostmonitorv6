<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BrandController extends Controller
{
    public function index()
    {
        try {
            $brands = Brand::orderBy('name', 'asc')->get();
            return response()->json($brands);
        } catch (\Exception $e) {
            Log::error('Error fetching brands: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch brands'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:brands,name',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $brand = Brand::create([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logBrandCreated($brand->id, $brand->name);

            return response()->json($brand, 201);
        } catch (\Exception $e) {
            Log::error('Error creating brand: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create brand'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:brands,name,' . $id,
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            if ($request->has('name')) $brand->name = $request->name;
            if ($request->has('description')) $brand->description = $request->description;

            // Track changes with before/after values
            $changes = [];
            $dirty = $brand->getDirty();
            foreach ($dirty as $field => $newValue) {
                $changes[$field] = [
                    'old' => $brand->getOriginal($field),
                    'new' => $newValue
                ];
            }
            $brand->save();

            // Log activity
            if (!empty($changes)) {
                $activityLog = new ActivityLogService();
                $activityLog->logBrandUpdated($brand->id, $brand->name, $changes);
            }

            return response()->json($brand);
        } catch (\Exception $e) {
            Log::error('Error updating brand: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update brand'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            
            // Check if brand has associated hardware models
            $modelCount = $brand->hardwareModels()->count();
            if ($modelCount > 0) {
                return response()->json([
                    'error' => "Cannot delete brand with {$modelCount} associated models. Delete models first."
                ], 409);
            }

            // Store info before deletion
            $brandName = $brand->name;
            
            $brand->delete();

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logBrandDeleted($id, $brandName);

            return response()->json(['message' => 'Brand deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting brand: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete brand'], 500);
        }
    }
}