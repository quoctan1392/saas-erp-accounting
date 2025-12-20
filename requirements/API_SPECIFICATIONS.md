# API Specifications - Google OAuth Flow

## Base URLs
- Auth Service: `http://localhost:3001`
- Tenant Service: `http://localhost:3002`

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Service APIs

### 1. Google Login/Signup

**Endpoint:** `POST /auth/google`

**Description:** Authenticate user with Google OAuth and create/login user

**Request Body:**
```json
{
  "idToken": "string",
  "accessToken": "string (optional)"
}
```

**Response (200 - New User):**
```json
{
  "success": true,
  "isNewUser": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "https://lh3.googleusercontent.com/...",
      "googleId": "123456789",
      "createdAt": "2025-12-20T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Response (200 - Existing User):**
```json
{
  "success": true,
  "isNewUser": false,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "https://lh3.googleusercontent.com/...",
      "googleId": "123456789",
      "createdAt": "2025-12-20T10:00:00Z"
    },
    "tenants": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Công ty ABC",
        "role": "owner",
        "createdAt": "2025-12-20T10:00:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "name": "Công ty XYZ",
        "role": "member",
        "createdAt": "2025-12-20T11:00:00Z"
      }
    ],
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid Google ID token"
  }
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Google authentication failed"
  }
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred during authentication"
  }
}
```

---

### 2. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get current authenticated user information and tenants

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "https://lh3.googleusercontent.com/..."
    },
    "tenants": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Công ty ABC",
        "role": "owner"
      }
    ]
  }
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

---

## Tenant Service APIs

### 1. Create Tenant

**Endpoint:** `POST /tenants`

**Description:** Create a new tenant for the authenticated user

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Công ty ABC"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Công ty ABC",
      "ownerId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-12-20T10:00:00Z"
    },
    "membership": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "role": "owner",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "tenantId": "660e8400-e29b-41d4-a716-446655440001"
    }
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tenant name is required"
  }
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### 2. Get User Tenants

**Endpoint:** `GET /tenants/my-tenants`

**Description:** Get all tenants that the user is a member of

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Công ty ABC",
        "role": "owner",
        "ownerId": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-12-20T10:00:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "name": "Công ty XYZ",
        "role": "member",
        "ownerId": "550e8400-e29b-41d4-a716-446655440005",
        "createdAt": "2025-12-20T11:00:00Z"
      }
    ]
  }
}
```

---

### 3. Select Tenant (Login to Tenant)

**Endpoint:** `POST /tenants/:tenantId/select`

**Description:** Login to a specific tenant and get tenant-scoped token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tenantAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenant": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Công ty ABC",
      "role": "owner"
    },
    "expiresIn": 3600
  }
}
```

**Error Responses:**

403 Forbidden:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have access to this tenant"
  }
}
```

404 Not Found:
```json
{
  "success": false,
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "Tenant not found"
  }
}
```

---

### 4. Get Tenant Details

**Endpoint:** `GET /tenants/:tenantId`

**Description:** Get details of a specific tenant

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Công ty ABC",
      "ownerId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-12-20T10:00:00Z",
      "memberCount": 5
    }
  }
}
```

---

## JWT Token Structure

### Access Token Payload:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1703073600,
  "exp": 1703077200
}
```

### Tenant Access Token Payload:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "tenantId": "660e8400-e29b-41d4-a716-446655440001",
  "tenantRole": "owner",
  "iat": 1703073600,
  "exp": 1703077200
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | Google ID token is invalid or expired |
| `UNAUTHORIZED` | Authentication failed or token is invalid |
| `FORBIDDEN` | User doesn't have permission to access resource |
| `VALIDATION_ERROR` | Request validation failed |
| `TENANT_NOT_FOUND` | Requested tenant doesn't exist |
| `INTERNAL_ERROR` | Internal server error |
| `INVALID_REFRESH_TOKEN` | Refresh token is invalid or expired |

---

## Rate Limiting

- Google Login: 10 requests per minute per IP
- Other endpoints: 60 requests per minute per user

---

## CORS Configuration

Allowed origins:
- `http://localhost:3000` (development)
- Mobile app bundle IDs (production)

Allowed methods:
- GET, POST, PUT, DELETE, OPTIONS

Allowed headers:
- Authorization, Content-Type
