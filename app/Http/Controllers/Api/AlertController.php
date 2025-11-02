<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $query = Alert::with('device');

        if ($request->has('unread') && $request->unread) {
            $query->where('is_read', false);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        $alerts = $query->orderBy('created_at', 'desc')->get()->map(function ($alert) {
            return [
                'id' => $alert->id,
                'severity' => $alert->severity,
                'title' => $alert->title,
                'message' => $alert->message,
                'device' => $alert->device ? [
                    'id' => $alert->device->id,
                    'name' => $alert->device->name,
                    'ip' => $alert->device->ip_address,
                ] : null,
                'is_read' => $alert->is_read,
                'is_resolved' => $alert->is_resolved,
                'created_at' => $alert->created_at->toIso8601String(),
                'created_at_human' => $alert->created_at->diffForHumans(),
            ];
        });

        return response()->json($alerts);
    }

    public function markAsRead($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->is_read = true;
        $alert->save();

        return response()->json(['message' => 'Alert marked as read']);
    }

    public function resolve($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->is_resolved = true;
        $alert->resolved_at = now();
        $alert->save();

        return response()->json(['message' => 'Alert resolved']);
    }

    public function stats()
    {
        $total = Alert::count();
        $unread = Alert::where('is_read', false)->count();
        $unresolved = Alert::where('is_resolved', false)->count();
        $critical = Alert::where('severity', 'critical')->where('is_resolved', false)->count();

        return response()->json([
            'total' => $total,
            'unread' => $unread,
            'unresolved' => $unresolved,
            'critical' => $critical,
        ]);
    }
}
