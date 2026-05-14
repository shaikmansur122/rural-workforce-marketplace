# Rural Workforce Marketplace — Complete Project Documentation

## 1. Project Overview

**Rural Workforce Marketplace** is a full-stack web application that connects rural workers (farmers, carpenters, plumbers, electricians, etc.) with job providers (farm owners, construction companies, households). It works like an Uber/Upwork for rural India — providers post jobs, workers apply, providers book workers, and both sides manage everything through a modern dashboard.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8.0 |
| Authentication | JWT (JSON Web Tokens) |
| Map | Leaflet.js + OpenStreetMap (react-leaflet v4) |
| Build Tools | Maven (backend), npm / Create React App (frontend) |

---

## 3. System Architecture

```
Browser (React.js)
       |
       | HTTP/REST API calls (Axios)
       |
Spring Boot Backend (Port 8080)
       |
       |-- Spring Security (JWT Filter)
       |-- Controllers (REST endpoints)
       |-- Services (Business Logic)
       |-- Repositories (JPA/Hibernate)
       |
MySQL Database (Port 3306)
```

**Request Flow Example (Worker shows interest in a job):**
1. Worker clicks "Show Interest" in React UI
2. Axios sends `POST /interest` with JWT token in header
3. `JwtAuthFilter` validates the token, extracts user ID
4. `InterestController` receives the request
5. `InterestServiceImpl` checks for duplicates, saves to DB
6. `NotificationService` creates a notification for the provider
7. Response sent back to React, UI updates instantly

---

## 4. Database Schema & Relationships

### Tables

```
users
  id, name, phone, password, role (WORKER/PROVIDER),
  rating, skills, profile_image_url, experience_years, bio,
  total_jobs_completed, total_jobs_posted, availability,
  location, daily_wage, languages, business_name, verified,
  latitude, longitude, city, state

jobs
  id, provider_id (FK → users), skill, date, time_slot,
  location, wage, status (OPEN/PENDING/BOOKED/COMPLETED),
  latitude, longitude

bookings
  id, job_id (FK → jobs), worker_id (FK → users),
  status (PENDING/ACCEPTED/REJECTED/COMPLETED), time_slot

interests
  id, job_id (FK → jobs), worker_id (FK → users), created_at

reviews
  id, booking_id (FK → bookings), reviewer_id (FK → users),
  reviewee_id (FK → users), rating, comment, created_at

notifications
  id, user_id (FK → users), message, is_read, created_at
```

### Relationships

```
User (PROVIDER) ──< Job          (One provider has many jobs)
User (WORKER)   ──< Interest     (One worker can show interest in many jobs)
Job             ──< Interest     (One job can have many interested workers)
Job             ──< Booking      (One job has one active booking)
User (WORKER)   ──< Booking      (One worker can have many bookings)
Booking         ──< Review       (One booking can have one review)
User            ──< Notification (One user has many notifications)
```

---

## 5. Features — How Each One Works

---

### Feature 1: User Registration & Login

**How it works:**
- User fills the Register form (name, phone, password, role)
- React sends `POST /auth/register` to backend
- `AuthController` calls `AuthService.register()`
- Password is hashed using **BCrypt** before saving
- On login, `AuthService.login()` compares BCrypt hash
- If valid, a **JWT token** is generated with user ID and role
- Token is stored in `localStorage` on the frontend
- Every subsequent API call includes `Authorization: Bearer <token>`

**Key files:**
- `AuthController.java` — REST endpoints `/auth/register`, `/auth/login`
- `AuthService.java` — BCrypt hashing, JWT generation
- `JwtUtil.java` — Token creation and validation
- `JwtAuthFilter.java` — Intercepts every request, validates token
- `LoginPage.js`, `RegisterPage.js` — Frontend forms
- `AuthContext.js` — React context storing user state globally

---

### Feature 2: Role-Based Dashboards

**How it works:**
- After login, the JWT contains the user's role (WORKER or PROVIDER)
- `AuthContext.js` reads the role from the token
- `ProtectedRoute.js` checks the role before rendering a page
- Workers see: Browse Jobs, Nearby Jobs, My Bookings, My Profile
- Providers see: My Jobs, Browse Workers, Nearby Workers, Post Job, Profile

**Key files:**
- `ProtectedRoute.js` — Guards routes by role
- `WorkerDashboard.js` — Worker's full dashboard
- `ProviderDashboard.js` — Provider's full dashboard
- `App.js` — Route definitions

---

### Feature 3: Job Posting (Provider)

**How it works:**
- Provider fills the "Post Job" form: skill, date, time slot, location, wage
- Browser geolocation API captures latitude/longitude automatically
- React sends `POST /jobs` with all data including coordinates
- `JobController` calls `JobService.createJob()`
- Job is saved to DB with status `OPEN`
- Provider's `totalJobsPosted` counter increments
- Job appears in Browse Jobs for workers

**Key files:**
- `CreateJobForm.js` — Frontend form with geolocation
- `JobController.java` — `POST /jobs` endpoint
- `JobService.java` — Business logic, validation
- `Job.java` — Entity with all job fields
- `CreateJobRequest.java` — DTO for incoming data

---

### Feature 4: Browse Jobs (Worker)

**How it works:**
- Worker opens "Browse Jobs" tab
- React calls `GET /jobs?page=0&size=20`
- Backend returns paginated list of OPEN jobs
- Worker can search by skill or location (client-side filter)
- Each job card shows: skill emoji, provider name, location, date, time, wage
- Pagination buttons for next/previous pages

**Key files:**
- `WorkerDashboard.js` — `JobCard` component, pagination
- `JobController.java` — `GET /jobs` endpoint
- `JobService.getOpenJobs()` — Fetches paginated OPEN jobs

---

### Feature 5: Show Interest (Worker → Job)

**How it works:**
- Worker clicks "Show Interest" on a job card
- React sends `POST /interest` with `{ jobId }`
- `InterestController` calls `InterestServiceImpl`
- Service checks if worker already expressed interest (prevents duplicates — returns 409 if duplicate)
- Interest record saved to DB
- Notification created for the provider: "Worker X is interested in your job"
- Button changes to "Interested ✓" on the UI

**Key files:**
- `InterestController.java` — `POST /interest`
- `InterestServiceImpl.java` — Duplicate check, save, notify
- `Interest.java` — Entity (job_id, worker_id)
- `NotificationService.java` — Creates notification

---

### Feature 6: View Applicants & Book Worker (Provider)

**How it works:**
- Provider clicks "View Applicants" on a job card
- React calls `GET /jobs/{id}/interests`
- Modal shows all workers who expressed interest with their skills and rating
- Provider clicks "Book" next to a worker
- React sends `POST /booking` with `{ jobId, workerId }`
- `BookingService.createBooking()` runs:
  - Validates job is OPEN
  - Checks worker availability (no conflicting bookings on same date/time)
  - Creates booking with status PENDING
  - Updates job status to PENDING
  - Sends notification to worker: "You have a new booking request"

**Key files:**
- `BookingController.java` — `POST /booking`
- `BookingService.java` — Full booking logic
- `TimeSlotUtil.java` — Checks time slot overlaps
- `ProviderDashboard.js` — `WorkerModal` component

---

### Feature 7: Accept/Reject Booking (Worker)

**How it works:**
- Worker sees booking in "My Bookings" tab with status PENDING
- Worker clicks Accept or Reject
- React sends `PUT /booking/status` with `{ bookingId, status }`
- `BookingService.updateStatus()` runs:
  - If ACCEPTED: booking → ACCEPTED, job → BOOKED, notify provider
  - If REJECTED: booking → REJECTED, job → OPEN again, notify provider

**Key files:**
- `BookingController.java` — `PUT /booking/status`
- `BookingService.updateStatus()` — Status transition logic
- `WorkerDashboard.js` — `BookingCard` with Accept/Reject buttons

---

### Feature 8: Mark Job as Completed (Provider)

**How it works:**
- Provider sees job with status BOOKED
- Clicks "Mark as Completed"
- React sends `PATCH /booking/{id}/complete`
- `BookingService.completeBooking()` runs:
  - Booking → COMPLETED
  - Job → COMPLETED
  - Worker's `totalJobsCompleted` increments
  - Provider's `totalJobsCompleted` increments
  - Notification sent to worker

**Key files:**
- `BookingController.java` — `PATCH /booking/{id}/complete`
- `BookingService.completeBooking()` — Completion logic

---

### Feature 9: Reviews (Provider → Worker)

**How it works:**
- After job is COMPLETED, provider sees "Leave Review" button
- Provider selects 1–5 star rating and writes a comment
- React sends `POST /reviews` with `{ bookingId, rating, comment }`
- `ReviewService` saves review, updates worker's average rating
- Worker's rating is recalculated as average of all reviews

**Key files:**
- `ReviewController.java` — `POST /reviews`
- `ReviewService.java` — Save review, update rating
- `Review.java` — Entity

---

### Feature 10: Profile Management

**How it works:**
- Both workers and providers can edit their profiles
- Workers can update: name, skills, bio, experience years
- Profile photo upload: image is converted to **base64** using `FileReader` API
- Base64 string sent via `PUT /profile` with `{ profileImageUrl: base64 }`
- Backend saves base64 string in `profile_image_url` column (MEDIUMTEXT — up to 16MB)
- Profile image displays immediately from base64 data URL

**Key files:**
- `ProfileController.java` — `GET /profile`, `PUT /profile`, `PUT /profile/location`
- `ProfileImageUpload.js` — Camera button, FileReader, base64 conversion
- `UpdateProfileRequest.java` — DTO for profile updates

---

### Feature 11: Notifications

**How it works:**
- Every important action triggers a notification (booking, acceptance, completion)
- `NotificationService.dispatch()` saves notification to DB
- Bell icon in header shows unread count badge
- Clicking bell opens notification panel
- `GET /notifications` fetches all notifications for logged-in user
- `PUT /notifications/read` marks all as read

**Key files:**
- `NotificationController.java` — Fetch and mark-read endpoints
- `NotificationServiceImpl.java` — `dispatch()` method
- `NotificationBell.js` — Bell icon with badge
- `NotificationPanel.js` — Slide-in panel

---

### Feature 12: Location-Based Nearby Jobs/Workers (Map)

**How it works:**
- Browser Geolocation API detects user's current position
- Coordinates saved to backend via `PUT /profile/location`
- Worker clicks "Nearby Jobs" tab:
  - React calls `GET /jobs/nearby?lat=&lng=&radius=25`
  - Backend uses **Haversine Formula** to calculate distance between user and each job
  - Returns jobs sorted by distance (nearest first)
- Provider clicks "Nearby Workers" tab:
  - React calls `GET /workers/nearby?lat=&lng=&radius=25`
  - Same Haversine calculation for workers
- Interactive map rendered using **Leaflet + OpenStreetMap**
- Custom markers: 📍 (user), 💼 (jobs), 👷 (workers)
- Radius circle drawn around user location
- Clicking a marker shows popup with details
- Filter panel: change radius (5/10/25/50/100 km), skill, wage range

**Haversine Formula (in HaversineUtil.java):**
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
distance = 2 × R × atan2(√a, √(1−a))
where R = 6371 km (Earth's radius)
```

**Key files:**
- `HaversineUtil.java` — Distance calculation
- `NearbyMap.js` — Leaflet map component
- `NearbyJobsTab.js` — Worker's nearby jobs view
- `NearbyWorkersTab.js` — Provider's nearby workers view
- `JobController.java` — `GET /jobs/nearby`
- `WorkerController.java` — `GET /workers/nearby`

---

### Feature 13: Browse Workers (Provider)

**How it works:**
- Provider opens "Browse Workers" tab
- React calls `GET /workers?page=0&size=12`
- Can filter by skill and minimum rating
- Each worker card shows: photo, name, skills, rating, experience, jobs done, city/state
- "Book Worker" button opens modal to select which job to book them for
- "View Profile" button navigates to full worker profile page

**Key files:**
- `WorkerController.java` — `GET /workers` with filters
- `WorkerService.searchWorkers()` — Paginated search with JPQL query
- `ProviderDashboard.js` — `BrowseWorkers` function

---

### Feature 14: Worker & Provider Profile Pages

**How it works:**
- Dedicated public profile pages accessible via URL `/workers/:id` and `/providers/:id`
- Worker profile shows: photo, name, skills, rating, reviews, experience, availability, daily wage, languages, profile completion %
- Provider profile shows: name, business name, jobs posted, jobs completed, rating, active jobs
- Profile completion percentage calculated based on filled fields

**Key files:**
- `WorkerProfilePage.js` — Full worker profile UI
- `ProviderProfilePage.js` — Full provider profile UI
- `WorkerController.java` — `GET /workers/{id}`
- `ProviderController.java` — `GET /providers/{id}`

---

## 6. API Endpoints Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, get JWT |
| GET | /profile | Any | Get own profile |
| PUT | /profile | Any | Update profile |
| PUT | /profile/location | Any | Update location |
| GET | /jobs | Any | Browse open jobs |
| POST | /jobs | PROVIDER | Post a new job |
| GET | /jobs/my | PROVIDER | Get my posted jobs |
| GET | /jobs/nearby | Any | Get nearby jobs |
| GET | /jobs/{id}/interests | PROVIDER | Get job applicants |
| POST | /interest | WORKER | Show interest in job |
| POST | /booking | PROVIDER | Book a worker |
| PUT | /booking/status | WORKER | Accept/reject booking |
| PATCH | /booking/{id}/complete | PROVIDER | Complete a booking |
| GET | /booking/my | WORKER | Get my bookings |
| POST | /reviews | PROVIDER | Submit a review |
| GET | /workers | Any | Browse workers |
| GET | /workers/nearby | Any | Get nearby workers |
| GET | /workers/{id} | Any | Get worker profile |
| GET | /providers/{id} | Any | Get provider profile |
| GET | /notifications | Any | Get notifications |
| PUT | /notifications/read | Any | Mark all as read |

---

## 7. Frontend Component Structure

```
src/
├── pages/
│   ├── LandingPage.js          — Home page with hero, features, stats
│   ├── LoginPage.js            — Split-screen login
│   ├── RegisterPage.js         — Registration with role selection
│   ├── WorkerDashboard.js      — Worker's main dashboard
│   ├── ProviderDashboard.js    — Provider's main dashboard
│   ├── WorkerProfilePage.js    — Public worker profile
│   └── ProviderProfilePage.js  — Public provider profile
├── components/
│   ├── ProfileImageUpload.js   — Camera button + base64 upload
│   ├── NotificationBell.js     — Bell icon with badge
│   ├── NotificationPanel.js    — Slide-in notification list
│   ├── CreateJobForm.js        — Job posting form with geolocation
│   ├── NearbyMap.js            — Leaflet map with markers
│   ├── NearbyJobsTab.js        — Worker's nearby jobs + map
│   ├── NearbyWorkersTab.js     — Provider's nearby workers + map
│   └── ProtectedRoute.js       — Route guard by role
├── context/
│   └── AuthContext.js          — Global auth state (user, token, logout)
├── api/
│   └── axios.js                — Axios instance with base URL + JWT header
└── styles/
    ├── index.css               — Global styles, Tailwind base
    ├── design-system.css       — Custom CSS variables, card/button classes
    ├── dashboard.css           — Dashboard-specific styles
    ├── auth.css                — Login/register styles
    └── notifications.css       — Notification panel styles
```

---

## 8. Security

- **BCrypt** password hashing (cost factor 12) — passwords never stored in plain text
- **JWT tokens** expire after 24 hours
- **Spring Security** protects all endpoints except `/auth/**`
- `@PreAuthorize("hasRole('PROVIDER')")` and `@PreAuthorize("hasRole('WORKER')")` annotations restrict endpoints by role
- CORS configured to allow only `http://localhost:3000`
- All SQL queries use JPA/Hibernate (parameterized) — no SQL injection risk
