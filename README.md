# 🌾 Rural Workforce Marketplace

A full-stack web application that connects **rural workers** (farmers, carpenters, plumbers, electricians) with **job providers** (farm owners, construction companies, households).

## 🌐 Live Deployment

Open the live app here:

https://rural-workforce-mark-git-a745ac-shaik-mansurs-projects-63314e08.vercel.app/

> This URL opens the deployed project directly.

---

## 🚀 About

The repository contains:

- `backend/` — Spring Boot API with JWT authentication, MySQL persistence, and job matching logic.
- `frontend/` — React + Tailwind UI for workers and providers.
- `docs/` — architecture, implementation notes, and challenges.

---

## 🧩 Key Features

- User registration and login
- Worker and provider dashboards
- Post and browse jobs
- Real-time notifications
- Nearby jobs and workers map view
- Profile management with photo upload

---

## 🔧 Deployment Notes

The app is currently deployed on Vercel. Use the live URL above to access it.

If you want to run it locally, you must configure the backend first.

---

## 💻 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/shaikmansur122/rural-workforce-marketplace.git
cd "rural work force"
```

### 2. Prepare the database

Create the database in MySQL:

```sql
CREATE DATABASE rural_workforce;
```

Load the schema and optional demo data:

```bash
mysql -u root -p rural_workforce < backend/src/main/resources/schema.sql
mysql -u root -p rural_workforce < backend/demo_workers.sql
mysql -u root -p rural_workforce < backend/demo_providers_jobs.sql
```

### 3. Configure backend settings

Copy the example file and update credentials:

```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

Update the file with your database credentials and JWT secret.

### 4. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The backend will run at `http://localhost:8080`.

### 5. Start the frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run at `http://localhost:3000`.

---

## 📌 Notes

- `application.properties` is not committed. Use `application.properties.example` as a template.
- The live Vercel deployment URL is the recommended way to open the project.
- Local execution requires MySQL and Java/Maven installed.

---

## 📁 Repository Structure

```text
backend/      # Spring Boot backend
frontend/     # React frontend
docs/         # project documentation
README.md     # this file
```

---

## ✅ GitHub Repository

Remote origin:

https://github.com/shaikmansur122/rural-workforce-marketplace.git
