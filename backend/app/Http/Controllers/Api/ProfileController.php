<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * The profile service instance.
     *
     * @var ProfileService
     */
    protected $profileService;

    /**
     * Create a new controller instance.
     *
     * @param ProfileService $profileService
     */
    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    /**
     * Get the authenticated user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        $user = $this->profileService->getProfile($request->user()->id);
        $completionPercentage = $this->profileService->calculateProfileCompletion($request->user()->id);

        return response()->json([
            'user' => $user,
            'profile_completion' => $completionPercentage,
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'sometimes|date|before:today',
            'sex' => ['sometimes', Rule::in(['Male', 'Female', 'Other'])],
            'phone' => 'sometimes|string|max:20',
            'license_no' => 'nullable|string|max:50',
            'specialization' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'language_preference' => ['sometimes', Rule::in(['en', 'fil'])],
            'bio' => 'nullable|string|max:1000',
        ]);

        $user = $this->profileService->updateProfile($request->user()->id, $validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Upload or update profile picture.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfilePicture(Request $request): JsonResponse
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $path = $this->profileService->updateProfilePicture(
            $request->user()->id,
            $request->file('profile_picture')
        );

        return response()->json([
            'message' => 'Profile picture updated successfully',
            'path' => $path,
            'url' => asset('storage/' . $path),
        ]);
    }

    /**
     * Delete profile picture.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteProfilePicture(Request $request): JsonResponse
    {
        $deleted = $this->profileService->deleteProfilePicture($request->user()->id);

        if ($deleted) {
            return response()->json([
                'message' => 'Profile picture deleted successfully',
            ]);
        }

        return response()->json([
            'message' => 'No profile picture to delete',
        ], 404);
    }

    /**
     * Get notification preferences.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getNotificationPreferences(Request $request): JsonResponse
    {
        $preferences = $request->user()->notification_preferences ?? [];

        return response()->json([
            'preferences' => $preferences,
        ]);
    }

    /**
     * Update notification preferences.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email.assessment_assigned' => 'sometimes|boolean',
            'email.referral_received' => 'sometimes|boolean',
            'email.system_updates' => 'sometimes|boolean',
            'email.daily_digest' => 'sometimes|boolean',
            'sms.urgent_alerts' => 'sometimes|boolean',
            'sms.referral_received' => 'sometimes|boolean',
            'push.assessment_assigned' => 'sometimes|boolean',
            'push.referral_received' => 'sometimes|boolean',
            'push.comments' => 'sometimes|boolean',
        ]);

        $user = $this->profileService->updateNotificationPreferences(
            $request->user()->id,
            $validated
        );

        return response()->json([
            'message' => 'Notification preferences updated successfully',
            'preferences' => $user->notification_preferences,
        ]);
    }

    /**
     * Change password.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $success = $this->profileService->changePassword(
            $request->user()->id,
            $validated['current_password'],
            $validated['new_password']
        );

        if ($success) {
            return response()->json([
                'message' => 'Password changed successfully',
            ]);
        }

        return response()->json([
            'message' => 'Current password is incorrect',
        ], 400);
    }

    /**
     * Toggle MFA.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function toggleMfa(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'method' => ['required_if:enabled,true', Rule::in(['sms', 'email', 'authenticator'])],
        ]);

        $user = $this->profileService->toggleMfa(
            $request->user()->id,
            $validated['enabled'],
            $validated['method'] ?? null
        );

        return response()->json([
            'message' => $validated['enabled'] ? 'MFA enabled successfully' : 'MFA disabled successfully',
            'mfa_enabled' => $user->mfa_enabled,
            'mfa_method' => $user->mfa_method,
        ]);
    }

    /**
     * Get user activity logs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 50);
        $logs = $this->profileService->getActivityLogs($request->user()->id, $limit);

        return response()->json([
            'logs' => $logs,
        ]);
    }

    /**
     * Get profile completion status.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function completionStatus(Request $request): JsonResponse
    {
        $completionPercentage = $this->profileService->calculateProfileCompletion($request->user()->id);

        return response()->json([
            'completion_percentage' => $completionPercentage,
        ]);
    }
}
