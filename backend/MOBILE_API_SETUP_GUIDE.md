# Mobile Facility API - Setup & Testing Guide

## Overview
This guide provides step-by-step instructions for setting up and testing the Mobile Facility API endpoints for Juan Heart Mobile app.

---

## Prerequisites

1. **PHP 8.2+** installed
2. **Composer** installed
3. **MySQL/MariaDB** running
4. **Laravel 11.x** project setup complete
5. **Database configured** in `.env` file

---

## Installation Steps

### 1. Verify Database Connection

```bash
# Check your .env file
cat .env | grep DB_

# Expected output:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=juan_heart
# DB_USERNAME=root
# DB_PASSWORD=your_password
```

### 2. Run Migrations

```bash
# Run all migrations
php artisan migrate

# Verify healthcare_facilities table exists
php artisan db:show --table=healthcare_facilities
```

### 3. Seed Facility Data

```bash
# Seed sample facility data (5 facilities)
php artisan db:seed --class=FacilityDataSeeder

# Verify data
php artisan tinker
>>> App\Models\HealthcareFacility::count()
# Should return: 5
>>> exit
```

### 4. Clear and Cache Routes

```bash
# Clear route cache
php artisan route:clear

# Cache routes for better performance
php artisan route:cache

# Verify mobile routes exist
php artisan route:list | grep mobile
```

**Expected output:**
```
GET|HEAD  api/v1/mobile/facilities
GET|HEAD  api/v1/mobile/facilities/count
GET|HEAD  api/v1/mobile/facilities/nearby
GET|HEAD  api/v1/mobile/facilities/regions
GET|HEAD  api/v1/mobile/facilities/sync
GET|HEAD  api/v1/mobile/facilities/types
GET|HEAD  api/v1/mobile/facilities/{id}
```

### 5. Start Development Server

```bash
# Start Laravel development server
php artisan serve

# Server should start at: http://localhost:8000
```

---

## Testing the API

### Method 1: Automated Testing Script

```bash
# Make script executable (first time only)
chmod +x test-facility-api.sh

# Run all tests
./test-facility-api.sh
```

### Method 2: Manual cURL Testing

#### Test 1: Get All Facilities
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 5,
    "last_updated": "2025-02-01T10:00:00+08:00",
    "version": "1.0"
  }
}
```

#### Test 2: Get Facility Count
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/count" | jq
```

#### Test 3: Get Single Facility
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/1" | jq
```

#### Test 4: Nearby Search
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/nearby?latitude=14.6417&longitude=121.0491&radius=50" | jq
```

#### Test 5: Sync Endpoint
```bash
curl -X GET "http://localhost:8000/api/v1/mobile/facilities/sync?since=2025-01-01T00:00:00Z" | jq
```

### Method 3: Postman Testing

1. **Import Collection:**
   - Open Postman
   - Create new collection: "Juan Heart Mobile API"
   - Add requests for each endpoint

2. **Set Environment Variables:**
   ```
   base_url: http://localhost:8000/api/v1
   ```

3. **Test Each Endpoint:**
   - GET `{{base_url}}/mobile/facilities`
   - GET `{{base_url}}/mobile/facilities/count`
   - GET `{{base_url}}/mobile/facilities/1`
   - GET `{{base_url}}/mobile/facilities/nearby?latitude=14.6417&longitude=121.0491&radius=50`
   - GET `{{base_url}}/mobile/facilities/sync?since=2025-01-01T00:00:00Z`
   - GET `{{base_url}}/mobile/facilities/regions`
   - GET `{{base_url}}/mobile/facilities/types`

---

## File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── Mobile/
│   │   │           └── FacilityController.php   # Main controller
│   │   └── Resources/
│   │       └── Mobile/
│   │           └── FacilityResource.php         # JSON transformer
│   └── Models/
│       └── HealthcareFacility.php               # Existing model
├── database/
│   ├── migrations/
│   │   └── 2025_10_22_055452_create_healthcare_facilities_table.php
│   └── seeders/
│       └── FacilityDataSeeder.php               # Sample data
├── routes/
│   └── api.php                                  # API routes
├── MOBILE_FACILITY_API_DOCUMENTATION.md         # Full API docs
├── MOBILE_API_SETUP_GUIDE.md                    # This file
└── test-facility-api.sh                         # Test script
```

---

## Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mobile/facilities` | GET | Get all facilities with optional filters |
| `/mobile/facilities/sync` | GET | Incremental sync since timestamp |
| `/mobile/facilities/count` | GET | Get counts and statistics |
| `/mobile/facilities/{id}` | GET | Get single facility by ID |
| `/mobile/facilities/nearby` | GET | Geospatial search by coordinates |
| `/mobile/facilities/regions` | GET | Get unique list of regions |
| `/mobile/facilities/types` | GET | Get unique list of facility types |

---

## Query Parameters

### Get All Facilities
- `region`: Filter by region (e.g., "National Capital Region")
- `type`: Filter by type (e.g., "Tertiary Hospital")
- `services`: Comma-separated services (e.g., "Cardiology,Emergency")
- `emergency_only`: true/false
- `philhealth_only`: true/false

### Sync Endpoint
- `since`: ISO 8601 timestamp (required)

### Nearby Search
- `latitude`: GPS latitude (required, -90 to 90)
- `longitude`: GPS longitude (required, -180 to 180)
- `radius`: Search radius in km (optional, default: 50, max: 100)

---

## Troubleshooting

### Issue: Routes Not Found

**Solution:**
```bash
php artisan route:clear
php artisan route:cache
php artisan route:list | grep mobile
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify .env database credentials
cat .env | grep DB_

# Test connection
php artisan db:show
```

### Issue: Empty Response Data

**Solution:**
```bash
# Check if facilities exist
php artisan tinker
>>> App\Models\HealthcareFacility::count()

# If 0, seed the data
>>> exit
php artisan db:seed --class=FacilityDataSeeder
```

### Issue: 500 Internal Server Error

**Solution:**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Enable debug mode
# In .env: APP_DEBUG=true

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Issue: CORS Error (Mobile App)

**Solution:**
```bash
# Install Laravel CORS package (if not installed)
composer require fruitcake/laravel-cors

# Publish config
php artisan vendor:publish --tag="cors"

# Edit config/cors.php to allow mobile origins
```

---

## Adding More Facilities

### Option 1: Via Seeder

Edit `database/seeders/FacilityDataSeeder.php`:

```php
$facilities = [
    // Add new facility
    [
        'name' => 'New Hospital',
        'code' => 'NH-006',
        'type' => 'Regional Hospital',
        'level' => 'secondary',
        'address' => '123 Main Street',
        'city' => 'Manila',
        'province' => 'Metro Manila',
        'region' => 'National Capital Region',
        'latitude' => 14.5995,
        'longitude' => 120.9842,
        'is_24_7' => true,
        'has_emergency' => true,
        'is_active' => true,
        // ... other fields
    ],
];
```

Then run:
```bash
php artisan db:seed --class=FacilityDataSeeder
```

### Option 2: Via Tinker

```bash
php artisan tinker
>>> App\Models\HealthcareFacility::create([
    'name' => 'New Hospital',
    'code' => 'NH-006',
    'type' => 'Regional Hospital',
    'city' => 'Manila',
    'region' => 'National Capital Region',
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'is_active' => true,
]);
```

### Option 3: Via API (Future Enhancement)

When admin panel is ready, facilities can be managed via web interface.

---

## Performance Optimization

### 1. Database Indexing
Already configured in migration:
- `['city', 'region']` - For location queries
- `type` - For type filtering
- `is_active` - For active facility queries
- `['latitude', 'longitude']` - For geospatial queries

### 2. Query Optimization
```php
// Controller already implements:
- Selective field loading
- Efficient WHERE clauses
- Proper indexing usage
```

### 3. Response Caching (Future)
```bash
# Install Redis (optional)
composer require predis/predis

# Configure in .env
CACHE_DRIVER=redis
```

---

## Security Considerations

### Current Setup (Development)
- **Authentication:** None (public endpoints)
- **Rate Limiting:** Not configured
- **CORS:** Open

### Production Recommendations

1. **Add Authentication:**
```php
// In routes/api.php
Route::middleware('auth:sanctum')->prefix('mobile/facilities')->group(function () {
    // Protected routes
});
```

2. **Implement Rate Limiting:**
```php
Route::middleware('throttle:60,1')->prefix('mobile/facilities')->group(function () {
    // 60 requests per minute
});
```

3. **Configure CORS:**
```php
// config/cors.php
'allowed_origins' => [
    'https://mobile.juanheart.ph',
],
```

4. **Enable HTTPS:**
```bash
# Force HTTPS in production
# In .env: APP_URL=https://api.juanheart.ph
```

---

## Integration with Mobile App

### Flutter Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class FacilityService {
  final String baseUrl = 'http://localhost:8000/api/v1';

  Future<List<Facility>> getAllFacilities() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/facilities')
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Facility.fromJson(json))
          .toList();
    } else {
      throw Exception('Failed to load facilities');
    }
  }

  Future<List<Facility>> getNearbyFacilities(
    double latitude,
    double longitude,
    {double radius = 50}
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/facilities/nearby?latitude=$latitude&longitude=$longitude&radius=$radius')
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((json) => Facility.fromJson(json))
          .toList();
    } else {
      throw Exception('Failed to load nearby facilities');
    }
  }
}
```

---

## Monitoring & Logging

### Enable Detailed Logging

```php
// In app/Http/Controllers/Api/Mobile/FacilityController.php
use Illuminate\Support\Facades\Log;

public function index(Request $request): JsonResponse
{
    Log::info('Facility API called', [
        'filters' => $request->query(),
        'ip' => $request->ip(),
    ]);
    // ... rest of method
}
```

### Monitor Performance

```bash
# Enable query logging in .env
DB_LOG_QUERIES=true

# View slow queries
tail -f storage/logs/laravel.log | grep "SELECT"
```

---

## Next Steps

1. **Complete Database Setup** - Ensure MySQL is running and seeded
2. **Test All Endpoints** - Run `./test-facility-api.sh`
3. **Review API Documentation** - See `MOBILE_FACILITY_API_DOCUMENTATION.md`
4. **Integrate with Mobile App** - Provide base URL to mobile team
5. **Plan Production Deployment** - Configure authentication and rate limiting

---

## Support & Contact

- **Backend Repository:** Juan Heart Web App Backend
- **Mobile Repository:** Juan Heart Mobile
- **Documentation:** See `MOBILE_FACILITY_API_DOCUMENTATION.md`
- **Issues:** Report via GitHub Issues

---

**Created:** February 1, 2025
**Version:** 1.0
**Laravel Version:** 11.x
**PHP Version:** 8.2+
