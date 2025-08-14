# Schedula API Documentation

## Overview
Schedula is a healthcare appointment scheduling system that provides APIs for managing patient and doctor accounts, appointments, availability schedules, and chat functionality. The system is built with NestJS and uses PostgreSQL as the database.

**Base URL:** `http://localhost:7790` (or as configured in environment)

## Table of Contents
1. [Authentication](#authentication)
2. [Appointments](#appointments)
3. [Availability Management](#availability-management)
4. [Scheduling](#scheduling)
5. [Chat System](#chat-system)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Environment Variables](#environment-variables)

---

## Authentication

### Endpoints

#### Patient Signup
```http
POST /auth/patients/signup
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string (valid email)",
  "mobNum": "string",
  "password": "string (min 8 characters)",
  "dob": "string (YYYY-MM-DD format)"
}
```

**Response:** User account details with patient information

#### Doctor Signup
```http
POST /auth/doctors/signup
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string (valid email)",
  "password": "string (min 8 characters)",
  "speciality": "string",
  "yearOfExp": "number (min 0)",
  "bio": "string"
}
```

**Response:** User account details with doctor information

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string",
  "userType": "patient" | "doctor"
}
```

**Response:** JWT token for authentication

**Note:** Include the JWT token in the `Authorization` header for protected endpoints:
```
Authorization: Bearer <your-jwt-token>
```

---

## Appointments

### Endpoints

All appointment endpoints require JWT authentication.

#### Create Appointment
```http
POST /Appointments
```

**Request Body:**
```json
{
  "doctorId": "uuid",
  "appointmentDate": "string (YYYY-MM-DD format)",
  "appointmentTime": "string (HH:MM format)",
  "type": "routine" | "follow-up" | "new-patient" | "emergency" (optional),
  "complaint": "string (optional)"
}
```

**Response:** Created appointment details

#### Get Patient Appointments
```http
GET /Appointments/patient
```

**Response:** List of appointments for the authenticated patient

#### Get Doctor Appointments
```http
GET /Appointments/doctor
```

**Response:** List of appointments for the authenticated doctor

#### Get Appointment by ID
```http
GET /Appointments/:appointmentId
```

**Parameters:**
- `appointmentId`: UUID of the appointment

**Response:** Appointment details

#### Cancel Appointment
```http
PUT /Appointments/:appointmentId/cancel
```

**Parameters:**
- `appointmentId`: UUID of the appointment

**Response:** Updated appointment status

---

## Availability Management

### Endpoints

All availability endpoints require JWT authentication (doctor only).

#### Create Availability
```http
POST /availability
```

**Request Body:**
```json
{
  "day": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  "startTime": "string (HH:MM format)",
  "endTime": "string (HH:MM format)",
  "isActive": "boolean (optional, default: true)"
}
```

**Response:** Created availability details

#### Get Doctor Availabilities
```http
GET /availability
```

**Response:** List of availabilities for the authenticated doctor

#### Get Specific Doctor Availabilities
```http
GET /availability/doctor/:doctorId
```

**Parameters:**
- `doctorId`: UUID of the doctor

**Response:** List of availabilities for the specified doctor

#### Update Availability
```http
PUT /availability/:availabilityId
```

**Parameters:**
- `availabilityId`: UUID of the availability

**Request Body:** Partial availability data (same structure as create)

**Response:** Updated availability details

#### Delete Availability
```http
DELETE /availability/:availabilityId
```

**Parameters:**
- `availabilityId`: UUID of the availability

**Response:** Deletion confirmation

---

## Scheduling

### Endpoints

All scheduling endpoints require JWT authentication (doctor only).

#### Expand Availability
```http
POST /scheduling/expand
```

**Request Body:**
```json
{
  "date": "string (YYYY-MM-DD format)",
  "newEndTime": "string (HH:MM format)"
}
```

**Response:** Updated availability details

#### Shrink Availability
```http
POST /scheduling/shrink
```

**Request Body:**
```json
{
  "date": "string (YYYY-MM-DD format)",
  "newEndTime": "string (HH:MM format)"
}
```

**Response:** Updated availability details

---

## Chat System

### Endpoints

All chat endpoints require JWT authentication.

#### Send Message
```http
POST /chat/send
```

**Request Body:**
```json
{
  "recipientId": "uuid",
  "content": "string (min 1 character)"
}
```

**Response:** Sent message details

#### Get Conversation History
```http
GET /chat/history/:otherUserId
```

**Parameters:**
- `otherUserId`: UUID of the other user in the conversation

**Response:** List of messages between the authenticated user and the specified user

#### Mark Messages as Read
```http
POST /chat/read
```

**Request Body:**
```json
{
  "messageIds": ["uuid", "uuid", ...]
}
```

**Response:** Updated message read status

---

## Data Models

### Appointment Entity
```typescript
export enum AppointmentStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  ROUTINE = 'routine',
  FOLLOWUP = 'follow-up',
  NEWPATIENT = 'new-patient',
  EMERGENCY = 'emergency',
}

interface Appointment {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration: number;
  tokenNumber: string;
  status: AppointmentStatus;
  type: AppointmentType;
  complaint?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Availability Entity
```typescript
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

interface Availability {
  availabilityId: string;
  doctorId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Entity
```typescript
interface Message {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
```

---

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": ["error message 1", "error message 2"],
  "error": "Bad Request"
}
```

---

## Environment Variables

Required environment variables for the application:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Application Port
PORT=7790
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Python (for ML predictions)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations: `npm run migration:run`
5. Start the application: `npm run start:dev`

### Available Scripts
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

---

## Additional Features

### ML Predictions
The system includes machine learning capabilities for:
- Appointment duration prediction
- Appointment type classification
- Time slot optimization

### Queue Management
- Automated appointment queue processing
- Night queue processor for after-hours scheduling
- Elastic availability management

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with class-validator
- Role-based access control

---

## Support

For technical support or questions about the API, please refer to the project documentation or contact the development team.

**Version:** 1.0.0  
**Last Updated:** December 2024 