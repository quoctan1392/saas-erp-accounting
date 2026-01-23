#!/bin/bash

AUTH_URL="http://localhost:3001/api/v1"
TENANT_URL="http://localhost:3002/api/v1"
CORE_URL="http://localhost:3003"

echo "=== Creating Test User and Testing Full Flow ==="
echo ""

# Register new user
echo "1. Register new test user..."
REGISTER_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "Register response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extract tokens from registration
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
TEST_EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.email // .user.email // empty' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to register user"
  exit 1
fi

echo "✅ Registered user: ${TEST_EMAIL}"
echo "✅ Got access token: ${ACCESS_TOKEN:0:30}..."
echo ""

# Create tenant
echo "2. Create tenant..."
TENANT_CREATE_RESPONSE=$(curl -s -X POST "${TENANT_URL}/tenants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "name": "Test Company '$(date +%H%M%S)'",
    "slug": "test-company-'$(date +%s)'"
  }')

echo "Tenant create response:"
echo "$TENANT_CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$TENANT_CREATE_RESPONSE"
echo ""

TENANT_ID=$(echo "$TENANT_CREATE_RESPONSE" | jq -r '.data.tenant.id // .tenant.id // empty' 2>/dev/null)

if [ -z "$TENANT_ID" ]; then
  echo "❌ Failed to create tenant"
  exit 1
fi

echo "✅ Created tenant: ${TENANT_ID}"
echo ""

# Select tenant
echo "3. Select tenant..."
SELECT_RESPONSE=$(curl -s -X POST "${TENANT_URL}/tenants/${TENANT_ID}/select" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Select tenant response:"
echo "$SELECT_RESPONSE" | jq '.' 2>/dev/null || echo "$SELECT_RESPONSE"
echo ""

TENANT_TOKEN=$(echo "$SELECT_RESPONSE" | jq -r '.data.tenantAccessToken // .tenantAccessToken // empty' 2>/dev/null)

if [ -z "$TENANT_TOKEN" ]; then
  echo "❌ Failed to get tenant access token"
  exit 1
fi

echo "✅ Got tenant token: ${TENANT_TOKEN:0:30}..."
echo ""

# Test core API
echo "4. Test core API - Get items (should be empty for new tenant)..."
ITEMS_RESPONSE=$(curl -s -X GET "${CORE_URL}/api/items" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "x-tenant-id: ${TENANT_ID}")

echo "Items response:"
echo "$ITEMS_RESPONSE" | jq '.' 2>/dev/null || echo "$ITEMS_RESPONSE"
echo ""

# Create a test item
echo "5. Create test item..."
ITEM_CREATE=$(curl -s -X POST "${CORE_URL}/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TENANT_TOKEN}" \
  -H "x-tenant-id: ${TENANT_ID}" \
  -d '{
    "code": "TEST001",
    "name": "Test Product",
    "type": "GOODS",
    "unitId": "Cái",
    "salePrice": 100000,
    "isActive": true
  }')

echo "Item create response:"
echo "$ITEM_CREATE" | jq '.' 2>/dev/null || echo "$ITEM_CREATE"
echo ""

if echo "$ITEM_CREATE" | jq -e '.success == true or .data.id' > /dev/null 2>&1; then
  echo "✅ Successfully created item!"
else
  echo "⚠️  Item creation may have failed - check response above"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "📋 Summary:"
echo "- User: ${TEST_EMAIL}"
echo "- Tenant ID: ${TENANT_ID}"
echo "- Access Token: ${ACCESS_TOKEN:0:20}..."
echo "- Tenant Token: ${TENANT_TOKEN:0:20}..."
