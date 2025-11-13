# Appointment Public Routes Implementation

## Overview
This document describes the implementation of temporary public routes for the Appointments API to support frontend development before authentication is fully implemented.

## Changes Made

### 1. Routes Update (`/backend/routes/api.php`)

#### Added Public Routes (Lines 106-138)
The following appointment endpoints are now publicly accessible without authentication:

```php
Route::prefix('appointments')->middleware('throttle:public')->group(function () {
    // List appointments with filters
    Route::get('/', [AppointmentController::class, 'index']);

    // Get appointment statistics
    Route::get('/statistics', [AppointmentController::class, 'statistics']);

    // Get single appointment
    Route::get('/{id}', [AppointmentController::class, 'show']);

    // Mobile app booking endpoint (public)
    Route::post('/', [AppointmentController::class, 'store']);

    // Confirm appointment
    Route::post('/{id}/confirm', [AppointmentController::class, 'confirm']);

    // Cancel appointment
    Route::post('/{id}/cancel', [AppointmentController::class, 'cancel']);

    // Check in patient
    Route::post('/{id}/check-in', [AppointmentController::class, 'checkIn']);

    // Reschedule appointment
    Route::post('/{id}/reschedule', [AppointmentController::class, 'reschedule']);

    // Complete appointment
    Route::post('/{id}/complete', [AppointmentController::class, 'complete']);

    // Public confirmation endpoint (token-based, no auth)
    Route::post('/confirm-public', [AppointmentController::class, 'confirmPublic']);
});
```

#### Commented Out Protected Routes (Lines 329-373)
The protected routes within the `auth:sanctum` middleware group have been commented out to prevent conflicts:
- These will be re-enabled once authentication is fully implemented
- Clear TODO comments mark where changes need to be reverted

### 2. Controller Updates (`/backend/app/Http/Controllers/Api/AppointmentController.php`)

#### Added Statistics Method (Lines 85-126)
New endpoint to get appointment statistics for today:

```php
public function statistics(Request $request): JsonResponse
{
    // Returns counts for:
    // - total_today: All appointments scheduled for today
    // - confirmed: Confirmed appointments today
    // - pending: Scheduled/rescheduled appointments today
    // - completed: Completed appointments today
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "total_today": 15,
    "confirmed": 8,
    "pending": 5,
    "completed": 2
  },
  "timestamp": "2025-11-03T07:19:10.175477Z"
}
```

#### Updated Methods to Handle No Authentication

**cancel() method (Line 503):**
```php
// TEMPORARY: Default to admin user (ID 1) when no auth
$this->appointmentService->cancelAppointment(
    $appointment,
    auth()->id() ?? 1,  // Falls back to admin user
    $request->reason
);
```

**checkIn() method (Line 559):**
```php
// TEMPORARY: Default to admin user (ID 1) when no auth
$this->appointmentService->checkInPatient($appointment, auth()->id() ?? 1);
```

## API Endpoints

### Public Appointment Endpoints
All endpoints are accessible at: `http://localhost:8000/api/v1/appointments`

#### 1. GET /appointments
List all appointments with optional filters.

**Query Parameters:**
- `facility_id` - Filter by facility
- `doctor_id` - Filter by doctor
- `status` - Filter by status (scheduled, confirmed, checked_in, completed, cancelled, etc.)
- `date_from` & `date_to` - Date range filter
- `search` - Search by patient name or phone
- `sort_by` - Sort field (default: appointment_datetime)
- `sort_order` - asc or desc (default: asc)
- `per_page` - Results per page (default: 20)

**Example:**
```bash
curl "http://localhost:8000/api/v1/appointments?status=confirmed&per_page=10"
```

#### 2. GET /appointments/statistics
Get appointment statistics for today.

**Example:**
```bash
curl "http://localhost:8000/api/v1/appointments/statistics"
```

#### 3. GET /appointments/{id}
Get a single appointment by ID.

**Example:**
```bash
curl "http://localhost:8000/api/v1/appointments/7"
```

#### 4. POST /appointments
Create a new appointment.

**Required Fields:**
- `patient_first_name` - Patient's first name
- `patient_last_name` - Patient's last name
- `patient_phone` - Patient's phone number
- `appointment_datetime` - ISO 8601 datetime
- `appointment_type` - Type (consultation, follow_up, etc.)
- `reason_for_visit` - Reason for the visit

**Optional Fields:**
- `mobile_appointment_id` - For mobile app sync
- `facility_id` or `facility_name` - Healthcare facility
- `doctor_id` or `doctor_name` - Preferred doctor
- `patient_email` - Patient's email
- `duration_minutes` - Duration (default: 30)
- `special_requirements` - Special needs
- `assessment_id` - Link to assessment
- `booking_source` - web, mobile, phone, walk_in

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_first_name": "Juan",
    "patient_last_name": "Dela Cruz",
    "patient_phone": "09123456789",
    "patient_email": "juan@example.com",
    "facility_name": "Philippine Heart Center",
    "appointment_datetime": "2025-11-05T10:00:00",
    "appointment_type": "consultation",
    "reason_for_visit": "Chest pain and shortness of breath",
    "booking_source": "web"
  }'
```

#### 5. POST /appointments/{id}/confirm
Confirm an appointment.

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/7/confirm"
```

#### 6. POST /appointments/{id}/cancel
Cancel an appointment.

**Required Fields:**
- `reason` - Cancellation reason (max 500 chars)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/7/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Patient needs to reschedule"}'
```

#### 7. POST /appointments/{id}/check-in
Check in a patient for their appointment.

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/7/check-in"
```

#### 8. POST /appointments/{id}/reschedule
Reschedule an appointment to a new date/time.

**Required Fields:**
- `new_datetime` - New appointment datetime (ISO 8601)

**Optional Fields:**
- `reason` - Reason for rescheduling (max 500 chars)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/7/reschedule" \
  -H "Content-Type: application/json" \
  -d '{
    "new_datetime": "2025-11-06T14:00:00",
    "reason": "Doctor availability changed"
  }'
```

#### 9. POST /appointments/{id}/complete
Mark an appointment as completed.

**Optional Fields:**
- `visit_summary` - Summary of the visit (max 2000 chars)
- `next_steps` - Follow-up instructions (max 1000 chars)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/7/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "visit_summary": "Patient examined. Blood pressure normal.",
    "next_steps": "Follow up in 2 weeks for test results"
  }'
```

#### 10. POST /appointments/confirm-public
Public confirmation using token (for email/SMS confirmations).

**Required Fields:**
- `token` - 64-character confirmation token

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/appointments/confirm-public" \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123..."}'
```

## Testing

### Automated Test Script
A comprehensive test script is provided: `backend/test-appointment-public-routes.sh`

**Run tests:**
```bash
cd backend
chmod +x test-appointment-public-routes.sh
./test-appointment-public-routes.sh
```

**Tests included:**
1. Get appointment statistics
2. List appointments with pagination
3. Get single appointment
4. Create new appointment
5. Confirm appointment
6. Check-in patient
7. Complete appointment

### Manual Testing
Individual endpoints can be tested using curl:

```bash
# Get statistics
curl "http://localhost:8000/api/v1/appointments/statistics" | jq .

# List appointments
curl "http://localhost:8000/api/v1/appointments?per_page=5" | jq .

# Get single appointment
curl "http://localhost:8000/api/v1/appointments/7" | jq .
```

## Security Considerations

### Current State (Temporary)
- **No authentication required** for appointment endpoints
- All endpoints use `throttle:public` rate limiting
- User actions default to admin user (ID 1) when not authenticated

### TODO: Before Production
1. **Re-enable authentication:**
   - Uncomment protected routes in `api.php` (lines 329-373)
   - Comment out or remove public routes (lines 106-138)

2. **Remove temporary fallbacks:**
   - Remove `auth()->id() ?? 1` fallbacks in controller methods
   - Restore proper user tracking for actions

3. **Update comments:**
   - Remove "TEMPORARY" comments
   - Update documentation

4. **Test with authentication:**
   - Verify all endpoints work with Sanctum authentication
   - Test permission middleware on protected routes

## Rate Limiting
All public appointment routes use the `throttle:public` middleware:
- Default: 60 requests per minute per IP
- Can be configured in `app/Http/Kernel.php`

## Frontend Integration

### Example React/Next.js Usage

```typescript
// lib/api/appointments.ts
const API_BASE = 'http://localhost:8000/api/v1';

export async function getAppointments(params?: {
  status?: string;
  per_page?: number;
}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/appointments?${query}`);
  return response.json();
}

export async function getAppointmentStatistics() {
  const response = await fetch(`${API_BASE}/appointments/statistics`);
  return response.json();
}

export async function confirmAppointment(id: number) {
  const response = await fetch(`${API_BASE}/appointments/${id}/confirm`, {
    method: 'POST',
  });
  return response.json();
}

export async function createAppointment(data: AppointmentData) {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "patient_first_name": ["The patient first name field is required."]
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Appointment not found",
  "error": "No query results for model [App\\Models\\Appointment] 999"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to book appointment",
  "error": "Time slot not available: Already booked"
}
```

## Notes

1. **Appointment Statuses:**
   - `scheduled` - Initial status when created
   - `confirmed` - Patient confirmed attendance
   - `rescheduled` - Moved to different time
   - `cancelled` - Cancelled by patient or facility
   - `checked_in` - Patient arrived and checked in
   - `in_progress` - Consultation in progress
   - `completed` - Visit completed
   - `no_show` - Patient did not arrive

2. **Business Rules:**
   - Appointments can only be cancelled in certain states (enforced by `canBeCancelled()`)
   - Appointments can only be rescheduled in certain states (enforced by `canBeRescheduled()`)
   - New appointments must be in the future (web), but past dates allowed for mobile sync

3. **Mobile App Support:**
   - `mobile_appointment_id` enables offline-first sync
   - Duplicate `mobile_appointment_id` returns existing appointment (idempotency)
   - Facility name resolution supports fuzzy matching
   - Past appointment dates allowed for mobile bookings (offline sync scenario)

## Related Files
- `/backend/routes/api.php` - Route definitions
- `/backend/app/Http/Controllers/Api/AppointmentController.php` - Controller logic
- `/backend/app/Services/AppointmentService.php` - Business logic
- `/backend/app/Models/Appointment.php` - Eloquent model
- `/backend/test-appointment-public-routes.sh` - Test script

## Support
For issues or questions, refer to:
- Project documentation in `.claude/docs/`
- API documentation in `backend/API_DOCUMENTATION.md`
- Session history in `.claude/docs/session-history.md`
