# Rate Limit JSON Response Example

## When Rate Limit is Exceeded

If a client exceeds the rate limit, they will receive a **JSON response** instead of an HTML error page:

### HTTP Response
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
```

### JSON Body
```json
{
  "message": "Too many requests. Please slow down.",
  "error": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

## Response Fields

- **message** (string): Human-readable error message
- **error** (string): Machine-readable error code for programmatic handling
- **retry_after** (integer): Number of seconds to wait before retrying

## HTTP Headers

- **Retry-After**: Seconds until the rate limit resets
- **X-RateLimit-Limit**: Maximum requests allowed per window
- **X-RateLimit-Remaining**: Number of requests remaining in current window

## Client Implementation Example

### JavaScript/TypeScript
```typescript
async function fetchWithRateLimit(url: string) {
  try {
    const response = await fetch(url);

    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = data.retry_after || 60;

      console.error(`Rate limited. Retry after ${retryAfter} seconds`);

      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchWithRateLimit(url); // Retry
    }

    return response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### cURL
```bash
# If rate limited, cURL will show:
$ curl -i http://localhost:8000/api/v1/appointments

HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "message": "Too many requests. Please slow down.",
  "error": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

## Current Rate Limits

### Development Environment (APP_ENV=local)
- **API endpoints**: 1000 requests/minute
- **Mobile endpoints**: 1000 requests/minute
- **Public endpoints**: 1000 requests/minute
- **Auth endpoints**: 20 requests/minute
- **Export endpoints**: 100 requests/minute
- **Bulk endpoints**: 200 requests/minute

### Production Environment (APP_ENV=production)
- **API endpoints**: 60 requests/minute
- **Mobile endpoints**: 100 requests/minute
- **Public endpoints**: 30 requests/minute
- **Auth endpoints**: 5 requests/minute (brute force protection)
- **Export endpoints**: 10 requests/minute (resource intensive)
- **Bulk endpoints**: 20 requests/minute

## Rate Limiting Strategy

Rate limits are applied:
1. **Per IP address** for unauthenticated requests
2. **Per user ID** for authenticated requests (when Sanctum auth is implemented)

## Testing Rate Limits

Use the provided test script:
```bash
cd backend
./test-rate-limit.sh appointments 100
```

This will make 100 requests to the appointments endpoint and show which ones succeed or are rate limited.

## Best Practices for API Clients

1. **Respect Retry-After header**: Always check and honor the `Retry-After` header
2. **Implement exponential backoff**: If multiple 429 errors occur, increase wait time
3. **Cache responses**: Reduce API calls by caching data client-side
4. **Batch requests**: Use bulk endpoints when available
5. **Monitor rate limits**: Track `X-RateLimit-Remaining` header to prevent hitting limits

## Before Production Deployment

1. Verify `APP_ENV=production` in production `.env`
2. Test API clients with production rate limits in staging
3. Update API documentation with rate limit information
4. Implement monitoring for rate limit violations
5. Consider implementing API keys or authentication for higher limits
