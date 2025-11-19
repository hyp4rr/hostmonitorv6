<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Alert::with('device.branch')->orderBy('created_at', 'desc');
            
            // Filter by branch if provided (skip if 'all')
            if ($request->has('branch_id') && $request->branch_id !== 'all') {
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

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|exists:devices,id',
                'type' => 'nullable|string|max:50',
                'severity' => 'nullable|string|in:low,medium,high,critical',
                'category' => 'required|string|max:50',
                'title' => 'nullable|string|max:255',
                'message' => 'nullable|string|max:1000',
                'status' => 'nullable|string|in:active,acknowledged,dismissed',
                'acknowledged' => 'nullable|boolean',
                'acknowledged_by' => 'nullable|string|max:255',
                'reason' => 'nullable|string|max:1000',
                'resolved' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $alert = Alert::create([
                'device_id' => $request->device_id,
                'type' => $request->type ?? 'manual',
                'severity' => $request->severity ?? 'medium',
                'category' => $request->category,
                'title' => $request->title ?? 'Manual Alert',
                'message' => $request->message ?? '',
                'status' => $request->status ?? 'active',
                'acknowledged' => $request->acknowledged ?? false,
                'acknowledged_by' => $request->acknowledged_by,
                'acknowledged_at' => $request->acknowledged ? now() : null,
                'reason' => $request->reason,
                'resolved' => $request->resolved ?? false,
                'resolved_at' => $request->resolved ? now() : null,
                'triggered_at' => now(),
            ]);

            // Log activity
            try {
                $device = $alert->device;
                ActivityLog::create([
                    'user' => $request->user() ? $request->user()->name : 'Guest',
                    'action' => 'created',
                    'entity_type' => 'alert',
                    'entity_id' => $alert->id,
                    'branch_id' => $device->branch_id ?? null,
                    'ip_address' => $request->ip(),
                    'details' => [
                        'alert_title' => $alert->title,
                        'device_name' => $device->name ?? 'Unknown',
                        'severity' => $alert->severity,
                        'category' => $alert->category,
                    ],
                ]);
            } catch (\Exception $logError) {
                // If logging fails, don't fail the creation
                Log::warning('Failed to log alert creation: ' . $logError->getMessage());
            }

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
            $originalData = $alert->toArray();

            $validator = Validator::make($request->all(), [
                'type' => 'sometimes|string|max:50',
                'severity' => 'sometimes|string|in:low,medium,high,critical',
                'category' => 'sometimes|string|max:50',
                'title' => 'nullable|string|max:255',
                'message' => 'nullable|string|max:1000',
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

            // Track changes
            $changes = [];

            // Update basic fields
            if ($request->has('type') && $alert->type !== $request->type) {
                $changes['type'] = ['old' => $alert->type, 'new' => $request->type];
                $alert->type = $request->type;
            }
            if ($request->has('severity') && $alert->severity !== $request->severity) {
                $changes['severity'] = ['old' => $alert->severity, 'new' => $request->severity];
                $alert->severity = $request->severity;
            }
            if ($request->has('category') && $alert->category !== $request->category) {
                $changes['category'] = ['old' => $alert->category, 'new' => $request->category];
                $alert->category = $request->category;
            }
            if ($request->has('title') && $alert->title !== $request->title) {
                $changes['title'] = ['old' => $alert->title, 'new' => $request->title];
                $alert->title = $request->title;
            }
            if ($request->has('message') && $alert->message !== $request->message) {
                $changes['message'] = ['old' => $alert->message, 'new' => $request->message];
                $alert->message = $request->message;
            }
            if ($request->has('status') && $alert->status !== $request->status) {
                $changes['status'] = ['old' => $alert->status, 'new' => $request->status];
                $alert->status = $request->status;
            }
            if ($request->has('acknowledged_by') && $alert->acknowledged_by !== $request->acknowledged_by) {
                $changes['acknowledged_by'] = ['old' => $alert->acknowledged_by, 'new' => $request->acknowledged_by];
                $alert->acknowledged_by = $request->acknowledged_by;
            }
            if ($request->has('reason') && $alert->reason !== $request->reason) {
                $changes['reason'] = ['old' => $alert->reason, 'new' => $request->reason];
                $alert->reason = $request->reason;
            }
            
            if ($request->has('acknowledged')) {
                $newAcknowledged = filter_var($request->acknowledged, FILTER_VALIDATE_BOOLEAN);
                if ($alert->acknowledged !== $newAcknowledged) {
                    $changes['acknowledged'] = ['old' => $alert->acknowledged, 'new' => $newAcknowledged];
                    $alert->acknowledged = $newAcknowledged;
                    if ($alert->acknowledged && !$alert->acknowledged_at) {
                        $alert->acknowledged_at = now();
                    }
                }
            }
            
            if ($request->has('resolved')) {
                $newResolved = filter_var($request->resolved, FILTER_VALIDATE_BOOLEAN);
                if ($alert->resolved !== $newResolved) {
                    $changes['resolved'] = ['old' => $alert->resolved, 'new' => $newResolved];
                    $alert->resolved = $newResolved;
                    if ($alert->resolved && !$alert->resolved_at) {
                        $alert->resolved_at = now();
                    }
                }
            }

            $alert->save();

            // Log activity if there were changes
            if (!empty($changes)) {
                try {
                    $device = $alert->device;
                    ActivityLog::create([
                        'user' => $request->user() ? $request->user()->name : 'Guest',
                        'action' => 'updated',
                        'entity_type' => 'alert',
                        'entity_id' => $alert->id,
                        'branch_id' => $device->branch_id ?? null,
                        'ip_address' => $request->ip(),
                        'details' => [
                            'alert_title' => $alert->title,
                            'device_name' => $device->name ?? 'Unknown',
                            'changes' => $changes,
                        ],
                    ]);
                } catch (\Exception $logError) {
                    // If logging fails, don't fail the update
                    Log::warning('Failed to log alert update: ' . $logError->getMessage());
                }
            }

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
            $device = $alert->device;
            $alertTitle = $alert->title;
            $deviceName = $device->name ?? 'Unknown';
            $branchId = $device->branch_id ?? null;
            
            $alert->delete();

            // Log activity
            try {
                ActivityLog::create([
                    'user' => 'Guest',
                    'action' => 'deleted',
                    'entity_type' => 'alert',
                    'entity_id' => $id,
                    'branch_id' => $branchId,
                    'ip_address' => request()->ip(),
                    'details' => [
                        'alert_title' => $alertTitle,
                        'device_name' => $deviceName,
                    ],
                ]);
            } catch (\Exception $logError) {
                // If logging fails, don't fail the delete operation
                Log::warning('Failed to log alert deletion: ' . $logError->getMessage());
            }

            return response()->json(['message' => 'Alert deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting alert: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete alert'], 500);
        }
    }
}