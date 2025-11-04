<?php
// filepath: c:\Users\hyper\Herd\hostmonitorv6\app\Http\Controllers\Api\HardwareModelController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HardwareModel;
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

            return response()->json($model->load('brand'), 201);
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

            if ($request->has('brand_id')) $model->brand_id = $request->brand_id;
            if ($request->has('name')) $model->name = $request->name;
            if ($request->has('description')) $model->description = $request->description;

            $model->save();

            return response()->json($model->load('brand'));
        } catch (\Exception $e) {
            Log::error('Error updating model: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update model'], 500);
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

            $model->delete();

            return response()->json(['message' => 'Model deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting model: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete model'], 500);
        }
    }
}