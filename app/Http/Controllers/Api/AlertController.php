<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Alert::with('device.branch')->orderBy('created_at', 'desc');
            
            // Filter by branch if provided
            if ($request->has('branch_id')) {
                $query->whereHas('device', function($q) use ($request) {
                    $q->where('branch_id', $request->branch_id);
                });
            }
            
            $alerts = $query->get();
            return response()->json($alerts);
        } catch (\Exception $e) {
            Log::error('Error fetching alerts: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch alerts'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $alert = Alert::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|string|in:active,acknowledged,dismissed',
                'acknowledged' => 'sometimes|boolean',
                'acknowledged_by' => 'nullable|string|max:255',
                'reason' => 'nullable|string|max:1000',
                'resolved' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            if ($request->has('status')) $alert->status = $request->status;
            if ($request->has('acknowledged_by')) $alert->acknowledged_by = $request->acknowledged_by;
            if ($request->has('reason')) $alert->reason = $request->reason;
            
            if ($request->has('acknowledged')) {
                $alert->acknowledged = filter_var($request->acknowledged, FILTER_VALIDATE_BOOLEAN);
                if ($alert->acknowledged && !$alert->acknowledged_at) {
                    $alert->acknowledged_at = now();
                }
            }
            
            if ($request->has('resolved')) {
                $alert->resolved = filter_var($request->resolved, FILTER_VALIDATE_BOOLEAN);
                if ($alert->resolved && !$alert->resolved_at) {
                    $alert->resolved_at = now();
                }
            }

            $alert->save();

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
            return response()->json(['error' => 'Failed to delete alert'], 500);
        }
    }
}