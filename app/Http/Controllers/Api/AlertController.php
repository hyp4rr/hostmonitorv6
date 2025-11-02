<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class AlertController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('alerts')) {
                return response()->json([]);
            }

            $alerts = Alert::with('device')
                ->orderBy('triggered_at', 'desc')
                ->get();
            
            return response()->json($alerts);
        } catch (\Exception $e) {
            Log::error('Error fetching alerts: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch alerts'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'device_id' => 'required|exists:devices,id',
                'type' => 'required|string|max:50',
                'severity' => 'required|in:info,warning,error,critical',
                'category' => 'required|string|max:50',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'status' => 'required|string|max:50',
                'acknowledged' => 'boolean',
                'acknowledged_by' => 'nullable|string|max:255',
                'reason' => 'nullable|string',
                'resolved' => 'boolean',
            ]);

            $validated['acknowledged'] = $request->boolean('acknowledged', false);
            $validated['resolved'] = $request->boolean('resolved', false);
            $validated['triggered_at'] = now();

            if ($validated['acknowledged'] && !$request->has('acknowledged_at')) {
                $validated['acknowledged_at'] = now();
            }

            if ($validated['resolved'] && !$request->has('resolved_at')) {
                $validated['resolved_at'] = now();
            }

            $alert = Alert::create($validated);

            return response()->json($alert->load('device'), 201);
        } catch (\Exception $e) {
            Log::error('Error creating alert: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create alert', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $alert = Alert::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|string|max:50',
                'acknowledged' => 'boolean',
                'acknowledged_by' => 'nullable|string|max:255',
                'reason' => 'nullable|string',
                'resolved' => 'boolean',
            ]);

            $validated['acknowledged'] = $request->boolean('acknowledged', false);
            $validated['resolved'] = $request->boolean('resolved', false);

            // Set timestamps when status changes
            if ($validated['acknowledged'] && !$alert->acknowledged) {
                $validated['acknowledged_at'] = now();
            }

            if ($validated['resolved'] && !$alert->resolved) {
                $validated['resolved_at'] = now();
            }

            $alert->update($validated);

            return response()->json($alert->load('device'));
        } catch (\Exception $e) {
            Log::error('Error updating alert: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update alert', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $alert = Alert::findOrFail($id);
            $alert->delete();

            return response()->json(['message' => 'Alert deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting alert: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete alert', 'message' => $e->getMessage()], 500);
        }
    }
}
