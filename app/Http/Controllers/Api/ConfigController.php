<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ConfigController extends Controller
{
    /**
     * Handle configuration panel login
     */
    public function login(Request $request)
    {
        try {
            // Validate input
            $request->validate([
                'username' => 'required|string|email',
                'password' => 'required|string',
            ]);

            Log::info('Validation passed');

            // Find user by email (username field)
            $user = User::where('email', $request->username)->first();

            if (!$user) {
                Log::warning('User not found in database', [
                    'username' => $request->username,
                    'total_users_in_db' => User::count(),
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password',
                ], 401);
            }

            Log::info('User found', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'has_password_hash' => !empty($user->password),
            ]);

            // Check password
            $passwordMatches = Hash::check($request->password, $user->password);
            
            Log::info('Password check result', [
                'matches' => $passwordMatches,
                'hash_starts_with' => substr($user->password, 0, 10),
            ]);

            if (!$passwordMatches) {
                Log::warning('Password mismatch', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password',
                ], 401);
            }

            // Delete old tokens for this user
            $deletedTokens = $user->tokens()->delete();
            Log::info('Deleted old tokens', ['count' => $deletedTokens]);

            // Create token
            $token = $user->createToken('config-access', ['*'], now()->addHours(8))->plainTextToken;
            
            Log::info('✓ Login successful', [
                'user_id' => $user->id,
                'token_created' => !empty($token),
            ]);

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', [
                'errors' => $e->errors(),
                'messages' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Config login exception', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Handle configuration panel logout
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            Log::info('Config logout successful', ['user_id' => $request->user()->id]);

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Config logout error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
            ], 500);
        }
    }

    /**
     * Verify current session/token
     */
    public function verify(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
        ]);
    }
}
