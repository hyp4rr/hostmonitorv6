<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topology;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TopologyController extends Controller
{
    /**
     * Display a listing of topologies
     */
    public function index(Request $request)
    {
        try {
            $branchId = $request->input('branch_id');
            
            $query = Topology::with(['devices', 'branch']);
            
            if ($branchId && $branchId !== 'all') {
                $query->where('branch_id', $branchId);
            }
            
            $topologies = $query->orderBy('name')->get()->map(function ($topology) {
                return [
                    'id' => $topology->id,
                    'branch_id' => $topology->branch_id,
                    'name' => $topology->name,
                    'description' => $topology->description,
                    'canvas_data' => $topology->canvas_data,
                    'is_active' => $topology->is_active,
                    'device_count' => $topology->devices()->count(),
                    'created_at' => $topology->created_at->toIso8601String(),
                    'updated_at' => $topology->updated_at->toIso8601String(),
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $topologies,
            ]);
        } catch (\Exception $e) {
            Log::error('Topology index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch topologies',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created topology
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'branch_id' => 'required|exists:branches,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'canvas_data' => 'required|array',
                'devices' => 'nullable|array',
                'devices.*.device_id' => 'required|exists:devices,id',
                'devices.*.node_id' => 'required|string',
                'devices.*.position_x' => 'required|numeric',
                'devices.*.position_y' => 'required|numeric',
                'devices.*.node_data' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            $topology = Topology::create([
                'branch_id' => $request->branch_id,
                'name' => $request->name,
                'description' => $request->description,
                'canvas_data' => $request->canvas_data,
                'is_active' => $request->input('is_active', true),
            ]);

            // Attach devices if provided
            if ($request->has('devices') && is_array($request->devices)) {
                foreach ($request->devices as $deviceData) {
                    // Prepare pivot data
                    $pivotData = [
                        'node_id' => $deviceData['node_id'],
                        'position_x' => $deviceData['position_x'],
                        'position_y' => $deviceData['position_y'],
                    ];
                    
                    // Encode node_data as JSON if it's an array
                    if (isset($deviceData['node_data'])) {
                        if (is_array($deviceData['node_data'])) {
                            $pivotData['node_data'] = json_encode($deviceData['node_data']);
                        } else {
                            $pivotData['node_data'] = $deviceData['node_data'];
                        }
                    } else {
                        $pivotData['node_data'] = null;
                    }
                    
                    $topology->devices()->attach($deviceData['device_id'], $pivotData);
                }
            }

            DB::commit();

            $topology->load('devices');

            return response()->json([
                'success' => true,
                'message' => 'Topology created successfully',
                'data' => [
                    'id' => $topology->id,
                    'branch_id' => $topology->branch_id,
                    'name' => $topology->name,
                    'description' => $topology->description,
                    'canvas_data' => $topology->canvas_data,
                    'is_active' => $topology->is_active,
                    'device_count' => $topology->devices()->count(),
                    'created_at' => $topology->created_at->toIso8601String(),
                    'updated_at' => $topology->updated_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Topology store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create topology',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified topology
     */
    public function show($id)
    {
        try {
            $topology = Topology::with(['devices.hardwareDetail.brand', 'devices.hardwareDetail.hardwareModel', 'branch'])
                ->findOrFail($id);

            $devices = $topology->devices->map(function ($device) {
                return [
                    'id' => $device->id,
                    'name' => $device->name,
                    'ip_address' => $device->ip_address,
                    'category' => $device->category,
                    'status' => $device->status,
                    'brand' => $device->brand ?? '',
                    'model' => $device->model ?? '',
                    'node_id' => $device->pivot->node_id,
                    'position_x' => $device->pivot->position_x,
                    'position_y' => $device->pivot->position_y,
                    'node_data' => $device->pivot->node_data,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $topology->id,
                    'branch_id' => $topology->branch_id,
                    'name' => $topology->name,
                    'description' => $topology->description,
                    'canvas_data' => $topology->canvas_data,
                    'is_active' => $topology->is_active,
                    'devices' => $devices,
                    'created_at' => $topology->created_at->toIso8601String(),
                    'updated_at' => $topology->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Topology show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch topology',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified topology
     */
    public function update(Request $request, $id)
    {
        try {
            $topology = Topology::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'canvas_data' => 'nullable|array',
                'devices' => 'nullable|array',
                'devices.*.device_id' => 'required_with:devices|exists:devices,id',
                'devices.*.node_id' => 'required_with:devices|string',
                'devices.*.position_x' => 'required_with:devices|numeric',
                'devices.*.position_y' => 'required_with:devices|numeric',
                'devices.*.node_data' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Prepare update data
            $updateData = [];
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('canvas_data')) {
                $updateData['canvas_data'] = $request->canvas_data;
            }
            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }

            if (!empty($updateData)) {
                $topology->update($updateData);
            }

            // Update devices if provided
            if ($request->has('devices')) {
                // Detach all existing devices
                $topology->devices()->detach();

                // Attach new devices (only if devices array is not empty)
                if (is_array($request->devices) && count($request->devices) > 0) {
                    foreach ($request->devices as $deviceData) {
                        // Validate device exists before attaching
                        if (isset($deviceData['device_id']) && \App\Models\Device::find($deviceData['device_id'])) {
                            // Prepare pivot data
                            $pivotData = [
                                'node_id' => $deviceData['node_id'] ?? 'node-' . $deviceData['device_id'],
                                'position_x' => $deviceData['position_x'] ?? 0,
                                'position_y' => $deviceData['position_y'] ?? 0,
                            ];
                            
                            // Encode node_data as JSON if it's an array
                            if (isset($deviceData['node_data'])) {
                                if (is_array($deviceData['node_data'])) {
                                    $pivotData['node_data'] = json_encode($deviceData['node_data']);
                                } else {
                                    $pivotData['node_data'] = $deviceData['node_data'];
                                }
                            } else {
                                $pivotData['node_data'] = null;
                            }
                            
                            $topology->devices()->attach($deviceData['device_id'], $pivotData);
                        }
                    }
                }
            }

            DB::commit();

            $topology->load('devices');

            return response()->json([
                'success' => true,
                'message' => 'Topology updated successfully',
                'data' => [
                    'id' => $topology->id,
                    'branch_id' => $topology->branch_id,
                    'name' => $topology->name,
                    'description' => $topology->description,
                    'canvas_data' => $topology->canvas_data,
                    'is_active' => $topology->is_active,
                    'device_count' => $topology->devices()->count(),
                    'created_at' => $topology->created_at->toIso8601String(),
                    'updated_at' => $topology->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Topology update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update topology',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified topology
     */
    public function destroy($id)
    {
        try {
            $topology = Topology::findOrFail($id);
            $topology->delete();

            return response()->json([
                'success' => true,
                'message' => 'Topology deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Topology destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete topology',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
