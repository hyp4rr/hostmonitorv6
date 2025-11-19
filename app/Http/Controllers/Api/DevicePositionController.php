<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DevicePosition;
use Illuminate\Http\Request;

class DevicePositionController extends Controller
{
    public function index(Request $request)
    {
        $floorId = $request->input('floor_id');
        $query = DevicePosition::with(['device.hardwareDetail.hardwareModel', 'device.hardwareDetail.brand', 'device'])
            ->when($floorId, fn($q) => $q->where('floor_id', $floorId));
        
        $positions = $query->get();
        
        return response()->json($positions->map(function ($position) {
            return $this->transformPosition($position);
        }));
    }

    public function upsert(Request $request)
    {
        $data = $request->validate([
            'floor_id' => 'required|integer|exists:floors,id',
            'device_id' => 'required|integer|exists:devices,id',
            'x' => 'required|numeric|min:0|max:1',
            'y' => 'required|numeric|min:0|max:1',
            'marker_type' => 'nullable|string|max:50',
        ]);

        $position = DevicePosition::updateOrCreate(
            ['floor_id' => $data['floor_id'], 'device_id' => $data['device_id']],
            ['x' => $data['x'], 'y' => $data['y'], 'marker_type' => $data['marker_type'] ?? null]
        );

        $position->load(['device.hardwareDetail.hardwareModel', 'device.hardwareDetail.brand', 'device']);

        return response()->json($this->transformPosition($position));
    }

    private function transformPosition($position)
    {
        $device = $position->device;
        $hardwareDetail = $device?->hardwareDetail;
        $hardwareModel = $hardwareDetail?->hardwareModel;

        return [
            'id' => $position->id,
            'floor_id' => $position->floor_id,
            'device_id' => $position->device_id,
            'x' => $position->x,
            'y' => $position->y,
            'marker_type' => $position->marker_type,
            'device' => $device ? [
                'id' => $device->id,
                'name' => $device->name,
                'ip_address' => $device->ip_address,
                'category' => $device->category,
                'status' => $device->status,
                'hardware_detail' => $hardwareDetail ? [
                    'id' => $hardwareDetail->id,
                    'hardware_model' => $hardwareModel ? [
                        'id' => $hardwareModel->id,
                        'name' => $hardwareModel->name,
                    ] : null,
                ] : null,
            ] : null,
        ];
    }

    public function destroy($id)
    {
        $position = DevicePosition::findOrFail($id);
        $position->delete();
        return response()->json(['success' => true], 204);
    }
}


