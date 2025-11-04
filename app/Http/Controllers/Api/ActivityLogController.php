<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $branchId = $request->query('branch_id');
            $limit = $request->query('limit', 100); // Default to 100 records
            
            $activityLogService = new ActivityLogService();
            $activities = $activityLogService->getRecentActivities($branchId, $limit);
            
            return response()->json($activities);
        } catch (\Exception $e) {
            Log::error('Error fetching activity logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch activity logs'], 500);
        }
    }
}
