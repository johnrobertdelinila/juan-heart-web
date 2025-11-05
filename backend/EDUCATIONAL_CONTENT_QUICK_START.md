# Educational Content API - Quick Start Guide

## Overview
This guide will help you quickly set up and test the Educational Content API for the Juan Heart Mobile application.

---

## Prerequisites
- PHP 8.1+ installed
- MySQL database running
- Composer dependencies installed
- Laravel server ready

---

## Setup Steps (5 Minutes)

### 1. Start Laravel Development Server
```bash
cd "/Users/johnrobertdelinila/Developer/Systems/Juan Heart Web App/backend"
php artisan serve
```

Expected output:
```
INFO  Server running on [http://127.0.0.1:8000].
```

### 2. Run Database Migration
Open a new terminal and run:
```bash
cd "/Users/johnrobertdelinila/Developer/Systems/Juan Heart Web App/backend"
php artisan migrate --path=database/migrations/2025_11_01_213954_create_educational_contents_table.php
```

Expected output:
```
INFO  Running migrations.
2025_11_01_213954_create_educational_contents_table ................ 0.05s DONE
```

### 3. Seed Sample Data
```bash
php artisan db:seed --class=EducationalContentSeeder
```

Expected output:
```
INFO  Seeding database.
Successfully seeded 10 educational content articles!
```

### 4. Test the API
```bash
./test-educational-content-api.sh
```

Expected output:
```
========================================
Educational Content API Test Suite
========================================
Base URL: http://localhost:8000
...
✓ PASS: All tests passed!
```

---

## Manual Testing (Optional)

### Test Endpoint 1: Get All Content
```bash
curl http://localhost:8000/api/v1/mobile/educational-content | jq
```

### Test Endpoint 2: Get by Category
```bash
curl "http://localhost:8000/api/v1/mobile/educational-content?category=cvd_prevention" | jq
```

### Test Endpoint 3: Get Single Content
```bash
curl http://localhost:8000/api/v1/mobile/educational-content/1 | jq
```

### Test Endpoint 4: Get Categories
```bash
curl http://localhost:8000/api/v1/mobile/educational-content/categories | jq
```

### Test Endpoint 5: Get Statistics
```bash
curl http://localhost:8000/api/v1/mobile/educational-content/stats | jq
```

---

## Verification Checklist

- [ ] Server running on http://localhost:8000
- [ ] Migration executed successfully
- [ ] Database has 10 educational content records
- [ ] All API endpoints return 200 OK
- [ ] Test script passes all tests
- [ ] JSON responses are well-formed

---

## Database Verification

Check if data was seeded correctly:

```bash
php artisan tinker
```

Then run:
```php
// Count total content
App\Models\EducationalContent::count();
// Should return: 10

// Check categories
App\Models\EducationalContent::pluck('category')->unique();
// Should show multiple categories

// Get first content
App\Models\EducationalContent::first()->toArray();
// Should show full content details
```

---

## Troubleshooting

### Issue: "Connection refused"
**Solution:** Start the Laravel server first
```bash
php artisan serve
```

### Issue: "Database connection error"
**Solution:** Check your `.env` file database credentials
```bash
cat .env | grep DB_
```

### Issue: "Migration already ran"
**Solution:** This is fine. The migration has already been applied.

### Issue: "Seeder returns 0 rows"
**Solution:** Run the seeder again
```bash
php artisan db:seed --class=EducationalContentSeeder --force
```

---

## Next Steps

1. **Review API Documentation:**
   - Read `EDUCATIONAL_CONTENT_API_DOCUMENTATION.md` for complete endpoint reference

2. **Review Implementation Details:**
   - Read `EDUCATIONAL_CONTENT_API_IMPLEMENTATION_SUMMARY.md` for architecture details

3. **Integrate with Mobile App:**
   - Update Flutter `EducationalContentService` to call the API
   - Replace hardcoded content with API calls
   - Test offline sync functionality

---

## API Base URL

- **Local Development:** `http://localhost:8000/api/v1/mobile/educational-content`
- **Production:** Update with your production domain

---

## Quick Reference

### All Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List all content (with filters) |
| GET | `/sync?since={timestamp}` | Incremental sync |
| GET | `/{id}` | Get single content + increment views |
| GET | `/categories` | Get all categories with counts |
| GET | `/stats` | Get comprehensive statistics |

### Query Parameters

| Parameter | Values | Example |
|-----------|--------|---------|
| category | cvd_prevention, symptom_recognition, etc. | `?category=cvd_prevention` |
| language | en, fil | `?language=fil` |
| search | Any text | `?search=heart+attack` |
| page | Integer | `?page=2` |
| per_page | 1-200 | `?per_page=50` |

---

## Success!

If all steps completed successfully, your Educational Content API is ready for mobile app integration!

**Created:** November 1, 2025
**Status:** ✅ Ready for Testing
