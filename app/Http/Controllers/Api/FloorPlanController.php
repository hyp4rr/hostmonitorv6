<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FloorPlanController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:8192', // 8MB
        ]);

        $path = $request->file('image')->store('floor-plans', 'public');

        // Return a web-accessible path
        return response()->json([
            'success' => true,
            'path' => Storage::url($path), // e.g., /storage/floor-plans/abc.png
        ]);
    }
}


