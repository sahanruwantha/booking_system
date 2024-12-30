```markdown
# Bus Booking System - API Documentation

## 1. Authentication Endpoints (Port 3001)
**Base URL:** `http://localhost:3001/auth`

### 1.1 Register User
**POST** `/register`  
**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "userType": "COMMUTER" | "ADMIN" (optional, defaults to COMMUTER)
}
```
**Response:**
```json
{
    "userId": "string",
    "accessToken": "string",
    "refreshToken": "string",
    "userType": "string"
}
```

### 1.2 Login
**POST** `/login`  
**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```
**Response:**
```json
{
    "userId": "string",
    "accessToken": "string",
    "refreshToken": "string",
    "userType": "string"
}
```

### 1.3 Verify Token
**POST** `/verify`  
**Request Body:**
```json
{
    "token": "string"
}
```
**Response:**
```json
{
    "user": {
        "userId": "string",
        "userType": "string"
    }
}
```

### 1.4 Refresh Token
**POST** `/refresh`  
**Request Body:**
```json
{
    "refreshToken": "string"
}
```
**Response:**
```json
{
    "accessToken": "string"
}
```

---

## 2. Core Service Endpoints (Port 3000)
**Base URL:** `http://localhost:3000/api`

### 2.1 Bus Routes

#### 2.1.1 List All Routes
**GET** `/bus/routes`  
**Response:** Array of route names  
**Authentication:** Not required

#### 2.1.2 Get Route Stops
**GET** `/bus/routes/:routeName/stops`  
**Response:** Array of stop names  
**Authentication:** Not required

#### 2.1.3 Add New Route
**POST** `/bus/routes`  
**Request Body:**
```json
{
    "routeName": "string",
    "stops": ["string"]
}
```
**Authentication:** Required (ADMIN only)  
**Response:**
```json
{
    "message": "Route added successfully",
    "routeId": "string"
}
```

---

### 2.2 Trip Management

#### 2.2.1 Create Trip
**POST** `/bus/trip/create`  
**Request Body:**
```json
{
    "bus_route": "string",
    "driver_name": "string",
    "conductor_name": "string",
    "trip_date": "YYYY-MM-DD HH:mm:ss"
}
```
**Authentication:** Required (ADMIN only)

#### 2.2.2 Get Trips
**GET** `/bus/trips`  
**Authentication:** Required (ADMIN only)  
**Response:** Array of trip objects

#### 2.2.3 Get Trip by ID
**GET** `/bus/trips/:id`  
**Authentication:** Required (ADMIN only)  
**Response:** Trip object

#### 2.2.4 Update Trip
**PUT** `/bus/trips/:id`  
**Authentication:** Required (ADMIN only)  
**Request Body:**
```json
{
    "bus_route": "string",
    "driver_name": "string",
    "conductor_name": "string",
    "trip_date": "YYYY-MM-DD HH:mm:ss"
}
```

#### 2.2.5 Delete Trip
**DELETE** `/bus/trips/:id`  
**Authentication:** Required (ADMIN only)

---

### 2.3 Booking Management

#### 2.3.1 Book Seats
**POST** `/bus/trip/book`  
**Authentication:** Required  
**Request Body:**
```json
{
    "trip_id": "string",
    "seat_ids": ["string"]
}
```
**Response:**
```json
{
    "success": true,
    "booking_ids": ["string"],
    "message": "Seats booked successfully"
}
```

#### 2.3.2 Get Booked Seats
**GET** `/bus/trips/:tripId/seats`  
**Authentication:** Required  
**Response:** Array of booked seat IDs

#### 2.3.3 Search Trips
**POST** `/bus/route/get`  
**Authentication:** Required  
**Request Body:**
```json
{
    "start": "string",
    "end": "string",
    "date": "YYYY-MM-DD"
}
```
**Response:**
```json
{
    "route": "string",
    "stops": ["string"],
    "numberOfStops": number,
    "availableTrips": [
        {
            "trip_id": "string",
            "trip_date": "string"
        }
    ]
}
```

---

## 3. Error Responses
All endpoints may return the following error responses:

- **400 Bad Request**
```json
{
    "error": "Description of what went wrong"
}
```
- **401 Unauthorized**
```json
{
    "error": "Authentication token required"
}
```
- **403 Forbidden**
```json
{
    "error": "You do not have permission to perform this action"
}
```
- **404 Not Found**
```json
{
    "error": "Resource not found"
}
```
- **409 Conflict**
```json
{
    "error": "Resource already exists"
}
```
- **500 Internal Server Error**
```json
{
    "error": "Internal server error"
}
```

---

## 4. Authentication
- Most endpoints require authentication via Bearer token in the Authorization header.  
- **Format:** `Authorization: Bearer <access_token>`  
- Access tokens expire after a set time.  
- Use the refresh token endpoint to get a new access token.  
- Admin endpoints require `ADMIN` user type.

---

## 5. Rate Limiting
- API requests are limited to prevent abuse.  
- Specific limits vary by endpoint.  
- Headers indicate remaining requests and reset time.

**Note:** All dates should be in ISO 8601 format (`YYYY-MM-DD HH:mm:ss`).
```