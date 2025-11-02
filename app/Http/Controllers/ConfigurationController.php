<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Alert;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide username and password'
            ], 422);
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

    public function getDevices()
    {
        return response()->json(Device::all());
    }

    public function createDevice(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'type' => 'required|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'building' => 'nullable|string',
            'category' => 'nullable|string',
            'priority' => 'nullable|integer|min:1|max:5',
        ]);

        $device = Device::create($validated);
        return response()->json($device, 201);
    }

    public function updateDevice(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'ip_address' => 'sometimes|ip',
            'type' => 'sometimes|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'building' => 'nullable|string',
            'category' => 'nullable|string',
            'priority' => 'nullable|integer|min:1|max:5',
        ]);

        $device->update($validated);
        return response()->json($device);
    }

    public function deleteDevice($id)
    {
        $device = Device::findOrFail($id);
        $device->delete();
        return response()->json(['success' => true]);
    }

    public function getAlerts()
    {
        return response()->json(Alert::with('device')->get());
    }

    public function updateAlert(Request $request, $id)
    {
        $alert = Alert::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|string',
            'severity' => 'sometimes|string',
        ]);

        $alert->update($validated);
        return response()->json($alert);
    }

    public function deleteAlert($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->delete();
        return response()->json(['success' => true]);
    }
}
