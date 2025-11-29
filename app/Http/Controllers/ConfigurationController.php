<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Alert;
use App\Models\Location;
use App\Models\LocationFolder;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ConfigurationController extends Controller
{
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            if (Auth::attempt(['name' => $credentials['username'], 'password' => $credentials['password']], true)) {
                $request->session()->regenerate();
                return response()->json([
                    'success' => true,
                    'user' => Auth::user()
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['success' => true]);
    }

    // Branch CRUD
    public function getBranches()
    {
        return response()->json(Branch::all());
    }

    public function createBranch(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:branches,code',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $request->has('is_active') ? (bool)$request->is_active : true;

        $branch = Branch::create($validated);
        return response()->json($branch, 201);
    }

    public function updateBranch(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:10|unique:branches,code,' . $id,
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = (bool)$request->is_active;
        }

        $branch->update($validated);
        return response()->json($branch);
    }

    public function deleteBranch($id)
    {
        $branch = Branch::findOrFail($id);
        $branch->delete();
        return response()->json(['success' => true]);
    }

    // Device CRUD
    public function getDevices()
    {
        return response()->json(Device::all());
    }

    public function createDevice(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|unique:devices,barcode',
            'managed_by' => 'nullable|exists:users,id',
            'serial_number' => 'nullable|string',
            'ip_address' => 'required|ip|unique:devices,ip_address',
            'mac_address' => 'nullable|string',
            'category' => 'required|string',
            'branch_id' => 'required|exists:branches,id',
            'building' => 'nullable|string',
            'brand' => 'nullable|string',
            'model' => 'nullable|string',
            'status' => 'nullable|string',
            'uptime_percentage' => 'nullable|numeric|min:0|max:100',
            'response_time' => 'nullable|integer|min:0',
            'offline_reason' => 'nullable|string',
            'offline_acknowledged_by' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $request->has('is_active') ? (bool)$request->is_active : true;
        $validated['status'] = $validated['status'] ?? 'offline';
        $validated['uptime_percentage'] = $validated['uptime_percentage'] ?? 0;
        
        // Convert empty string to null for managed_by
        if (isset($validated['managed_by']) && $validated['managed_by'] === '') {
            $validated['managed_by'] = null;
        }
        
        // Convert empty string to null for barcode
        if (isset($validated['barcode']) && $validated['barcode'] === '') {
            $validated['barcode'] = null;
        }

        $device = Device::create($validated);
        return response()->json($device, 201);
    }

    public function updateDevice(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'barcode' => 'sometimes|string|unique:devices,barcode,' . $id,
            'managed_by' => 'nullable|exists:users,id',
            'serial_number' => 'nullable|string',
            'ip_address' => 'sometimes|ip|unique:devices,ip_address,' . $id,
            'mac_address' => 'nullable|string',
            'category' => 'sometimes|string',
            'branch_id' => 'sometimes|exists:branches,id',
            'building' => 'nullable|string',
            'brand' => 'nullable|string',
            'model' => 'nullable|string',
            'status' => 'nullable|string',
            'uptime_percentage' => 'nullable|numeric|min:0|max:100',
            'response_time' => 'nullable|integer|min:0',
            'offline_reason' => 'nullable|string',
            'offline_acknowledged_by' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = (bool)$request->is_active;
        }
        
        // Convert empty string to null for managed_by
        if (isset($validated['managed_by']) && $validated['managed_by'] === '') {
            $validated['managed_by'] = null;
        }
        
        // Convert empty string to null for barcode
        if (isset($validated['barcode']) && $validated['barcode'] === '') {
            $validated['barcode'] = null;
        }

        // Update offline acknowledged timestamp if acknowledged_by is provided
        if (!empty($validated['offline_acknowledged_by']) && empty($device->offline_acknowledged_at)) {
            $validated['offline_acknowledged_at'] = now();
        }

        $device->update($validated);
        return response()->json($device);
    }

    public function deleteDevice($id)
    {
        $device = Device::findOrFail($id);
        $device->delete();
        return response()->json(['success' => true]);
    }

    // Alert CRUD
    public function getAlerts()
    {
        return response()->json(Alert::with('device:id,name')->get());
    }

    public function updateAlert(Request $request, $id)
    {
        $alert = Alert::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|string',
            'acknowledged' => 'nullable|boolean',
            'acknowledged_by' => 'nullable|string',
            'reason' => 'nullable|string',
            'resolved' => 'nullable|boolean',
        ]);

        if ($request->has('acknowledged') && (bool)$request->acknowledged) {
            $validated['acknowledged_at'] = now();
        }

        if ($request->has('resolved') && (bool)$request->resolved) {
            $validated['resolved_at'] = now();
        }

        $alert->update($validated);
        return response()->json($alert);
    }

    public function deleteAlert($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->delete();
        return response()->json(['success' => true]);
    }

    // Location Folder CRUD
    public function getLocationFolders()
    {
        return response()->json(LocationFolder::with('branch:id,name')->orderBy('name')->get());
    }

    public function createLocationFolder(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|integer|exists:branches,id',
            'description' => 'nullable|string',
        ]);

        $folder = LocationFolder::create($validated);
        return response()->json($folder->load('branch'), 201);
    }

    public function updateLocationFolder(Request $request, $id)
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

    public function deleteLocationFolder($id)
    {
        $folder = LocationFolder::findOrFail($id);
        $folder->delete();
        return response()->json(['success' => true]);
    }

    // Location CRUD
    public function getLocations()
    {
        return response()->json(Location::with('locationFolder')->get());
    }

    public function createLocation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|integer|exists:branches,id',
            'location_folder_id' => 'nullable|integer|exists:location_folders,id',
            'main_block' => 'nullable|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        if (!empty($validated['location_folder_id'])) {
            $folder = LocationFolder::find($validated['location_folder_id']);
            if ($folder) {
                $validated['main_block'] = $folder->name;
            }
        }

        $location = Location::create($validated);
        return response()->json($location->load('locationFolder'), 201);
    }

    public function updateLocation(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'branch_id' => 'sometimes|integer|exists:branches,id',
            'location_folder_id' => 'nullable|integer|exists:location_folders,id',
            'main_block' => 'nullable|string|max:255',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'description' => 'nullable|string',
        ]);

        if ($request->has('location_folder_id')) {
            if ($validated['location_folder_id']) {
                $folder = LocationFolder::find($validated['location_folder_id']);
                if ($folder) {
                    $validated['main_block'] = $folder->name;
                }
            } else {
                $validated['main_block'] = null;
            }
        }

        $location->update($validated);
        return response()->json($location->load('locationFolder'));
    }

    public function deleteLocation($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();
        return response()->json(['success' => true]);
    }

    // User CRUD
    public function getUsers()
    {
        return response()->json(User::select('id', 'name', 'email', 'role', 'created_at')->get());
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,staff',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|in:admin,staff',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['success' => true]);
    }
}
