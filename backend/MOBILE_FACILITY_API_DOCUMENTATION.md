# Mobile Facility API Documentation

## Overview
This API provides healthcare facility data for the Juan Heart Mobile application. It supports offline-first architecture with sync capabilities, geospatial search, and comprehensive filtering.

**Base URL:** `http://localhost:8000/api/v1`
**Mobile Endpoints Prefix:** `/mobile/facilities`

---

## Endpoints

### 1. Get All Facilities
Retrieve all active healthcare facilities.

**Endpoint:** `GET /mobile/facilities`

**Query Parameters:**
- `region` (optional): Filter by region (e.g., "National Capital Region")
- `type` (optional): Filter by facility type (e.g., "Tertiary Hospital")
- `services` (optional): Comma-separated services (e.g., "Cardiology,Emergency")
- `emergency_only` (optional): Set to `true` to get only facilities with emergency services
- `philhealth_only` (optional): Set to `true` to get only PhilHealth-accredited facilities

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "PHC-001",
      "name": "Philippine Heart Center",
      "type": "specialty_center",
      "level": "tertiary",
      "latitude": 14.6417,
      "longitude": 121.0491,
      "address": "East Avenue, Diliman",
      "municipality": "Quezon City",
      "city": "Quezon City",
      "province": "Metro Manila",
      "region": "National Capital Region",
      "contact_number": "+63-2-8925-2401",
      "phone": "+63-2-8925-2401",
      "email": "info@phc.gov.ph",
      "website": "https://www.phc.gov.ph",
      "services": ["Cardiology", "Cardiac Surgery", "ICU", "Emergency", "Laboratory"],
      "emergency_services": true,
      "open_24_hours": true,
      "accepts_philhealth": true,
      "capacity": 400,
      "bed_capacity": 400,
      "icu_capacity": 50,
      "current_bed_availability": 75,
      "operating_hours": {
        "Monday-Sunday": "24/7"
      },
      "is_public": true,
      "is_doh_accredited": true,
      "accreditations": ["DOH Level 3", "PhilHealth", "ISO 9001"],
      "accepts_referrals": true,
      "average_response_time_hours": 4,
      "preferred_referral_types": ["High Risk CVD", "Cardiac Emergency", "Complex Cases"],
      "is_active": true,
      "status_notes": null,
      "description": "Tertiary care. Specialty Center. Emergency services, 24/7 operations, PhilHealth accredited. Located in Quezon City. National Capital Region.",
      "created_at": "2025-01-01T00:00:00+08:00",
      "updated_at": "2025-02-01T10:00:00+08:00",
      "bed_occupancy_percentage": 81.25
    }
  ],
  "meta": {
    "total": 5,
    "last_updated": "2025-02-01T10:00:00+08:00",
    "version": "1.0",
    "filters_applied": {}
  }
}
```

---

### 2. Sync Facilities (Incremental Update)
Get facilities updated since a specific timestamp.

**Endpoint:** `GET /mobile/facilities/sync?since={timestamp}`

**Query Parameters:**
- `since` (required): ISO 8601 timestamp (e.g., "2025-01-15T00:00:00Z")

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/sync?since=2025-01-15T00:00:00Z"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Makati Medical Center",
      "updated_at": "2025-01-20T14:30:00+08:00"
    }
  ],
  "meta": {
    "total": 1,
    "since": "2025-01-15T00:00:00+08:00",
    "last_updated": "2025-02-01T10:00:00+08:00",
    "has_more": false,
    "version": "1.0"
  }
}
```

---

### 3. Get Facility Count & Statistics
Retrieve facility counts and statistics.

**Endpoint:** `GET /mobile/facilities/count`

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/count"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "by_type": {
      "Specialty Center": 1,
      "Tertiary Hospital": 1,
      "Medical Center": 2,
      "Regional Hospital": 1
    },
    "by_region": {
      "National Capital Region": 5
    },
    "with_emergency": 5,
    "philhealth_accredited": 5,
    "open_24_hours": 5
  },
  "meta": {
    "generated_at": "2025-02-01T10:00:00+08:00",
    "version": "1.0"
  }
}
```

---

### 4. Get Single Facility
Retrieve details of a specific facility.

**Endpoint:** `GET /mobile/facilities/{id}`

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Philippine Heart Center",
    "type": "specialty_center",
    "latitude": 14.6417,
    "longitude": 121.0491
  }
}
```

---

### 5. Search Nearby Facilities (Geospatial)
Find facilities within a radius from coordinates.

**Endpoint:** `GET /mobile/facilities/nearby`

**Query Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in kilometers (default: 50, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/nearby?latitude=14.5995&longitude=120.9842&radius=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Manila Doctors Hospital",
      "latitude": 14.5842,
      "longitude": 120.9822,
      "distance": 1.85
    }
  ],
  "meta": {
    "total": 1,
    "center": {
      "latitude": 14.5995,
      "longitude": 120.9842
    },
    "radius_km": 10,
    "version": "1.0"
  }
}
```

---

### 6. Get Regions List
Retrieve unique list of regions.

**Endpoint:** `GET /mobile/facilities/regions`

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/regions"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    "National Capital Region",
    "Region I - Ilocos Region",
    "Region III - Central Luzon"
  ],
  "meta": {
    "total": 3
  }
}
```

---

### 7. Get Facility Types List
Retrieve unique list of facility types.

**Endpoint:** `GET /mobile/facilities/types`

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/types"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    "Barangay Health Center",
    "Medical Center",
    "Regional Hospital",
    "Specialty Center",
    "Tertiary Hospital"
  ],
  "meta": {
    "total": 5
  }
}
```

---

## Error Responses

### 404 - Not Found
```json
{
  "success": false,
  "message": "Facility not found"
}
```

### 422 - Validation Error
```json
{
  "success": false,
  "message": "Invalid parameters",
  "errors": {
    "latitude": ["The latitude field is required."],
    "longitude": ["The longitude field is required."]
  }
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Failed to fetch facilities",
  "error": "Database connection error"
}
```

---

## Data Fields Reference

### Facility Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique facility ID |
| `code` | string | Facility code (e.g., "PHC-001") |
| `name` | string | Facility name |
| `type` | string | Facility type (mobile-friendly format) |
| `level` | string | Care level: "primary", "secondary", "tertiary" |
| `latitude` | float | GPS latitude coordinate |
| `longitude` | float | GPS longitude coordinate |
| `address` | string | Street address |
| `municipality` | string | Municipality/city |
| `city` | string | City name |
| `province` | string | Province name |
| `region` | string | Administrative region |
| `contact_number` | string | Primary contact number |
| `phone` | string | Phone number |
| `email` | string | Email address |
| `website` | string | Website URL |
| `services` | array | List of services offered |
| `emergency_services` | boolean | Has emergency services |
| `open_24_hours` | boolean | Operates 24/7 |
| `accepts_philhealth` | boolean | PhilHealth accredited |
| `capacity` | integer | Total bed capacity |
| `bed_capacity` | integer | Total bed capacity |
| `icu_capacity` | integer | ICU bed capacity |
| `current_bed_availability` | integer | Currently available beds |
| `operating_hours` | object | Operating hours schedule |
| `is_public` | boolean | Public or private facility |
| `is_doh_accredited` | boolean | DOH accredited |
| `accreditations` | array | List of accreditations |
| `accepts_referrals` | boolean | Accepts patient referrals |
| `average_response_time_hours` | integer | Average response time |
| `preferred_referral_types` | array | Preferred referral types |
| `is_active` | boolean | Facility is active |
| `status_notes` | string | Status notes |
| `description` | string | Generated description |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |
| `distance` | float | Distance in km (nearby search only) |
| `bed_occupancy_percentage` | float | Bed occupancy percentage |

---

## Facility Type Mapping

Database Type → Mobile Type:
- "Barangay Health Center" → "health_center"
- "Rural Health Unit" → "health_center"
- "Primary Care Clinic" → "clinic"
- "District Hospital" → "hospital"
- "Provincial Hospital" → "hospital"
- "Regional Hospital" → "hospital"
- "Tertiary Hospital" → "hospital"
- "Medical Center" → "medical_center"
- "Specialty Center" → "specialty_center"
- "Emergency Facility" → "emergency"

---

## Integration Notes

### Mobile App Implementation

1. **Initial Sync:**
   ```dart
   // Fetch all facilities on first launch
   final response = await http.get(
     Uri.parse('$baseUrl/mobile/facilities')
   );
   ```

2. **Incremental Sync:**
   ```dart
   // Sync facilities updated since last sync
   final lastSync = await getLastSyncTimestamp();
   final response = await http.get(
     Uri.parse('$baseUrl/mobile/facilities/sync?since=$lastSync')
   );
   ```

3. **Geospatial Search:**
   ```dart
   // Find nearby facilities
   final position = await Geolocator.getCurrentPosition();
   final response = await http.get(
     Uri.parse('$baseUrl/mobile/facilities/nearby?latitude=${position.latitude}&longitude=${position.longitude}&radius=20')
   );
   ```

### Offline-First Strategy

1. **Initial Load:** Fetch all facilities and store in local SQLite database
2. **Periodic Sync:** Use `/sync` endpoint to get incremental updates
3. **Offline Fallback:** Use local data when network is unavailable
4. **Cache Headers:** Store `last_updated` timestamp for sync tracking

### Performance Optimization

- **Caching:** Implement 24-hour cache for facility data
- **Pagination:** Future enhancement for large datasets (>500 facilities)
- **Compression:** Enable GZIP compression on responses
- **Rate Limiting:** Implement rate limiting for production (TBD)

---

## Testing Commands

### Using cURL

```bash
# Test all facilities
curl -X GET "http://localhost:8000/api/v1/mobile/facilities"

# Test with filters
curl -X GET "http://localhost:8000/api/v1/mobile/facilities?region=National+Capital+Region&emergency_only=true"

# Test sync
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/sync?since=2025-01-01T00:00:00Z"

# Test count
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/count"

# Test nearby search
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/nearby?latitude=14.5995&longitude=120.9842&radius=50"

# Test single facility
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/1"

# Test regions
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/regions"

# Test types
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/types"
```

### Using Postman

1. Import the following collection URL structure
2. Set base URL variable: `http://localhost:8000/api/v1`
3. Test each endpoint with sample parameters

---

## Database Setup

### Run Migrations
```bash
php artisan migrate
```

### Seed Facility Data
```bash
php artisan db:seed --class=FacilityDataSeeder
```

### Verify Data
```bash
php artisan tinker
>>> App\Models\HealthcareFacility::count()
>>> App\Models\HealthcareFacility::where('is_active', true)->get()
```

---

## Security Notes

- **Current Status:** Public endpoints (no authentication required)
- **Production Plan:** Implement Sanctum API token authentication
- **Rate Limiting:** To be configured for production deployment
- **CORS:** Configure allowed origins for mobile app
- **Data Privacy:** All patient data excluded from facility endpoints

---

## Version History

### Version 1.0 (February 2025)
- Initial release
- 7 endpoints: index, sync, count, show, nearby, regions, types
- Support for 500+ facilities
- Geospatial search with Haversine formula
- Incremental sync capability
- Comprehensive filtering

---

## Support

For issues or questions:
- Backend Repository: Juan Heart Web App Backend
- Mobile App Repository: Juan Heart Mobile
- Contact: Philippine Heart Center - University of Cordilleras

---

**Last Updated:** February 1, 2025
**API Version:** 1.0
**Laravel Version:** 11.x
