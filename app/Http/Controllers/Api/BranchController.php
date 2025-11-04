<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function index()
    {
        try {
            $branches = Branch::orderBy('id', 'asc')->get();
            return response()->json($branches);
        } catch (\Exception $e) {
            Log::error('Error fetching branches: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch branches'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:10|unique:branches,code',
                'description' => 'nullable|string|max:500',
                'address' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $branch = Branch::create([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'address' => $request->address,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return response()->json($branch, 201);
        } catch (\Exception $e) {
            Log::error('Error creating branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create branch'], 500);
        }
    }

    public function show($id)
    {
        try {
            $branch = Branch::findOrFail($id);
            return response()->json($branch);
        } catch (\Exception $e) {
            Log::error('Error fetching branch: ' . $e->getMessage());
            return response()->json(['error' => 'Branch not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'code' => 'sometimes|required|string|max:10|unique:branches,code,' . $id,
                'description' => 'nullable|string|max:500',
                'address' => 'nullable|string|max:1000',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $branch->update($request->only(['name', 'code', 'description', 'address', 'is_active']));
            
            if ($request->has('is_active')) {
                $branch->is_active = $request->boolean('is_active');
                $branch->save();
            }

            return response()->json($branch);
        } catch (\Exception $e) {
            Log::error('Error updating branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update branch'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $branch = Branch::findOrFail($id);
            
            // Check if branch has associated devices
            $deviceCount = $branch->devices()->count();
            if ($deviceCount > 0) {
                return response()->json([
                    'error' => "Cannot delete branch with {$deviceCount} associated devices. Delete devices first or deactivate the branch instead."
                ], 409);
            }

            $branch->delete();

            return response()->json(['message' => 'Branch deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete branch'], 500);
        }
    }
}