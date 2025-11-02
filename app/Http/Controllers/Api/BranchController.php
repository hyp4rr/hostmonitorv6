<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class BranchController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('branches')) {
                return response()->json([]);
            }

            $branches = Branch::orderBy('name')->get();
            return response()->json($branches);
        } catch (\Exception $e) {
            Log::error('Error fetching branches: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch branches'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:branches,code',
                'description' => 'nullable|string',
                'address' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $branch = Branch::create($validated);

            return response()->json($branch, 201);
        } catch (\Exception $e) {
            Log::error('Error creating branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create branch', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $branch = Branch::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:branches,code,' . $id,
                'description' => 'nullable|string',
                'address' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $branch->update($validated);

            return response()->json($branch);
        } catch (\Exception $e) {
            Log::error('Error updating branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update branch', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $branch = Branch::findOrFail($id);
            
            // Check if branch has devices
            if ($branch->devices()->count() > 0) {
                return response()->json(['error' => 'Cannot delete branch with existing devices'], 400);
            }

            $branch->delete();

            return response()->json(['message' => 'Branch deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting branch: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete branch', 'message' => $e->getMessage()], 500);
        }
    }
}
