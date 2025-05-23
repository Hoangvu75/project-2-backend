# Customer CRUD API Documentation

## Overview
Complete CRUD API for managing customers in your omnichannel project. All endpoints require JWT authentication.

## Base URL
```
http://localhost:3000/customers
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Customer Entity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | ✅ | Customer's first name |
| lastName | string | ✅ | Customer's last name |
| email | string | ✅ | Unique email address |
| phone | string | ❌ | Phone number |
| dateOfBirth | string | ❌ | ISO date string (YYYY-MM-DD) |
| status | enum | ❌ | active, inactive, suspended, prospect (default: prospect) |
| preferredChannel | enum | ❌ | email, phone, sms, whatsapp, social_media, in_store, website (default: email) |
| address | string | ❌ | Street address |
| city | string | ❌ | City |
| state | string | ❌ | State/Province |
| zipCode | string | ❌ | ZIP/Postal code |
| country | string | ❌ | Country |
| company | string | ❌ | Company name |
| jobTitle | string | ❌ | Job title |
| socialMediaHandle | string | ❌ | Social media username |
| whatsappNumber | string | ❌ | WhatsApp number |
| notes | string | ❌ | Customer notes |
| marketingOptIn | boolean | ❌ | Marketing consent (default: true) |
| customerSince | string | ❌ | ISO date string |

## API Endpoints

### 1. Create Customer
```http
POST /customers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "status": "prospect",
  "preferredChannel": "email",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "company": "Tech Corp",
  "jobTitle": "Software Engineer",
  "marketingOptIn": true
}
```

### 2. Get All Customers (with filters and pagination)
```http
GET /customers?page=1&limit=10
GET /customers?status=active
GET /customers?preferredChannel=email
GET /customers?city=New York
GET /customers?search=john
GET /customers?marketingOptIn=true
```

**Response:**
```json
{
  "customers": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### 3. Get Customer by ID
```http
GET /customers/1
```

### 4. Get Customer by Email
```http
GET /customers/email/john.doe@example.com
```

### 5. Update Customer
```http
PATCH /customers/1
Content-Type: application/json

{
  "status": "active",
  "phone": "+1987654321",
  "notes": "Updated contact information"
}
```

### 6. Delete Customer
```http
DELETE /customers/1
```

### 7. Update Last Contact Date
```http
PATCH /customers/1/contact
```

## Specialized Endpoints

### Get Customer Statistics
```http
GET /customers/stats
```

**Response:**
```json
{
  "total": 250,
  "byStatus": {
    "active": 180,
    "prospect": 50,
    "inactive": 15,
    "suspended": 5
  },
  "byChannel": {
    "email": 120,
    "phone": 80,
    "whatsapp": 30,
    "social_media": 20
  },
  "marketingOptIn": 200
}
```

### Get Active Customers
```http
GET /customers/active
```

### Get Marketing Opt-in Customers
```http
GET /customers/marketing-opt-in
```

### Get Customers by Channel
```http
GET /customers/by-channel/email
GET /customers/by-channel/whatsapp
```

## Filter Options

| Parameter | Description | Example |
|-----------|-------------|---------|
| status | Filter by customer status | `?status=active` |
| preferredChannel | Filter by preferred channel | `?preferredChannel=email` |
| city | Filter by city | `?city=New York` |
| country | Filter by country | `?country=USA` |
| marketingOptIn | Filter by marketing consent | `?marketingOptIn=true` |
| search | Search in name, email, phone | `?search=john` |
| page | Page number (default: 1) | `?page=2` |
| limit | Items per page (default: 10) | `?limit=20` |

## Example Usage with curl

### 1. First, get a JWT token:
```bash
# Register or login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### 2. Create a customer:
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1555123456",
    "status": "prospect",
    "preferredChannel": "whatsapp",
    "city": "Los Angeles",
    "country": "USA",
    "marketingOptIn": true
  }'
```

### 3. Get customers with filters:
```bash
curl -X GET "http://localhost:3000/customers?status=active&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update a customer:
```bash
curl -X PATCH http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "active", "notes": "Customer contacted via WhatsApp"}'
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Customer with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Customer with this email already exists",
  "error": "Conflict"
}
```

## Database
- **Storage**: SQLite database (`database.sqlite`)
- **Table**: `customers`
- **Auto-sync**: Enabled (development only)

Your Customer CRUD API is now fully functional and ready for your omnichannel project! 🎉 