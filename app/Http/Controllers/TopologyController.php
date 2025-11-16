<?php

namespace App\Http\Controllers;

use App\Models\Topology;
use App\Models\Device;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TopologyController extends Controller
{
    /**
     * Get all branches for dropdown
     */
    private function getAllBranches()
    {
        return Branch::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'description'])
            ->toArray();
    }

    /**
     * Get or set current branch ID from request/session
     */
    private function getCurrentBranchId(Request $request)
    {
        $branchId = $request->input('branch_id');
        
        if ($branchId) {
            session(['current_branch_id' => $branchId]);
            return (int)$branchId;
        }
        
        if (session()->has('current_branch_id')) {
            return (int)session('current_branch_id');
        }
        
        $branches = $this->getAllBranches();
        if (!empty($branches)) {
            $firstBranchId = $branches[0]['id'];
            session(['current_branch_id' => $firstBranchId]);
            return $firstBranchId;
        }
        
        return null;
    }

    /**
     * Get complete branch data
     */
    private function getBranchData($branchId = null)
    {
        $allBranches = $this->getAllBranches();

        if (!$branchId && !empty($allBranches)) {
            $branchId = $allBranches[0]['id'];
        }

        $branch = Branch::find($branchId);

        if (!$branch) {
            return [
                'id' => null,
                'name' => 'No Branch',
                'code' => 'NONE',
                'description' => 'No branches configured',
                'branches' => $allBranches,
            ];
        }

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'description' => $branch->description,
            'branches' => $allBranches,
        ];
    }

    /**
     * Display the topology page
     */
    public function index(Request $request): Response
    {
        $branchId = $this->getCurrentBranchId($request);
        $branchData = $this->getBranchData($branchId);

        // Get all topologies for the current branch
        $topologies = Topology::where('branch_id', $branchId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($topology) {
                return [
                    'id' => $topology->id,
                    'name' => $topology->name,
                    'description' => $topology->description,
                    'device_count' => $topology->devices()->count(),
                    'created_at' => $topology->created_at->toIso8601String(),
                    'updated_at' => $topology->updated_at->toIso8601String(),
                ];
            });

        return Inertia::render('monitor/topology', [
            'currentBranch' => $branchData,
            'topologies' => $topologies,
        ]);
    }
}
