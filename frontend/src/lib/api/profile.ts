import {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ToggleMfaRequest,
  ActivityLogsResponse,
  CompletionStatusResponse,
  NotificationPreferences,
  User,
} from '@/types/profile';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get authorization header
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<{ message: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(
  file: File
): Promise<{ message: string; path: string; url: string }> {
  const token = localStorage.getItem('auth_token');
  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await fetch(`${API_BASE_URL}/profile/picture`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile picture');
  }

  return response.json();
}

/**
 * Delete profile picture
 */
export async function deleteProfilePicture(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/profile/picture`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete profile picture');
  }

  return response.json();
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<{
  preferences: NotificationPreferences;
}> {
  const response = await fetch(`${API_BASE_URL}/profile/notifications/preferences`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification preferences');
  }

  return response.json();
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<{ message: string; preferences: NotificationPreferences }> {
  const response = await fetch(`${API_BASE_URL}/profile/notifications/preferences`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update notification preferences');
  }

  return response.json();
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/profile/security/password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
}

/**
 * Toggle MFA
 */
export async function toggleMfa(
  data: ToggleMfaRequest
): Promise<{ message: string; mfa_enabled: boolean; mfa_method?: string }> {
  const response = await fetch(`${API_BASE_URL}/profile/security/mfa`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle MFA');
  }

  return response.json();
}

/**
 * Get activity logs
 */
export async function getActivityLogs(limit?: number): Promise<ActivityLogsResponse> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/profile/activity-logs?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activity logs');
  }

  return response.json();
}

/**
 * Get profile completion status
 */
export async function getProfileCompletion(): Promise<CompletionStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/completion`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile completion status');
  }

  return response.json();
}
