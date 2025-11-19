<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HardwareModel;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class HardwareModelController extends Controller
{
    public function index()
    {
        try {
            $models = HardwareModel::with('brand')->orderBy('name', 'asc')->get();
            return response()->json($models);
        } catch (\Exception $e) {
            Log::error('Error fetching models: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch models'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'brand_id' => 'required|exists:brands,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $model = HardwareModel::create([
                'brand_id' => $request->brand_id,
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logModelCreated($model->id, $model->name);

            // Load brand relationship
            $model->load('brand');
            
            return response()->json($model, 201);
        } catch (\Exception $e) {
            Log::error('Error creating model: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create model'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $model = HardwareModel::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'brand_id' => 'sometimes|required|exists:brands,id',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            // Store original values for activity log
            $originalValues = [];
            
            // Prepare update data
            $updateData = [];
            
            if ($request->has('brand_id')) {
                $updateData['brand_id'] = $request->brand_id;
            }
            
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            
            // Store original values
            foreach ($updateData as $field => $value) {
                $originalValues[$field] = $model->$field;
            }
            
            // Update the model
            if (!empty($updateData)) {
                $model->update($updateData);
            }
            
            // Refresh to get latest data
            $model->refresh();

            // Track changes for activity log
            $changes = [];
            foreach ($updateData as $field => $newValue) {
                $oldValue = $originalValues[$field] ?? null;
                if ($oldValue != $newValue) {
                    $changes[$field] = [
                        'old' => $oldValue,
                        'new' => $newValue
                    ];
                }
            }

            // Log activity
            if (!empty($changes)) {
                $activityLog = new ActivityLogService();
                $activityLog->logModelUpdated($model->id, $model->name, $changes);
            }

            // Load brand relationship
            $model->load('brand');

            return response()->json($model);
        } catch (\Exception $e) {
            Log::error('Error updating model: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update model: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $model = HardwareModel::findOrFail($id);
            
            // Check if model has associated hardware details
            $detailCount = $model->hardwareDetails()->count();
            if ($detailCount > 0) {
                return response()->json([
                    'error' => "Cannot delete model with {$detailCount} associated hardware details. Delete them first."
                ], 409);
            }

            // Store info before deletion
            $modelName = $model->name;
            
            $model->delete();

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logModelDeleted($id, $modelName);

            return response()->json(['message' => 'Model deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting model: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete model'], 500);
        }
    }

}
