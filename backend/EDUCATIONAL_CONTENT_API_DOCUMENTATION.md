# Educational Content API Documentation

## Overview

The Educational Content API provides bilingual cardiovascular disease (CVD) prevention content for the Juan Heart Mobile application. It supports offline-first architecture with incremental sync capabilities.

**Base URL:** `http://your-domain.com/api/v1/mobile/educational-content`

**Version:** 1.0

**Authentication:** Public (no authentication required for Phase 6)

---

## Endpoints

### 1. Get All Published Educational Content

Retrieves all published educational content with optional filtering, pagination, and language support.

**Endpoint:** `GET /`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category (see available categories below) |
| `language` | string | No | - | Filter response language: `en` (English only), `fil` (Filipino only), or omit for both |
| `search` | string | No | - | Search in title and description (max 255 chars) |
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 50 | Items per page (max: 200) |

**Available Categories:**
- `cvd_prevention` - CVD Prevention
- `symptom_recognition` - Symptom Recognition
- `lifestyle_modification` - Healthy Lifestyle
- `medication_compliance` - Medication Guide
- `emergency_response` - Emergency Response
- `risk_factors` - Risk Factors
- `nutrition` - Nutrition
- `exercise` - Exercise

**Example Request:**
```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content?category=cvd_prevention&per_page=10"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "category": "cvd_prevention",
      "title_en": "Understanding Cardiovascular Disease",
      "title_fil": "Pag-unawa sa Sakit sa Puso at Ugat",
      "description_en": "Learn about cardiovascular disease...",
      "description_fil": "Alamin ang tungkol sa sakit sa puso...",
      "body_en": "<h2>What is Cardiovascular Disease?</h2>...",
      "body_fil": "<h2>Ano ang Sakit sa Puso at Ugat?</h2>...",
      "reading_time_minutes": 8,
      "image_url": null,
      "author": "Dr. Maria Santos",
      "views": 1234,
      "published": true,
      "version": 1,
      "created_at": "2025-10-27T12:00:00+00:00",
      "updated_at": "2025-10-27T12:00:00+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 10,
    "last_page": 1,
    "total_views": 5678,
    "filters_applied": {
      "category": "cvd_prevention"
    }
  }
}
```

**Error Responses:**

422 Unprocessable Entity (Invalid parameters):
```json
{
  "success": false,
  "message": "Invalid query parameters",
  "errors": {
    "category": ["The selected category is invalid."]
  }
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "message": "Failed to fetch educational content",
  "error": "Error message"
}
```

---

### 2. Incremental Sync

Fetches only content that has been added or updated since a specific timestamp. Essential for offline-first mobile apps to minimize data transfer.

**Endpoint:** `GET /sync`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since` | datetime | Yes | ISO 8601 timestamp (e.g., `2025-10-27T12:00:00Z`) |

**Example Request:**
```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content/sync?since=2025-10-27T12:00:00Z"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "5",
      "category": "symptom_recognition",
      "title_en": "Warning Signs of Heart Attack",
      "title_fil": "Mga Babala ng Heart Attack",
      "description_en": "Recognize the warning signs...",
      "description_fil": "Kilalanin ang mga babala...",
      "body_en": "<h2>Heart Attack Warning Signs</h2>...",
      "body_fil": "<h2>Mga Babala ng Heart Attack</h2>...",
      "reading_time_minutes": 4,
      "image_url": null,
      "author": "Dr. Maria Santos",
      "views": 567,
      "published": true,
      "version": 1,
      "created_at": "2025-10-29T08:30:00+00:00",
      "updated_at": "2025-10-29T08:30:00+00:00"
    }
  ],
  "meta": {
    "total": 1,
    "since": "2025-10-27T12:00:00+00:00",
    "last_updated": "2025-10-29T08:30:00+00:00",
    "has_more": false
  }
}
```

**Error Responses:**

422 Unprocessable Entity (Missing/invalid timestamp):
```json
{
  "success": false,
  "message": "Invalid timestamp parameter",
  "errors": {
    "since": ["The since field is required."]
  }
}
```

---

### 3. Get Single Content by ID

Retrieves a single educational content item by ID and automatically increments the view count.

**Endpoint:** `GET /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Educational content ID |

**Example Request:**
```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content/1"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "category": "cvd_prevention",
    "title_en": "Understanding Cardiovascular Disease",
    "title_fil": "Pag-unawa sa Sakit sa Puso at Ugat",
    "description_en": "Learn about cardiovascular disease...",
    "description_fil": "Alamin ang tungkol sa sakit sa puso...",
    "body_en": "<h2>What is Cardiovascular Disease?</h2>...",
    "body_fil": "<h2>Ano ang Sakit sa Puso at Ugat?</h2>...",
    "reading_time_minutes": 8,
    "image_url": null,
    "author": "Dr. Maria Santos",
    "views": 1235,
    "published": true,
    "version": 1,
    "created_at": "2025-10-27T12:00:00+00:00",
    "updated_at": "2025-10-27T12:00:00+00:00"
  }
}
```

**Error Responses:**

404 Not Found (Content doesn't exist or unpublished):
```json
{
  "success": false,
  "message": "Educational content not found"
}
```

---

### 4. Get Available Categories

Returns all available content categories with content counts.

**Endpoint:** `GET /categories`

**Example Request:**
```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content/categories"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "value": "cvd_prevention",
      "count": 3
    },
    {
      "value": "symptom_recognition",
      "count": 2
    },
    {
      "value": "lifestyle_modification",
      "count": 2
    },
    {
      "value": "medication_compliance",
      "count": 0
    },
    {
      "value": "emergency_response",
      "count": 1
    },
    {
      "value": "risk_factors",
      "count": 2
    },
    {
      "value": "nutrition",
      "count": 0
    },
    {
      "value": "exercise",
      "count": 0
    }
  ],
  "meta": {
    "total_categories": 8
  }
}
```

---

### 5. Get Content Statistics

Returns comprehensive statistics about educational content, including total count, views, and most popular articles.

**Endpoint:** `GET /stats`

**Example Request:**
```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content/stats"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_content": 10,
    "total_views": 5678,
    "by_category": {
      "cvd_prevention": 3,
      "symptom_recognition": 2,
      "lifestyle_modification": 2,
      "emergency_response": 1,
      "risk_factors": 2
    },
    "most_viewed": [
      {
        "id": 1,
        "title_en": "Understanding Cardiovascular Disease",
        "title_fil": "Pag-unawa sa Sakit sa Puso at Ugat",
        "category": "cvd_prevention",
        "views": 1234
      },
      {
        "id": 4,
        "title_en": "Warning Signs of Heart Attack",
        "title_fil": "Mga Babala ng Heart Attack",
        "category": "symptom_recognition",
        "views": 892
      }
    ],
    "recent_count": 3
  },
  "meta": {
    "generated_at": "2025-11-01T21:30:00+00:00"
  }
}
```

---

## Response Structure

### Success Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "data": {}, // or []
  "meta": {}  // optional metadata
}
```

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)",
  "errors": {}  // validation errors (422 only)
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Request successful |
| 404 | Not Found | Content ID doesn't exist or is unpublished |
| 422 | Unprocessable Entity | Validation failed (invalid parameters) |
| 500 | Internal Server Error | Server-side error occurred |

---

## Data Types

### EducationalContent Object

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string | No | Unique content identifier |
| `category` | string | No | Content category (enum) |
| `title_en` | string | No | English title |
| `title_fil` | string | No | Filipino title |
| `description_en` | string | Yes | Short English description |
| `description_fil` | string | Yes | Short Filipino description |
| `body_en` | string | No | Full English content (HTML) |
| `body_fil` | string | No | Full Filipino content (HTML) |
| `reading_time_minutes` | integer | No | Estimated reading time (minutes) |
| `image_url` | string | Yes | Cover image URL |
| `author` | string | Yes | Content author name |
| `views` | integer | No | Total view count |
| `published` | boolean | No | Visibility flag |
| `version` | integer | No | Content version (for updates) |
| `created_at` | datetime | No | ISO 8601 timestamp |
| `updated_at` | datetime | No | ISO 8601 timestamp |

---

## Usage Examples

### Example 1: Initial Content Download (Mobile App First Launch)

Download all content for offline caching:

```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content?per_page=200"
```

Store the `updated_at` timestamp of the latest item for future sync.

### Example 2: Incremental Sync (App Reopened After 7 Days)

Fetch only new/updated content since last sync:

```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content/sync?since=2025-10-25T10:00:00Z"
```

### Example 3: Search for Heart Attack Content

```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content?search=heart+attack"
```

### Example 4: Get Filipino-Only Content for CVD Prevention

```bash
curl -X GET "http://your-domain.com/api/v1/mobile/educational-content?category=cvd_prevention&language=fil"
```

---

## Integration Notes for Mobile App

### 1. Offline-First Strategy

- **Initial Load:** Download all content (`GET /`) and cache locally in Hive
- **Incremental Sync:** Use `GET /sync?since={timestamp}` to fetch updates
- **Cache Invalidation:** Replace cached items with updated versions based on `updated_at`

### 2. Language Handling

- For **offline caching:** Omit `language` parameter to get both languages
- For **UI display:** Use `language=en` or `language=fil` to reduce bandwidth
- Mobile app should handle language switching locally from cached bilingual content

### 3. View Count Tracking

- View count increments automatically when calling `GET /{id}`
- Don't call this endpoint during bulk sync to avoid inflating view counts
- Use `GET /` or `GET /sync` for bulk operations

### 4. Performance Optimization

- Set appropriate `per_page` values (50-100 for initial load)
- Use category filtering when possible to reduce payload
- Implement exponential backoff for failed sync attempts

### 5. Version Management

- Check `version` field to detect content updates
- Higher version = newer content
- Use this to trigger cache updates in mobile app

---

## Rate Limiting

Currently, no rate limiting is enforced. This will be added in future releases with:
- **Free Tier:** 1000 requests/hour
- **Premium Tier:** 10,000 requests/hour

---

## Changelog

### Version 1.0 (November 1, 2025)
- Initial release
- 5 public endpoints
- Bilingual support (English/Filipino)
- 8 content categories
- Incremental sync support
- View count tracking

---

## Support

For API issues or feature requests, contact:
- **Email:** support@juanheart.ph
- **Developer:** John Robert Delinila
- **GitHub:** [Juan Heart Mobile Repository](#)

---

## Related Documentation

- [Mobile Facility API Documentation](./MOBILE_FACILITY_API_DOCUMENTATION.md)
- [Mobile API Setup Guide](./MOBILE_API_SETUP_GUIDE.md)
- [Mobile API Sync Guide](./MOBILE_API_SYNC_GUIDE.md)
