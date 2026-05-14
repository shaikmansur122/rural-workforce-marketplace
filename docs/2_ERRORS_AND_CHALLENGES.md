# Rural Workforce Marketplace — Errors & Challenges Faced

## Overview

This document covers every major error, bug, and challenge encountered during the development of the Rural Workforce Marketplace project, from the very beginning to the final state. Each entry includes what the problem was, why it happened, and how it was fixed.

---

## Phase 1: Project Setup & Initial Build

---

### Challenge 1: BCrypt Password Corruption via PowerShell

**Problem:**
Demo account passwords kept failing login with "Invalid Credentials" even after being set correctly. The BCrypt hash `$2a$12$c0r9C/g/Nlz6IUcjXaN18.zOOwGA98q3x79ikzERuTuGnh1NcyZp2` was getting corrupted when written via PowerShell commands.

**Root Cause:**
PowerShell interprets `$` signs inside double-quoted strings as variable references. So `"$2a$12$..."` was being parsed as variables `$2a`, `$12`, etc., which were empty — resulting in a broken hash like `a12...` being saved to the database.

**Fix:**
Never inline BCrypt hashes in PowerShell commands. Always write the SQL to a `.sql` file first, then pipe it to MySQL:
```powershell
# WRONG — dollar signs get stripped
mysql -u root -p "UPDATE users SET password='$2a$12$...' WHERE id=1"

# CORRECT — write to file first
Get-Content "reset_passwords.sql" | mysql -u root -pamina123456 rural_workforce
```
Created `reset_all_passwords.sql` and `fix_passwords.sql` files for this purpose.

---

### Challenge 2: MySQL `ADD COLUMN IF NOT EXISTS` Not Supported

**Problem:**
When adding location columns (`latitude`, `longitude`, `city`, `state`) to the database, the SQL used `ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE` — which threw a syntax error.

**Root Cause:**
MySQL 8.0 does not support `IF NOT EXISTS` in `ALTER TABLE ADD COLUMN` statements (unlike PostgreSQL).

**Fix:**
Removed `IF NOT EXISTS` from all ALTER TABLE statements. Instead, ran the migration once carefully and documented it.

---

### Challenge 3: Spring Boot Port 8080 Already in Use

**Problem:**
When trying to restart the backend, it failed with:
```
Web server failed to start. Port 8080 was already in use.
```

**Root Cause:**
A previous Java process was still running in the background (from a previous `mvn spring-boot:run` or `java -jar` command that wasn't properly stopped).

**Fix:**
```powershell
# Find and kill the process using port 8080
Get-NetTCPConnection -LocalPort 8080 | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}
```
Or kill all Java processes:
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*java*" } | Stop-Process -Force
```

---

## Phase 2: Authentication & Security

---

### Challenge 4: JWT Token Not Being Sent with API Requests

**Problem:**
After login, API calls to protected endpoints returned 401 Unauthorized even though the user was logged in.

**Root Cause:**
The Axios instance was not configured to automatically attach the JWT token to request headers.

**Fix:**
Created a centralized `axios.js` with a request interceptor:
```javascript
// frontend/src/api/axios.js
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

### Challenge 5: CORS Errors — Frontend Blocked by Backend

**Problem:**
React frontend (port 3000) was blocked from calling the Spring Boot backend (port 8080) with error:
```
Access to XMLHttpRequest at 'http://localhost:8080/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Root Cause:**
Spring Boot by default blocks cross-origin requests. The frontend and backend run on different ports, which counts as different origins.

**Fix:**
Added CORS configuration in `SecurityConfig.java`:
```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("http://localhost:3000");
    config.addAllowedMethod("*");
    config.addAllowedHeader("*");
    config.setAllowCredentials(true);
    // ...
}
```

---

### Challenge 6: `Authentication.getPrincipal()` Returning Wrong Type

**Problem:**
Backend threw `ClassCastException: String cannot be cast to Long` when trying to get the user ID from the JWT token.

**Root Cause:**
The JWT subject was stored as a String (user ID as text), but the code was casting it directly to `Long`.

**Fix:**
Updated `JwtAuthFilter` to parse the subject as Long:
```java
Long userId = Long.parseLong(claims.getSubject());
UsernamePasswordAuthenticationToken auth =
    new UsernamePasswordAuthenticationToken(userId, null, authorities);
```

---

## Phase 3: Profile & Image Upload

---

### Challenge 7: Profile Image Upload — 400 Bad Request

**Problem:**
The first approach to profile image upload used multipart file upload (`POST /upload/profile-image`). This kept returning 400 errors when tested.

**Root Cause:**
The multipart configuration was not properly set up, and the frontend was not sending the correct `Content-Type: multipart/form-data` header with the correct boundary.

**Fix:**
Switched to a completely different approach — **base64 encoding**:
1. User selects image file
2. `FileReader.readAsDataURL()` converts it to base64 string
3. Base64 string sent as JSON via `PUT /profile` with `{ profileImageUrl: base64 }`
4. Backend saves the base64 string directly to the database

This approach is simpler, requires no file system management, and works reliably.

---

### Challenge 8: Profile Image — 500 Error "Data too long for column"

**Problem:**
After switching to base64, uploading a real photo caused a 500 Internal Server Error:
```
SQL Error: 1406, SQLState: 22001
Data truncation: Data too long for column 'profile_image_url' at row 1
```

**Root Cause:**
The `profile_image_url` column was defined as `VARCHAR(255)` — only 255 characters. A base64-encoded image can be 50,000–500,000+ characters.

**Fix:**
Changed the column type to `MEDIUMTEXT` (supports up to 16MB):
```sql
ALTER TABLE users MODIFY COLUMN profile_image_url MEDIUMTEXT;
```
Also updated the JPA entity:
```java
@Column(name = "profile_image_url", columnDefinition = "MEDIUMTEXT")
private String profileImageUrl;
```

---

## Phase 4: Booking System

---

### Challenge 9: Booking Failing — "Worker skill does not match job requirement"

**Problem:**
When a provider tried to book a worker from the "Browse Workers" tab, it always failed with:
```
422 Unprocessable Entity: Worker skill does not match job requirement
```

**Root Cause:**
The booking service had strict skill matching — it compared the job's required skill against the worker's skills list. If the worker had "Farming, Harvesting" but the job required "Irrigation", the booking was blocked even though the provider intentionally chose that worker.

**Fix:**
Removed the hard block. Changed it to a soft check — log the mismatch but allow the booking. Providers know best who they want to hire:
```java
// Before: threw exception on mismatch
// After: allow booking regardless of skill match
if (!skillMatches) {
    // Allow booking anyway — provider is making an informed decision
}
```

---

### Challenge 10: Booking Failing — "Job is not open for booking"

**Problem:**
Trying to book a worker for a job that was in PENDING status (not OPEN) returned an error.

**Root Cause:**
Once any worker expressed interest and a booking was attempted, the job status changed to PENDING. The booking service only allowed bookings for OPEN jobs.

**Fix:**
This was actually correct behavior — a job in PENDING state already has a booking in progress. The fix was to ensure providers only see OPEN jobs in the "Book Worker" modal by filtering:
```javascript
setJobs((res.data || []).filter(j => j.status === 'OPEN'));
```

---

## Phase 5: Frontend Errors

---

### Challenge 11: ESLint Error — 'Bell' is not defined

**Problem:**
Frontend compilation failed:
```
ERROR [eslint] src\pages\WorkerDashboard.js
Line 360:18: 'Bell' is not defined react/jsx-no-undef
```

**Root Cause:**
The `Bell` icon from `lucide-react` was used in JSX but not imported at the top of the file.

**Fix:**
Added `Bell` to the import statement:
```javascript
import { Briefcase, Calendar, Bell, ... } from 'lucide-react';
```

---

### Challenge 12: ESLint Error — 'ChevronRight' is not defined

**Problem:**
```
ERROR [eslint] src\pages\WorkerDashboard.js
Line 429:113: 'ChevronRight' is not defined react/jsx-no-undef
```

**Root Cause:**
Same issue — `ChevronRight` was used but not imported.

**Fix:**
Added `ChevronRight` to the lucide-react import.

---

### Challenge 13: Cursor Jumping While Typing in Filter Fields

**Problem:**
When typing in the skill filter or minimum rating fields in "Browse Workers", the cursor would jump to the end of the input after every keystroke, making it impossible to edit text in the middle.

**Root Cause:**
The filter inputs were inside a component that re-rendered on every keystroke because the filter values were in state and passed as `useCallback` dependencies. Each re-render destroyed and recreated the input element, resetting cursor position.

**Fix:**
Used `React.useRef` to store filter values without triggering re-renders:
```javascript
const skillRef = React.useRef(skill);
const ratingRef = React.useRef(minRating);

// Input reads from state (for display), ref stores actual value
onChange={e => setSkill(e.target.value)}
// On search button click, copy state to ref
skillRef.current = skill;
```

---

### Challenge 14: `render is not a function` — React-Leaflet Crash

**Problem:**
After installing `react-leaflet` for the map feature, the entire app crashed with:
```
Uncaught runtime errors:
ERROR render is not a function
TypeError: render is not a function
    at updateContextConsumer
```

**Root Cause:**
`npm install react-leaflet` installed version **5.0.0**, which requires **React 19**. The project uses **React 18**, causing an internal context API incompatibility.

**Fix:**
Downgraded to `react-leaflet` v4 which supports React 18:
```bash
npm install react-leaflet@4.2.1 leaflet@1.9.4 --legacy-peer-deps
```

---

### Challenge 15: Leaflet Map Marker Icons Broken (404 Error)

**Problem:**
After setting up the Leaflet map, the default marker icons showed as broken images (404 errors in console).

**Root Cause:**
Webpack (used by Create React App) breaks Leaflet's default icon path resolution. Leaflet tries to load marker images from a relative path that doesn't exist after bundling.

**Fix:**
Manually override the default icon URLs in `NearbyMap.js`:
```javascript
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

---

## Phase 6: Backend Compilation Errors

---

### Challenge 16: `toBuilder()` Method Not Found on WorkerCardResponse

**Problem:**
Backend compilation failed:
```
ERROR: cannot find symbol
symbol: method toBuilder()
location: class WorkerCardResponse
```

**Root Cause:**
The `@Builder` annotation on `WorkerCardResponse` does not generate a `toBuilder()` method by default. The code was trying to use `.toBuilder().distanceKm(dist).build()` to create a modified copy.

**Fix:**
Changed `@Builder` to `@Builder(toBuilder = true)`:
```java
@Builder(toBuilder = true)
public class WorkerCardResponse {
    // ...
}
```

---

### Challenge 17: Java Stream Type Inference Error

**Problem:**
```
ERROR: incompatible types: inference variable T has incompatible bounds
upper bounds: WorkerCardResponse, Object
lower bounds: Object
```

**Root Cause:**
Inside a `.map()` lambda, Java couldn't infer the return type when chaining `.toBuilder()` directly on the result of `toCardResponse(u)`.

**Fix:**
Assigned the result to a typed variable first:
```java
// Before (caused error):
.map(u -> toCardResponse(u).toBuilder().distanceKm(dist).build())

// After (fixed):
.map(u -> {
    WorkerCardResponse card = toCardResponse(u);
    return card.toBuilder().distanceKm(dist).build();
})
```

---

## Phase 7: Database Issues

---

### Challenge 18: Demo Worker Locations Not Showing

**Problem:**
After seeding demo workers, the "Nearby Workers" feature showed no workers on the map even though location data was in the SQL file.

**Root Cause:**
The demo workers SQL file had `INSERT` statements that didn't include the new `latitude`, `longitude`, `city`, `state` columns (added later). The `UPDATE` statements at the bottom of the file were updating by phone number, but some workers had different phone numbers in the actual database than expected.

**Fix:**
Ran targeted UPDATE statements directly against the database using the actual IDs:
```sql
UPDATE users SET latitude=25.5941, longitude=85.1376, city='Patna', state='Bihar' WHERE id=1;
UPDATE users SET latitude=26.8467, longitude=80.9462, city='Lucknow', state='UP' WHERE id=2;
```

---

### Challenge 19: Job Locations Not Propagating

**Problem:**
Jobs posted by demo providers had no latitude/longitude even though providers had location data.

**Root Cause:**
The `CreateJobRequest` DTO didn't have `latitude` and `longitude` fields, so even if the frontend sent them, they were ignored by the backend.

**Fix:**
Added fields to `CreateJobRequest.java`:
```java
private Double latitude;
private Double longitude;
```
And updated `JobService.createJob()` to set them on the Job entity.

---

## Summary Table

| # | Error | Phase | Severity | Fix |
|---|-------|-------|----------|-----|
| 1 | BCrypt hash corrupted by PowerShell | Setup | Critical | Write SQL to file, pipe to MySQL |
| 2 | MySQL ADD COLUMN IF NOT EXISTS | Setup | Medium | Remove IF NOT EXISTS |
| 3 | Port 8080 already in use | Runtime | Medium | Kill Java process |
| 4 | JWT not sent with requests | Auth | Critical | Axios interceptor |
| 5 | CORS blocked | Auth | Critical | Spring CORS config |
| 6 | ClassCastException in JWT filter | Auth | Critical | Parse subject as Long |
| 7 | Profile image 400 error | Upload | High | Switch to base64 |
| 8 | Data too long for column | Upload | High | Change to MEDIUMTEXT |
| 9 | Skill mismatch blocks booking | Booking | High | Remove hard block |
| 10 | Job not OPEN for booking | Booking | Medium | Filter OPEN jobs in UI |
| 11 | Bell not defined | Frontend | Low | Add to import |
| 12 | ChevronRight not defined | Frontend | Low | Add to import |
| 13 | Cursor jumping in inputs | Frontend | Medium | Use useRef |
| 14 | react-leaflet render error | Map | Critical | Downgrade to v4.2.1 |
| 15 | Leaflet marker icons broken | Map | Medium | Override icon URLs |
| 16 | toBuilder() not found | Backend | High | @Builder(toBuilder=true) |
| 17 | Stream type inference error | Backend | High | Assign to typed variable |
| 18 | Worker locations not showing | Database | Medium | Direct UPDATE by ID |
| 19 | Job locations not saved | Database | Medium | Add fields to DTO |
