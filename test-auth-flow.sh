#!/bin/bash

# Test authentication flow with new JWT_SECRET

AUTH_URL="http://localhost:3001/api/v1"
TENANT_URL="http://localhost:3002/api/v1"
CORE_URL="http://localhost:3003"

echo "=== Testing Authentication Flow ==="
echo ""

# Test login
echo "1. Login with maidvl@symper.vn..."
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maidvl@symper.vn",
    "password": "password123"
  }')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:30}..."
echo ""

# Get tenants
echo "2. Get user's tenants..."
TENANTS_RESPONSE=$(curl -s -X GET "${TENANT_URL}/tenants/my-tenants" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Tenants response:"
echo "$TENANTS_RESPONSE" | jq '.' 2>/dev/null || echo "$TENANTS_RESPONSE"
echo ""

# Extract tenant ID
TENANT_ID=$(echo "$TENANTS_RESPONSE" | jq -r '.data.tenants[0].id // .tenants[0].id // empty' 2>/dev/null)

if [ -z "$TENANT_ID" ]; then
  echo "❌ Failed to get tenant ID"
  exit 1
fi

echo "✅ Got tenant ID: ${TENANT_ID}"
echo ""

# Select tenant
echo "3. Select tenant..."
SELECT_RESPONSE=$(curl -s -X POST "${TENANT_URL}/tenants/${TENANT_ID}/select" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Select tenant response:"
echo "$SELECT_RESPONSE" | jq '.' 2>/dev/null || echo "$SELECT_RESPONSE"
echo ""

# Extract tenant access token
TENANT_TOKEN=$(echo "$SELECT_RESPONSE" | jq -r '.data.tenantAccessToken // .tenantAccessToken // empty' 2>/dev/null)

if [ -z "$TENANT_TOKEN" ]; then
  echo "❌ Failed to get tenant access token"
  exit 1
fi

echo "✅ Got tenant token: ${TENANT_TOKEN:0:30}..."
echo ""

# Test core API with tenant token
echo "4. Test core API - Get items..."
ITEMS_RESPONSE=$(curl -s -X GET "${CORE_URL}/api/items" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "x-tenant-id: ${TENANT_ID}")

echo "Items response:"
echo "$ITEMS_RESPONSE" | jq '.' 2>/dev/null || echo "$ITEMS_RESPONSE"
echo ""

# Check if we got items
ITEMS_COUNT=$(echo "$ITEMS_RESPONSE" | jq -r '.data.items | length // .items | length // 0' 2>/dev/null)

if [ "$ITEMS_COUNT" -gt 0 ]; then
  echo "✅ Success! Got ${ITEMS_COUNT} items"
else
  echo "⚠️  No items returned or error occurred"
fi

echo ""
echo "=== Test Complete ==="
