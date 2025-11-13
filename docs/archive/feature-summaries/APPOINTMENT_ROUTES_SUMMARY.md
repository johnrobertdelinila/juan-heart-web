# Appointment Routes - Quick Reference

## Summary
Temporary public routes have been added for the Appointments API to support frontend development. All appointment endpoints are now accessible without authentication.

## Changes Made

### 1. Routes (`/backend/routes/api.php`)
- **Added:** 10 public appointment routes (lines 106-138)
- **Commented out:** Protected appointment routes (lines 329-373)
- All routes use `throttle:public` rate limiting

### 2. Controller (`/backend/app/Http/Controllers/Api/AppointmentController.php`)
- **Added:** `statistics()` method for appointment statistics
- **Updated:** `cancel()` and `checkIn()` methods to handle no authentication
- Uses `auth()->id() ?? 1` fallback (defaults to admin user)

## Available Endpoints

### Base URL: `http://localhost:8000/api/v1/appointments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List appointments (with filters) |
| GET | `/statistics` | Get today's statistics |
| GET | `/{id}` | Get single appointment |
| POST | `/` | Create appointment |
| POST | `/{id}/confirm` | Confirm appointment |
| POST | `/{id}/cancel` | Cancel appointment |
| POST | `/{id}/check-in` | Check in patient |
| POST | `/{id}/reschedule` | Reschedule appointment |
| POST | `/{id}/complete` | Complete appointment |
| POST | `/confirm-public` | Public token-based confirmation |

## Quick Test Examples

```bash
# Get statistics
curl "http://localhost:8000/api/v1/appointments/statistics"

# List appointments
curl "http://localhost:8000/api/v1/appointments?per_page=5"

# Get single appointment
curl "http://localhost:8000/api/v1/appointments/7"

# Create appointment
curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_first_name": "Juan",
    "patient_last_name": "Dela Cruz",
    "patient_phone": "09123456789",
    "facility_name": "Philippine Heart Center",
    "appointment_datetime": "2025-11-05T10:00:00",
    "appointment_type": "consultation",
    "reason_for_visit": "Check up"
  }'

# Confirm appointment
curl -X POST "http://localhost:8000/api/v1/appointments/7/confirm"

# Check in patient
curl -X POST "http://localhost:8000/api/v1/appointments/7/check-in"

# Complete appointment
curl -X POST "http://localhost:8000/api/v1/appointments/7/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "visit_summary": "Patient examined",
    "next_steps": "Follow up in 2 weeks"
  }'
```

## Testing

Run the automated test script:
```bash
cd backend
chmod +x test-appointment-public-routes.sh
./test-appointment-public-routes.sh
```

## Before Production

### TODO: Re-enable Authentication
1. Uncomment protected routes in `api.php` (lines 329-373)
2. Comment out public routes (lines 106-138)
3. Remove `auth()->id() ?? 1` fallbacks in controller
4. Test with Sanctum authentication

## Files Modified
- `/backend/routes/api.php`
- `/backend/app/Http/Controllers/Api/AppointmentController.php`

## Files Created
- `/backend/test-appointment-public-routes.sh` - Test script
- `/backend/APPOINTMENT_PUBLIC_ROUTES_IMPLEMENTATION.md` - Full documentation
- `/APPOINTMENT_ROUTES_SUMMARY.md` - This file

## Security Note
⚠️ These are **TEMPORARY** public routes for development only. Authentication MUST be implemented before production deployment.

## Rate Limiting
- All routes use `throttle:public` middleware
- Default: 60 requests per minute per IP

## Frontend Integration

The frontend appointments page at `/Users/johnrobertdelinila/Developer/Systems/Juan Heart Web App/frontend/src/app/(dashboard)/appointments/page.tsx` can now:
- Fetch appointment statistics
- List and filter appointments
- View appointment details
- Confirm, check-in, and complete appointments
- Create new appointments

All endpoints return JSON with this structure:
```json
{
  "success": true,
  "data": { /* appointment data */ },
  "timestamp": "2025-11-03T07:19:10.175477Z"
}
```

## Support
For detailed documentation, see:
- `/backend/APPOINTMENT_PUBLIC_ROUTES_IMPLEMENTATION.md`
- `.claude/docs/api.md`
- `.claude/docs/backend-guidelines.md`
