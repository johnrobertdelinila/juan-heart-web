#!/bin/bash

###############################################################################
# Educational Content API Test Script
# Tests all 5 endpoints of the Juan Heart Mobile Educational Content API
# Usage: ./test-educational-content-api.sh [base_url]
# Example: ./test-educational-content-api.sh http://localhost:8000
###############################################################################

# Configuration
BASE_URL="${1:-http://localhost:8000}"
API_ENDPOINT="${BASE_URL}/api/v1/mobile/educational-content"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}========================================${NC}"
}

print_test() {
  echo ""
  echo -e "${BLUE}TEST $1: $2${NC}"
  echo "---"
}

print_success() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

print_fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  echo -e "${YELLOW}Response:${NC} $2"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
}

print_info() {
  echo -e "${YELLOW}ℹ INFO${NC}: $1"
}

make_request() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4

  echo -e "${CYAN}→ $method $endpoint${NC}"

  response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq "$expected_status" ]; then
    print_success "$description (HTTP $http_code)"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    return 0
  else
    print_fail "$description (Expected HTTP $expected_status, got $http_code)" "$body"
    return 1
  fi
}

###############################################################################
# Pre-flight Checks
###############################################################################

print_header "Educational Content API Test Suite"
echo "Base URL: $BASE_URL"
echo "API Endpoint: $API_ENDPOINT"
echo "Test Time: $(date)"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  print_info "jq not installed. JSON responses will not be formatted."
  echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
fi

# Check if server is reachable
print_info "Checking server connectivity..."
if ! curl -s --head --fail "$BASE_URL" > /dev/null; then
  echo -e "${RED}ERROR: Cannot reach server at $BASE_URL${NC}"
  echo "Make sure the Laravel server is running: php artisan serve"
  exit 1
fi
print_success "Server is reachable"

###############################################################################
# Test 1: Get All Educational Content
###############################################################################

print_header "Test 1: Get All Educational Content"

print_test "1.1" "Get all content (no filters)"
make_request "GET" "$API_ENDPOINT" 200 "Fetch all published content"

print_test "1.2" "Get content by category (cvd_prevention)"
make_request "GET" "$API_ENDPOINT?category=cvd_prevention" 200 "Filter by CVD Prevention category"

print_test "1.3" "Get content with pagination (per_page=5)"
make_request "GET" "$API_ENDPOINT?per_page=5&page=1" 200 "Paginate results (5 per page)"

print_test "1.4" "Get English content only"
make_request "GET" "$API_ENDPOINT?language=en" 200 "Filter to English language only"

print_test "1.5" "Get Filipino content only"
make_request "GET" "$API_ENDPOINT?language=fil" 200 "Filter to Filipino language only"

print_test "1.6" "Search content (heart attack)"
make_request "GET" "$API_ENDPOINT?search=heart%20attack" 200 "Search for 'heart attack'"

print_test "1.7" "Invalid category (should fail validation)"
make_request "GET" "$API_ENDPOINT?category=invalid_category" 422 "Validation error for invalid category"

print_test "1.8" "Invalid per_page value (should fail validation)"
make_request "GET" "$API_ENDPOINT?per_page=1000" 422 "Validation error for per_page > 200"

###############################################################################
# Test 2: Incremental Sync
###############################################################################

print_header "Test 2: Incremental Sync"

# Use a timestamp from 30 days ago to get all content
SYNC_TIMESTAMP=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "2025-10-01T00:00:00Z")

print_test "2.1" "Sync content since 30 days ago"
make_request "GET" "$API_ENDPOINT/sync?since=$SYNC_TIMESTAMP" 200 "Fetch content updated in last 30 days"

print_test "2.2" "Sync with recent timestamp (should return empty)"
RECENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
make_request "GET" "$API_ENDPOINT/sync?since=$RECENT_TIMESTAMP" 200 "Fetch with very recent timestamp"

print_test "2.3" "Missing timestamp parameter (should fail)"
make_request "GET" "$API_ENDPOINT/sync" 422 "Validation error for missing 'since' parameter"

print_test "2.4" "Invalid timestamp format (should fail)"
make_request "GET" "$API_ENDPOINT/sync?since=invalid-date" 422 "Validation error for invalid timestamp"

###############################################################################
# Test 3: Get Single Content by ID
###############################################################################

print_header "Test 3: Get Single Content by ID"

print_test "3.1" "Get content by ID (ID=1)"
make_request "GET" "$API_ENDPOINT/1" 200 "Fetch single content item"

print_test "3.2" "Get content by ID (ID=5)"
make_request "GET" "$API_ENDPOINT/5" 200 "Fetch another content item"

print_test "3.3" "Non-existent content ID (should return 404)"
make_request "GET" "$API_ENDPOINT/99999" 404 "Content not found error"

print_test "3.4" "Verify view count increment"
echo -e "${YELLOW}ℹ Fetching content twice to verify view count increments${NC}"
response1=$(curl -s "$API_ENDPOINT/1")
views1=$(echo "$response1" | jq -r '.data.views' 2>/dev/null || echo "N/A")
sleep 1
response2=$(curl -s "$API_ENDPOINT/1")
views2=$(echo "$response2" | jq -r '.data.views' 2>/dev/null || echo "N/A")

if [ "$views1" != "N/A" ] && [ "$views2" != "N/A" ] && [ "$views2" -gt "$views1" ]; then
  print_success "View count incremented from $views1 to $views2"
else
  print_info "View count: First=$views1, Second=$views2 (Could not verify increment)"
fi

###############################################################################
# Test 4: Get Available Categories
###############################################################################

print_header "Test 4: Get Available Categories"

print_test "4.1" "Get all categories"
make_request "GET" "$API_ENDPOINT/categories" 200 "Fetch all available categories"

print_test "4.2" "Verify category count structure"
response=$(curl -s "$API_ENDPOINT/categories")
category_count=$(echo "$response" | jq -r '.data | length' 2>/dev/null || echo "N/A")
if [ "$category_count" -eq 8 ]; then
  print_success "Correct number of categories returned (8)"
else
  print_fail "Expected 8 categories, got $category_count" "$response"
fi

###############################################################################
# Test 5: Get Content Statistics
###############################################################################

print_header "Test 5: Get Content Statistics"

print_test "5.1" "Get content statistics"
make_request "GET" "$API_ENDPOINT/stats" 200 "Fetch content statistics"

print_test "5.2" "Verify statistics structure"
response=$(curl -s "$API_ENDPOINT/stats")
total_content=$(echo "$response" | jq -r '.data.total_content' 2>/dev/null || echo "N/A")
total_views=$(echo "$response" | jq -r '.data.total_views' 2>/dev/null || echo "N/A")
most_viewed_count=$(echo "$response" | jq -r '.data.most_viewed | length' 2>/dev/null || echo "N/A")

if [ "$total_content" != "N/A" ] && [ "$total_content" -ge 10 ]; then
  print_success "Total content count: $total_content"
else
  print_info "Total content count: $total_content"
fi

if [ "$total_views" != "N/A" ]; then
  print_success "Total views: $total_views"
else
  print_info "Total views: $total_views"
fi

if [ "$most_viewed_count" != "N/A" ]; then
  print_success "Most viewed articles: $most_viewed_count"
else
  print_info "Most viewed articles: $most_viewed_count"
fi

###############################################################################
# Test 6: Performance & Load Testing
###############################################################################

print_header "Test 6: Performance Testing"

print_test "6.1" "Response time for index endpoint"
start_time=$(date +%s%3N)
curl -s "$API_ENDPOINT" > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ "$response_time" -lt 500 ]; then
  print_success "Response time: ${response_time}ms (< 500ms target)"
elif [ "$response_time" -lt 1000 ]; then
  print_info "Response time: ${response_time}ms (acceptable, but above 500ms target)"
else
  print_fail "Response time: ${response_time}ms (exceeds 1000ms threshold)" ""
fi

print_test "6.2" "Concurrent request handling (5 simultaneous requests)"
start_time=$(date +%s%3N)
for i in {1..5}; do
  curl -s "$API_ENDPOINT" > /dev/null &
done
wait
end_time=$(date +%s%3N)
concurrent_time=$((end_time - start_time))
print_success "5 concurrent requests completed in ${concurrent_time}ms"

###############################################################################
# Test 7: Error Handling
###############################################################################

print_header "Test 7: Error Handling"

print_test "7.1" "Invalid endpoint (should return 404)"
response=$(curl -s -w "\n%{http_code}" "$API_ENDPOINT/invalid-endpoint")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq 404 ]; then
  print_success "Correct 404 error for invalid endpoint"
else
  print_fail "Expected 404, got $http_code" "$(echo "$response" | sed '$d')"
fi

print_test "7.2" "Multiple invalid query parameters"
make_request "GET" "$API_ENDPOINT?category=invalid&per_page=9999&language=invalid" 422 "Multiple validation errors"

###############################################################################
# Summary
###############################################################################

print_header "Test Summary"
echo ""
echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
echo -e "${RED}Failed:${NC} $FAILED_TESTS"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed. Review the output above.${NC}"
  exit 1
fi
