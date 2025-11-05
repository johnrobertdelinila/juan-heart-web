#!/bin/bash

# Mobile Facility API Testing Script
# Usage: ./test-facility-api.sh
# Prerequisites: Backend server must be running (php artisan serve)

BASE_URL="http://localhost:8000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Juan Heart Mobile Facility API Tests"
echo "=========================================="
echo ""

# Test 1: Get All Facilities
echo -e "${YELLOW}Test 1: Get All Facilities${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities" | jq -C '.success, .meta.total' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 2: Get Facilities Count
echo -e "${YELLOW}Test 2: Get Facility Count${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/count" | jq -C '.success, .data.total' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 3: Get Regions
echo -e "${YELLOW}Test 3: Get Regions${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/regions" | jq -C '.success, .data' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 4: Get Facility Types
echo -e "${YELLOW}Test 4: Get Facility Types${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/types" | jq -C '.success, .data' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 5: Get Single Facility
echo -e "${YELLOW}Test 5: Get Single Facility (ID: 1)${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/1" | jq -C '.success, .data.name' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 6: Nearby Search
echo -e "${YELLOW}Test 6: Nearby Search (Quezon City)${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/nearby?latitude=14.6417&longitude=121.0491&radius=50" | jq -C '.success, .meta.total' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 7: Sync (since yesterday)
YESTERDAY=$(date -u -v-1d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "yesterday" +"%Y-%m-%dT%H:%M:%SZ")
echo -e "${YELLOW}Test 7: Sync Since Yesterday${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities/sync?since=$YESTERDAY" | jq -C '.success, .meta' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 8: Filter by Region
echo -e "${YELLOW}Test 8: Filter by Region (NCR)${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities?region=National+Capital+Region" | jq -C '.success, .meta.total' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 9: Filter by Emergency Services
echo -e "${YELLOW}Test 9: Filter Emergency Services Only${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities?emergency_only=true" | jq -C '.success, .meta.total' || echo -e "${RED}FAILED${NC}"
echo ""

# Test 10: Filter by PhilHealth
echo -e "${YELLOW}Test 10: Filter PhilHealth Accredited Only${NC}"
curl -s -X GET "$BASE_URL/mobile/facilities?philhealth_only=true" | jq -C '.success, .meta.total' || echo -e "${RED}FAILED${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All Tests Completed${NC}"
echo "=========================================="
