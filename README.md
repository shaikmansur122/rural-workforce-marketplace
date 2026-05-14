# 🌾 Rural Workforce Marketplace

A full-stack web application that connects **rural workers** (farmers, carpenters, plumbers, electricians) with **job providers** (farm owners, construction companies, households) — like an Uber/Upwork for rural India.

---

## 📸 Features at a Glance

| Feature | Workers | Providers |
|---------|---------|-----------|
| Authentication | ✅ Register / Login | ✅ Register / Login |
| Dashboard | ✅ Browse Jobs, Bookings, Profile | ✅ My Jobs, Browse Workers, Post Job |
| Jobs | ✅ Browse & Show Interest | ✅ Post Jobs with Location |
| Bookings | ✅ Accept / Reject | ✅ Book Workers, Mark Complete |
| Reviews | — | ✅ Rate Workers after completion |
| Profile | ✅ Photo, Skills, Bio, Location | ✅ Photo, Bio, Business Info |
| Nearby Map | ✅ Nearby Jobs on Map | ✅ Nearby Workers on Map |
| Notifications | ✅ Real-time bell notifications | ✅ Real-time bell notifications |

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** — JWT-based authentication
- **Spring Data JPA** + **Hibernate** — ORM
- **MySQL 8.0** — Database
- **Lombok** — Boilerplate reduction
- **Maven** — Build tool

### Frontend
- **React.js 18** — UI framework
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Leaflet.js** + **OpenStreetMap** — Interactive maps
- **Axios** — HTTP client
- **Lucide React** — Icons
- **React Toastify** — Toast notifications

---

## 📁 Project Structure

```
rural work force/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/ruralworkforce/marketplace/
│   │   ├── controller/               # REST endpoints
│   │   ├── service/                  # Business logic
│   │   ├── repository/               # JPA repositories
│   │   ├── entity/                   # Database entities
│   │   ├── dto/                      # Request/Response objects
│   │   ├── security/                 # JWT filter, Security config
│   │   ├── exception/                # Global error handler
│   │   └── util/                     # JWT, Haversine, TimeSlot utils
│   ├── src/main/resources/
│   │   ├── application.properties    # Config (not committed)
│   │   ├── application.properties.example  # Template (safe to commit)
│   │   └── schema.sql                # Database schema
│   ├── demo_workers.sql              # 20 demo worker accounts
│   ├── demo_providers_jobs.sql       # 20 demo providers + 31 jobs
│   └── pom.xml
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── pages/                    # Full page components
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # React Context (Auth)
│   │   ├── api/                      # Axios instance
│   │   └── styles/                   # CSS files
│   └── package.json
│
├── docs/                             # Project documentation
│   ├── 1_PROJECT_FEATURES_AND_ARCHITECTURE.md
│   ├── 2_ERRORS_AND_CHALLENGES.md
│   └── 3_TECH_STACK_EXPLAINED.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |

---

## 🚀 Getting Started

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/rural-workforce-marketplace.git
cd "rural work force"
```

---

### Step 2 — Set Up the Database

Open MySQL and run:

```sql
CREATE DATABASE rural_workforce;
```

Then run the schema to create all tables:

```bash
mysql -u root -p rural_workforce < backend/src/main/resources/schema.sql
```

Load demo data (optional but recommended):

```bash
mysql -u root -p rural_workforce < backend/demo_workers.sql
mysql -u root -p rural_workforce < backend/demo_providers_jobs.sql
```

---

### Step 3 — Configure the Backend

Copy the example config and fill in your values:

```bash
cp backend/src/main/resources/application.properties.example \
   backend/src/main/resources/application.properties
```

Edit `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rural_workforce?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE

jwt.secret=YourLongRandomSecretKeyAtLeast32CharactersLong
jwt.expiration-ms=86400000
```

---

### Step 4 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

You should see:
```
Started MarketplaceApplication in 6.3 seconds
Tomcat started on port 8080
```

---

### Step 5 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

---

## 🔑 Demo Accounts

All demo accounts use password: **`password123`**

### Worker Accounts
| Phone | Name | Skills | City |
|-------|------|--------|------|
| 9876543201 | Ramu Yadav | Farming, Harvesting | Patna |
| 9876543202 | Suresh Kumar | Carpentry | Lucknow |
| 9876543203 | Vikram Singh | Plumbing, Electrical | Delhi |
| 9876543204 | Arjun Patel | Masonry | Mumbai |
| 9876543205 | Deepak Sharma | Painting | Bangalore |

### Provider Accounts
| Phone | Business | City |
|-------|----------|------|
| 9800000001 | Ramakrishna Farms | Patna |
| 9800000002 | Lucknow Builders | Lucknow |
| 9800000003 | Delhi Construction | Delhi |
| 9800000004 | Mumbai Agro | Mumbai |
| 9800000005 | Bangalore Estates | Bangalore |

> Full list: 20 workers (9876543201–9876543220) and 20 providers (9800000001–9800000020)

---

## 🗺️ API Reference

### Authentication
```
POST /auth/register    — Register new user
POST /auth/login       — Login, returns JWT token
```

### Jobs
```
GET  /jobs             — Browse open jobs (paginated)
POST /jobs             — Post a new job (PROVIDER only)
GET  /jobs/my          — Get my posted jobs (PROVIDER only)
GET  /jobs/nearby      — Get nearby jobs by coordinates
GET  /jobs/{id}/interests — Get job applicants (PROVIDER only)
```

### Bookings
```
POST  /booking              — Book a worker (PROVIDER only)
PUT   /booking/status       — Accept/Reject booking (WORKER only)
PATCH /booking/{id}/complete — Mark job complete (PROVIDER only)
GET   /booking/my           — Get my bookings (WORKER only)
```

### Workers & Profiles
```
GET /workers           — Browse workers (with filters)
GET /workers/nearby    — Get nearby workers by coordinates
GET /workers/{id}      — Get worker profile
GET /profile           — Get own profile
PUT /profile           — Update own profile
PUT /profile/location  — Update location coordinates
```

### Reviews & Notifications
```
POST /reviews          — Submit a review (PROVIDER only)
GET  /notifications    — Get my notifications
PUT  /notifications/read — Mark all as read
```

---

## 🔒 Security Notes

- Passwords are hashed with **BCrypt** (cost factor 12) — never stored in plain text
- JWT tokens expire after **24 hours**
- All endpoints except `/auth/**` require a valid JWT token
- Role-based access: providers and workers can only access their own endpoints
- CORS is configured to allow only `http://localhost:3000`

---

## 🗄️ Database Schema Overview

```
users          — Both workers and providers (role field distinguishes them)
jobs           — Posted by providers, with location coordinates
bookings       — Links a job to a worker, tracks status
interests      — Workers expressing interest in jobs
reviews        — Providers rating workers after job completion
notifications  — System messages for both roles
```

---

## 🌍 Location Features

The app uses **browser Geolocation API** + **Haversine Formula** for distance calculation:

- Workers can find nearby jobs within a selected radius (5–100 km)
- Providers can find nearby workers within a selected radius
- Interactive map powered by **Leaflet + OpenStreetMap** (no API key needed)
- Custom markers: 📍 You, 💼 Jobs, 👷 Workers
- Radius circle visualization on the map

---

## 📦 Environment Variables

### Backend (`application.properties`)

| Property | Description | Example |
|----------|-------------|---------|
| `spring.datasource.url` | MySQL connection URL | `jdbc:mysql://localhost:3306/rural_workforce` |
| `spring.datasource.username` | MySQL username | `root` |
| `spring.datasource.password` | MySQL password | `yourpassword` |
| `jwt.secret` | JWT signing key (min 32 chars) | `mySecretKey123...` |
| `jwt.expiration-ms` | Token expiry in ms | `86400000` (24h) |
| `server.port` | Backend port | `8080` |

### Frontend

The frontend uses a hardcoded base URL in `src/api/axios.js`:
```javascript
baseURL: 'http://localhost:8080'
```
Change this if your backend runs on a different host/port.

---

## 🐛 Common Issues & Fixes

**Backend won't start — port 8080 in use:**
```powershell
# Windows
Get-Process | Where-Object { $_.ProcessName -like "*java*" } | Stop-Process -Force
```

**Login fails — "Invalid Credentials":**
```sql
-- Reset demo passwords in MySQL
UPDATE users SET password='$2a$12$c0r9C/g/Nlz6IUcjXaN18.zOOwGA98q3x79ikzERuTuGnh1NcyZp2'
WHERE phone LIKE '987654320%' OR phone LIKE '9800000%';
```

**Map not loading:**
Make sure `react-leaflet` version is 4.x (not 5.x which requires React 19):
```bash
npm install react-leaflet@4.2.1 leaflet@1.9.4 --legacy-peer-deps
```

**CORS error in browser:**
Ensure the backend is running on port 8080 and frontend on port 3000. Check `SecurityConfig.java` CORS settings.

---

## 📚 Documentation

Full documentation is in the `docs/` folder:

| File | Contents |
|------|----------|
| `1_PROJECT_FEATURES_AND_ARCHITECTURE.md` | All features, API endpoints, DB schema, component structure |
| `2_ERRORS_AND_CHALLENGES.md` | 19 real errors faced and how they were fixed |
| `3_TECH_STACK_EXPLAINED.md` | Every technology explained with real code examples from this project |

---

## 🏗️ How to Build for Production

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/marketplace-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build/ folder with any static file server
```

---

## 👨‍💻 Author

Built as a full-stack project demonstrating:
- Spring Boot REST API with JWT security
- React.js with modern UI (Tailwind + Framer Motion)
- MySQL relational database design
- Location-based features with Haversine formula
- Real-world booking and marketplace workflow

---

## 📄 License

This project is for educational purposes.
