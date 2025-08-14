## Schedula – Healthcare Appointment Scheduling System

Schedula is a modern healthcare scheduling backend that connects patients and doctors through a smart appointment system. It supports weekly recurring availability, date-specific overrides, intelligent queueing, and ML‑assisted duration prediction for optimal slot allocation.

### Highlights
- Recurring weekly availability (by day) with temporary date-specific changes
- Appointment requests for specific dates/times with intelligent queuing
- Night queue processor that auto-schedules pending requests
- Segment-tree based slot finder and booking
- Python ML integration to predict appointment duration
- JWT auth for patients and doctors, plus a simple chat system

---

## Architecture & Stack

- NestJS (TypeScript), TypeORM, PostgreSQL
- JWT authentication, bcrypt password hashing
- Cron jobs via @nestjs/schedule
- Python integration via python-shell for ML inference

Key modules:
- `auth`: signup/login for patients and doctors
- `availability`: manage recurring schedules by day of week
- `scheduling`: expand/shrink availability (by date or by day) and night processor
- `appointments`: create/list/cancel; queue handling when no immediate slot
- `chat`: simple messaging between users

---

## How Scheduling Works

- Doctors create availability by day of week, e.g. "tuesday 10:00-14:00". No date is required because this is a weekly recurring schedule.
- Patients request appointments for specific dates (e.g. 2025-08-20) and preferred times.
- The system maps the requested date to its weekday and checks the doctor’s matching weekly availability and any temporary overrides for that specific date.
- If a slot is available now, an appointment is created immediately. Otherwise a queue entry is created and processed later.

Night Queue Processor
- Runs every minute and processes only requests for “tomorrow’s” date.
- On each run, it builds the availability tree for the doctor and schedules as many queued requests as possible using predicted durations.
- As a result, a request for 2025‑08‑20 will be processed on 2025‑08‑19 (the night before).

Temporary Availability (Elastic)
- Expand or shrink availability:
  - By specific date: provide `{ "date": "YYYY-MM-DD", "newEndTime": "HH:MM" }`
  - By day of week: provide `{ "day": "monday", "newEndTime": "HH:MM" }`
- Expanding can instantly free extra capacity; shrinking moves conflicting future appointments to the queue.

---

## Project Setup

```bash
npm install
```

Create a `.env` file with your database and app configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=schedula
PORT=6566
JWT_SECRET=replace-with-strong-secret
```

Run database migrations:

```bash
npm run migration:run
```

Start the server:

```bash
# development (watch)
npm run start:dev

# production
npm run build
npm run start:prod
```

Default port: `6566`. The Postman collection uses `{{base_url}}` set to `http://localhost:6566`.

---

## API Overview

Auth
- `POST /auth/patients/signup`
- `POST /auth/doctors/signup`
- `POST /auth/login`

Availability (JWT required as doctor)
- `POST /availability` – create recurring availability by day of week
  - Body: `{ "day": "tuesday", "startTime": "10:00", "endTime": "14:00", "isActive": true }`
- `GET /availability` – get logged-in doctor’s availability
- `GET /availability/doctor/:doctorId` – get a doctor’s availability
- `PUT /availability/:availabilityId` – update
- `DELETE /availability/:availabilityId` – delete

Scheduling – Elastic Availability (JWT required as doctor)
- `POST /scheduling/expand` – expand by date or day
  - By date: `{ "date": "2025-08-20", "newEndTime": "19:00" }`
  - By day: `{ "day": "wednesday", "newEndTime": "19:00" }`
- `POST /scheduling/shrink` – shrink by date or day
  - By date: `{ "date": "2025-08-20", "newEndTime": "16:00" }`
  - By day: `{ "day": "wednesday", "newEndTime": "16:00" }`

Appointments
- `POST /Appointments` – request appointment for a specific date
  - If an immediate slot exists → returns `appointmentId`
  - Else → returns `queueId` with status `pending`
- `GET /Appointments/patient` – list patient’s appointments
- `GET /Appointments/doctor` – list doctor’s appointments
- `GET /Appointments/:appointmentId` – get single appointment
- `GET /Appointments/queue/:queueId` – check queued request status
- `PUT /Appointments/:appointmentId/cancel` – cancel appointment

Chat
- `POST /chat/send`
- `GET /chat/history/:otherUserId`
- `POST /chat/read`

---

## Queue Lifecycle & When You Receive appointmentId

- Immediate availability → response contains `appointmentId` right away.
- No immediate availability → response contains `queueId` and status `pending`.
- Night processor (every minute) auto-schedules “tomorrow’s” requests and updates the queue; once scheduled, you can retrieve the `appointmentId` via:
  - `GET /Appointments/queue/:queueId`, or
  - `GET /Appointments/patient`

---

## ML-Powered Duration Prediction

- Python models live under `/ml` and are used to estimate appointment duration based on:
  - Specialty, patient age, appointment type, time of day, day of week, prior visits
- Fallback duration is used if prediction fails, ensuring robust scheduling.

---

## Postman Collection

- File: `Schedula_API.postman_collection.json`
- Variables:
  - `base_url` → `http://localhost:6566`
  - `jwt_token`, `patient_id`, `doctor_id`, `appointment_id`, `availability_id`, `queue_id`
- The collection includes examples for:
  - Creating availability
  - Expanding/shrinking by date or by day
  - Creating appointments and polling queue status

Tips
- Always create availability before booking.
- For queued requests far in the future, expect scheduling to occur the night before the requested date.

---

## Scripts

```bash
npm run start         # start
npm run start:dev     # watch mode
npm run build         # compile TypeScript
npm run test          # unit tests
npm run test:e2e      # e2e tests
npm run test:cov      # coverage
npm run migration:run # run DB migrations
```

---

## License

MIT
