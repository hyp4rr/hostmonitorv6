<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LocationFolder;
use Illuminate\Http\Request;

class LocationFolderController extends Controller
{
    public function index()
    {
        return response()->json(
            LocationFolder::with('branch:id,name')
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|integer|exists:branches,id',
            'description' => 'nullable|string',
        ]);

        $folder = LocationFolder::create($validated);

        return response()->json($folder->load('branch'), 201);
    }

    public function update(Request $request, $id)
    {
        $folder = LocationFolder::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'branch_id' => 'sometimes|integer|exists:branches,id',
            'description' => 'nullable|string',
        ]);

        $folder->update($validated);

        return response()->json($folder->load('branch'));
    }

    public function destroy($id)
    {
        $folder = LocationFolder::findOrFail($id);
        $folder->delete();

        return response()->json(['success' => true]);
    }
}

