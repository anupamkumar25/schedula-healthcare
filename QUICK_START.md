# Schedula API Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and test the Schedula healthcare appointment scheduling API.

---

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Python** (for ML predictions)
- **Git** (for cloning the repository)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Schedula

# Install dependencies
npm install
```

---

## 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=schedula_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Application Port
PORT=7790
```

---

## 3. Database Setup

```bash
# Create PostgreSQL database
createdb schedula_db

# Run migrations
npm run migration:run
```

---

## 4. Start the Server

```bash
# Development mode with hot reload
npm run start:dev

# Or production mode
npm run start
```

Your API will be available at: `http://localhost:7790`

---

## 5. Test the API

### Option A: Use the Postman Collection

1. Import `Schedula_API.postman_collection.json` into Postman
2. Set the `base_url` variable to `http://localhost:7790`
3. Run the requests in order (Authentication → Appointments → etc.)

### Option B: Use cURL

#### Create a Patient Account
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

#### Create a Doctor Account
```bash
curl -X POST http://localhost:7790/auth/doctors/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@clinic.com",
    "password": "doctorPass123",
    "speciality": "Cardiology",
    "yearOfExp": 8,
    "bio": "Experienced cardiologist"
  }'
```

#### Login and Get JWT Token
```bash
curl -X POST http://localhost:7790/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "userType": "patient"
  }'
```

#### Create an Appointment (with JWT)
```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X POST http://localhost:7790/Appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOCTOR_UUID_HERE",
    "appointmentDate": "2024-12-25",
    "appointmentTime": "14:30",
    "type": "routine",
    "complaint": "Regular checkup"
  }'
```

---

## 6. API Endpoints Overview

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/patients/signup` | POST | Create patient account | ❌ |
| `/auth/doctors/signup` | POST | Create doctor account | ❌ |
| `/auth/login` | POST | User authentication | ❌ |
| `/Appointments` | POST | Create appointment | ✅ |
| `/Appointments/patient` | GET | Get patient appointments | ✅ |
| `/Appointments/doctor` | GET | Get doctor appointments | ✅ |
| `/availability` | POST | Create availability | ✅ |
| `/chat/send` | POST | Send message | ✅ |

---

## 7. Common Workflows

### Complete Patient Journey
1. **Signup** → `POST /auth/patients/signup`
2. **Login** → `POST /auth/login` → Get JWT token
3. **Create Appointment** → `POST /Appointments` (with JWT)
4. **View Appointments** → `GET /Appointments/patient` (with JWT)
5. **Chat with Doctor** → `POST /chat/send` (with JWT)

### Complete Doctor Journey
1. **Signup** → `POST /auth/doctors/signup`
2. **Login** → `POST /auth/login` → Get JWT token
3. **Set Availability** → `POST /availability` (with JWT)
4. **View Appointments** → `GET /Appointments/doctor` (with JWT)
5. **Respond to Chat** → `POST /chat/send` (with JWT)

---

## 8. Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Verify database exists
psql -l | grep schedula_db
```

#### Port Already in Use
```bash
# Find process using port 7790
lsof -i :7790

# Kill the process
kill -9 <PID>
```

#### JWT Token Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify token format: `Bearer <token>`

#### Validation Errors
- Check request body format
- Ensure required fields are present
- Verify data types (e.g., date format: YYYY-MM-DD)

---

## 9. Development Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

---

## 10. Next Steps

1. **Explore the API Documentation**
   - Read `API_DOCUMENTATION.md` for comprehensive details
   - Check `API_REFERENCE.md` for technical specifications

2. **Test All Endpoints**
   - Use the Postman collection
   - Try different scenarios and edge cases

3. **Integrate with Your Application**
   - Implement authentication flow
   - Handle JWT tokens
   - Implement error handling

4. **Customize for Your Needs**
   - Modify validation rules
   - Add new endpoints
   - Extend data models

---

## 🆘 Need Help?

- **API Documentation**: `API_DOCUMENTATION.md`
- **Technical Reference**: `API_REFERENCE.md`
- **Postman Collection**: `Schedula_API.postman_collection.json`
- **Issues**: Check the project repository

---

## 🎯 Quick Test Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Patient signup works
- [ ] Doctor signup works
- [ ] Login returns JWT token
- [ ] Protected endpoints require authentication
- [ ] Appointment creation works
- [ ] Availability management works
- [ ] Chat system works

**Happy coding! 🚀** 