# Schedula API Reference

## Technical Specifications

**Framework:** NestJS (Node.js)  
**Database:** PostgreSQL with TypeORM  
**Authentication:** JWT (JSON Web Tokens)  
**Validation:** class-validator with DTOs  
**Port:** 7790 (configurable)

---

## Authentication & Authorization

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Claims
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "userType": "patient" | "doctor",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Detailed Endpoint Reference

### 1. Authentication Endpoints

#### POST /auth/patients/signup
Creates a new patient account.

**Request:**
```http
POST /auth/patients/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobNum": "+1234567890",
  "password": "securePassword123",
  "dob": "1990-05-15"
}
```

**Response (201):**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobNum": "+1234567890",
  "dob": "1990-05-15",
  "createdAt": "2024-12-20T10:30:00.000Z"
}
```

**Validation Errors (400):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters",
    "dob must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression"
  ],
  "error": "Bad Request"
}
```

#### POST /auth/doctors/signup
Creates a new doctor account.

**Request:**
```http
POST /auth/doctors/signup
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@clinic.com",
  "password": "doctorPass123",
  "speciality": "Cardiology",
  "yearOfExp": 8,
  "bio": "Experienced cardiologist with expertise in interventional procedures."
}
```

**Response (201):**
```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@clinic.com",
  "speciality": "Cardiology",
  "yearOfExp": 8,
  "bio": "Experienced cardiologist with expertise in interventional procedures.",
  "createdAt": "2024-12-20T10:30:00.000Z"
}
```

#### POST /auth/login
Authenticates user and returns JWT token.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "userType": "patient"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "userType": "patient"
  }
}
```

**Authentication Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### 2. Appointment Endpoints

#### POST /Appointments
Creates a new appointment (requires authentication).

**Request:**
```http
POST /Appointments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "14:30",
  "type": "routine",
  "complaint": "Regular checkup and blood pressure monitoring"
}
```

**Response (201):**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "14:30",
  "duration": 30,
  "tokenNumber": "A001",
  "status": "upcoming",
  "type": "routine",
  "complaint": "Regular checkup and blood pressure monitoring",
  "createdAt": "2024-12-20T10:30:00.000Z"
}
```

#### GET /Appointments/patient
Retrieves appointments for the authenticated patient.

**Request:**
```http
GET /Appointments/patient
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
[
  {
    "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
    "doctorId": "550e8400-e29b-41d4-a716-446655440001",
    "appointmentDate": "2024-12-25",
    "appointmentTime": "14:30",
    "duration": 30,
    "tokenNumber": "A001",
    "status": "upcoming",
    "type": "routine",
    "complaint": "Regular checkup and blood pressure monitoring",
    "doctor": {
      "name": "Dr. Sarah Johnson",
      "speciality": "Cardiology"
    }
  }
]
```

#### GET /Appointments/doctor
Retrieves appointments for the authenticated doctor.

**Request:**
```http
GET /Appointments/doctor
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
[
  {
    "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "appointmentDate": "2024-12-25",
    "appointmentTime": "14:30",
    "duration": 30,
    "tokenNumber": "A001",
    "status": "upcoming",
    "type": "routine",
    "complaint": "Regular checkup and blood pressure monitoring",
    "patient": {
      "name": "John Doe",
      "mobNum": "+1234567890"
    }
  }
]
```

#### GET /Appointments/:appointmentId
Retrieves a specific appointment by ID.

**Request:**
```http
GET /Appointments/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "14:30",
  "actualStartTime": null,
  "actualEndTime": null,
  "duration": 30,
  "tokenNumber": "A001",
  "status": "upcoming",
  "type": "routine",
  "complaint": "Regular checkup and blood pressure monitoring",
  "createdAt": "2024-12-20T10:30:00.000Z",
  "updatedAt": "2024-12-20T10:30:00.000Z",
  "doctor": {
    "name": "Dr. Sarah Johnson",
    "speciality": "Cardiology"
  },
  "patient": {
    "name": "John Doe",
    "mobNum": "+1234567890"
  }
}
```

#### PUT /Appointments/:appointmentId/cancel
Cancels an appointment.

**Request:**
```http
PUT /Appointments/550e8400-e29b-41d4-a716-446655440002/cancel
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "cancelled",
  "updatedAt": "2024-12-20T11:00:00.000Z"
}
```

---

### 3. Availability Management Endpoints

#### POST /availability
Creates availability schedule for a doctor.

**Request:**
```http
POST /availability
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "day": "monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "isActive": true
}
```

**Response (201):**
```json
{
  "availabilityId": "550e8400-e29b-41d4-a716-446655440003",
  "doctorId": "550e8400-e29b-41d4-a716-446655440001",
  "day": "monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "isActive": true,
  "createdAt": "2024-12-20T10:30:00.000Z"
}
```

#### GET /availability
Retrieves availabilities for the authenticated doctor.

**Request:**
```http
GET /availability
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
[
  {
    "availabilityId": "550e8400-e29b-41d4-a716-446655440003",
    "day": "monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isActive": true,
    "createdAt": "2024-12-20T10:30:00.000Z"
  },
  {
    "availabilityId": "550e8400-e29b-41d4-a716-446655440004",
    "day": "tuesday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isActive": true,
    "createdAt": "2024-12-20T10:30:00.000Z"
  }
]
```

#### PUT /availability/:availabilityId
Updates an availability schedule.

**Request:**
```http
PUT /availability/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "endTime": "18:00"
}
```

**Response (200):**
```json
{
  "availabilityId": "550e8400-e29b-41d4-a716-446655440003",
  "day": "monday",
  "startTime": "09:00",
  "endTime": "18:00",
  "isActive": true,
  "updatedAt": "2024-12-20T11:00:00.000Z"
}
```

---

### 4. Scheduling Endpoints

#### POST /scheduling/expand
Expands availability for a specific date.

**Request:**
```http
POST /scheduling/expand
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "date": "2024-12-23",
  "newEndTime": "19:00"
}
```

**Response (200):**
```json
{
  "message": "Availability expanded successfully",
  "date": "2024-12-23",
  "newEndTime": "19:00"
}
```

#### POST /scheduling/shrink
Reduces availability for a specific date.

**Request:**
```http
POST /scheduling/shrink
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "date": "2024-12-23",
  "newEndTime": "16:00"
}
```

**Response (200):**
```json
{
  "message": "Availability shrunk successfully",
  "date": "2024-12-23",
  "newEndTime": "16:00"
}
```

---

### 5. Chat System Endpoints

#### POST /chat/send
Sends a message to another user.

**Request:**
```http
POST /chat/send
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hello doctor, I have a question about my appointment."
}
```

**Response (201):**
```json
{
  "messageId": "550e8400-e29b-41d4-a716-446655440005",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hello doctor, I have a question about my appointment.",
  "isRead": false,
  "createdAt": "2024-12-20T10:30:00.000Z"
}
```

#### GET /chat/history/:otherUserId
Retrieves conversation history with another user.

**Request:**
```http
GET /chat/history/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
[
  {
    "messageId": "550e8400-e29b-41d4-a716-446655440005",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "recipientId": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Hello doctor, I have a question about my appointment.",
    "isRead": false,
    "createdAt": "2024-12-20T10:30:00.000Z"
  },
  {
    "messageId": "550e8400-e29b-41d4-a716-446655440006",
    "senderId": "550e8400-e29b-41d4-a716-446655440001",
    "recipientId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello! I'd be happy to help. What's your question?",
    "isRead": false,
    "createdAt": "2024-12-20T10:35:00.000Z"
  }
]
```

#### POST /chat/read
Marks messages as read.

**Request:**
```http
POST /chat/read
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "messageIds": [
    "550e8400-e29b-41d4-a716-446655440005",
    "550e8400-e29b-41d4-a716-446655440006"
  ]
}
```

**Response (200):**
```json
{
  "message": "Messages marked as read successfully",
  "updatedCount": 2
}
```

---

## Data Validation Rules

### Patient Signup Validation
- `name`: Required string, non-empty
- `email`: Required valid email format
- `mobNum`: Required string, non-empty
- `password`: Required string, minimum 8 characters
- `dob`: Required string, YYYY-MM-DD format

### Doctor Signup Validation
- `name`: Required string, non-empty
- `email`: Required valid email format
- `password`: Required string, minimum 8 characters
- `speciality`: Required string, non-empty
- `yearOfExp`: Required integer, minimum 0
- `bio`: Required string, non-empty

### Appointment Validation
- `doctorId`: Required UUID
- `appointmentDate`: Required string, YYYY-MM-DD format
- `appointmentTime`: Required string, HH:MM format (24-hour)
- `type`: Optional enum (routine, follow-up, new-patient, emergency)
- `complaint`: Optional string

### Availability Validation
- `day`: Required enum (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
- `startTime`: Required string, HH:MM format (24-hour)
- `endTime`: Required string, HH:MM format (24-hour)
- `isActive`: Optional boolean, default true

### Message Validation
- `recipientId`: Required UUID
- `content`: Required string, minimum 1 character

---

## Error Response Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting & Security

### Security Headers
- JWT token required for protected endpoints
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- SQL injection protection via TypeORM

### Rate Limiting
Currently no rate limiting implemented. Consider implementing for production use.

---

## Testing the API

### Using cURL Examples

#### Patient Signup
```bash
curl -X POST http://localhost:7790/auth/patients/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobNum": "+1234567890",
    "password": "securePassword123",
    "dob": "1990-05-15"
  }'
```

#### Login
```bash
curl -X POST http://localhost:7790/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "userType": "patient"
  }'
```

#### Create Appointment (with JWT)
```bash
curl -X POST http://localhost:7790/Appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "550e8400-e29b-41d4-a716-446655440001",
    "appointmentDate": "2024-12-25",
    "appointmentTime": "14:30",
    "type": "routine",
    "complaint": "Regular checkup"
  }'
```

---

## Database Schema

### Key Tables
- `patients` - Patient information
- `doctors` - Doctor information
- `availabilities` - Doctor availability schedules
- `appointments` - Appointment records
- `appointment_queue` - Queue management
- `messages` - Chat messages
- `temporary_availabilities` - Dynamic availability changes

### Relationships
- One-to-Many: Doctor → Appointments
- One-to-Many: Patient → Appointments
- One-to-Many: Doctor → Availabilities
- One-to-Many: Doctor → Messages (as sender/recipient)
- One-to-Many: Patient → Messages (as sender/recipient)

---

## Performance Considerations

### Database Indexes
- Primary keys on all entities
- Foreign key indexes on relationships
- Composite indexes for common queries

### Caching Strategy
Currently no caching implemented. Consider Redis for:
- User sessions
- Frequently accessed data
- Query result caching

---

## Monitoring & Logging

### Logging
- Request/response logging enabled
- Error logging with stack traces
- Database query logging in development

### Health Checks
- Database connection monitoring
- Service health endpoints (to be implemented)

---

## Future Enhancements

### Planned Features
- Real-time notifications (WebSocket)
- File upload for medical documents
- Advanced scheduling algorithms
- Integration with external medical systems
- Mobile app API endpoints

### API Versioning
Consider implementing API versioning for future updates:
```
/api/v1/auth/login
/api/v2/auth/login
``` 