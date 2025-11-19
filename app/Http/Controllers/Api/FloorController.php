<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Floor;
use Illuminate\Http\Request;

class FloorController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->input('branch_id');
        $locationId = $request->input('location_id');

        $query = Floor::query();
        
        // Filter by branch_id only if provided and not 'all'
        if ($branchId && $branchId !== 'all') {
            $query->where('branch_id', $branchId);
        }
        
        // Filter by location_id if provided (works regardless of branch_id)
        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        return response()->json($query->orderBy('level')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'nullable|integer|exists:branches,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'required|string|max:255',
            'level' => 'nullable|integer',
            'plan_image_path' => 'nullable|string|max:1024',
        ]);

        $floor = Floor::create($data);
        return response()->json($floor, 201);
    }

    public function update(Request $request, $id)
    {
        $floor = Floor::findOrFail($id);
        
        $data = $request->validate([
            'branch_id' => 'nullable|integer|exists:branches,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'required|string|max:255',
            'level' => 'nullable|integer',
            'plan_image_path' => 'nullable|string|max:1024',
        ]);

        $floor->update($data);
        return response()->json($floor);
    }

    public function destroy($id)
    {
        $floor = Floor::findOrFail($id);
        
        // Delete associated device positions
        $floor->positions()->delete();
        
        $floor->delete();
        return response()->json(null, 204);
    }
}


