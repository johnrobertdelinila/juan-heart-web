<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private user channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Assessment updates channel
Broadcast::channel('assessments', function ($user) {
    // Only authenticated users can listen to assessment updates
    return $user !== null;
});

// Facility-specific referral channel
Broadcast::channel('referrals.{facilityId}', function ($user, $facilityId) {
    // Check if user belongs to the facility
    return $user->facility_id === (int) $facilityId;
});

// Private channel for notifications
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return $user->id === (int) $userId;
});
