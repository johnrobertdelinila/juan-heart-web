<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ProfileService
{
    /**
     * Get user profile with relationships.
     *
     * @param int $userId
     * @return User
     */
    public function getProfile(int $userId): User
    {
        return User::with(['facility', 'roles', 'permissions', 'trustedDevices'])
            ->findOrFail($userId);
    }

    /**
     * Update user profile.
     *
     * @param int $userId
     * @param array $data
     * @return User
     */
    public function updateProfile(int $userId, array $data): User
    {
        $user = User::findOrFail($userId);

        $allowedFields = [
            'first_name',
            'last_name',
            'middle_name',
            'date_of_birth',
            'sex',
            'phone',
            'license_no',
            'specialization',
            'position',
            'department',
            'language_preference',
            'bio',
        ];

        $updateData = array_intersect_key($data, array_flip($allowedFields));
        $user->update($updateData);

        $this->logActivity($userId, 'profile_update', 'User updated their profile', [
            'fields_updated' => array_keys($updateData),
        ]);

        return $user->fresh();
    }

    /**
     * Upload and update profile picture.
     *
     * @param int $userId
     * @param UploadedFile $file
     * @return string
     */
    public function updateProfilePicture(int $userId, UploadedFile $file): string
    {
        $user = User::findOrFail($userId);

        // Delete old profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile-pictures', $filename, 'public');

        // Update user record
        $user->update(['profile_picture' => $path]);

        $this->logActivity($userId, 'profile_picture_update', 'User updated their profile picture');

        return $path;
    }

    /**
     * Delete profile picture.
     *
     * @param int $userId
     * @return bool
     */
    public function deleteProfilePicture(int $userId): bool
    {
        $user = User::findOrFail($userId);

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);

            $this->logActivity($userId, 'profile_picture_delete', 'User deleted their profile picture');

            return true;
        }

        return false;
    }

    /**
     * Update notification preferences.
     *
     * @param int $userId
     * @param array $preferences
     * @return User
     */
    public function updateNotificationPreferences(int $userId, array $preferences): User
    {
        $user = User::findOrFail($userId);

        $defaultPreferences = [
            'email' => [
                'assessment_assigned' => true,
                'referral_received' => true,
                'system_updates' => false,
                'daily_digest' => false,
            ],
            'sms' => [
                'urgent_alerts' => true,
                'referral_received' => false,
            ],
            'push' => [
                'assessment_assigned' => true,
                'referral_received' => true,
                'comments' => false,
            ],
        ];

        $mergedPreferences = array_merge($defaultPreferences, $preferences);
        $user->update(['notification_preferences' => $mergedPreferences]);

        $this->logActivity($userId, 'notification_preferences_update', 'User updated notification preferences');

        return $user->fresh();
    }

    /**
     * Change user password.
     *
     * @param int $userId
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): bool
    {
        $user = User::findOrFail($userId);

        if (!Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->update([
            'password' => Hash::make($newPassword),
            'password_changed_at' => now(),
            'force_password_change' => false,
        ]);

        $this->logActivity($userId, 'password_change', 'User changed their password');

        return true;
    }

    /**
     * Enable/disable MFA.
     *
     * @param int $userId
     * @param bool $enable
     * @param string|null $method
     * @return User
     */
    public function toggleMfa(int $userId, bool $enable, ?string $method = 'sms'): User
    {
        $user = User::findOrFail($userId);

        $user->update([
            'mfa_enabled' => $enable,
            'mfa_method' => $enable ? $method : null,
        ]);

        $action = $enable ? 'mfa_enabled' : 'mfa_disabled';
        $this->logActivity($userId, $action, "User {$action} MFA", ['method' => $method]);

        return $user->fresh();
    }

    /**
     * Get user activity logs.
     *
     * @param int $userId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActivityLogs(int $userId, int $limit = 50)
    {
        return UserActivityLog::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate profile completion percentage.
     *
     * @param int $userId
     * @return int
     */
    public function calculateProfileCompletion(int $userId): int
    {
        $user = User::findOrFail($userId);

        $requiredFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'date_of_birth',
            'sex',
            'position',
            'facility_id',
            'profile_picture',
            'bio',
        ];

        $completedFields = 0;
        foreach ($requiredFields as $field) {
            if (!empty($user->{$field})) {
                $completedFields++;
            }
        }

        return (int) (($completedFields / count($requiredFields)) * 100);
    }

    /**
     * Log user activity.
     *
     * @param int $userId
     * @param string $action
     * @param string $description
     * @param array $metadata
     * @return void
     */
    protected function logActivity(int $userId, string $action, string $description, array $metadata = []): void
    {
        UserActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
        ]);
    }
}
