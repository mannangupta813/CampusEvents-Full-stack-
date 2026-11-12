# 🏛️ Campus Events — College Event Management System

> **Discover. Register. Experience Campus.**  
> A full-stack, enterprise-grade collegiate event management platform featuring real-time event discovery, seat capacity enforcement, secure JWT authentication, digital QR pass issuance, and turnstile attendance scanning.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Database Design & Schema](#-database-design--schema)
5. [Directory Structure](#-directory-structure)
6. [API Endpoints](#-api-endpoints)
7. [Step-by-Step Local Setup](#-step-by-step-local-setup)
8. [GitHub Repository Instructions](#-github-repository-instructions)
9. [Cloud Deployment Guide (Vercel + Render + Railway)](#-cloud-deployment-guide)
10. [End-to-End Verification & Testing](#-end-to-end-verification--testing)

---

## 🌟 Project Overview

**Campus Events** brings students, college clubs, and platform administrators onto a unified platform:
- **🎓 Students:** Discover hackathons, workshops, cultural fests, and sports leagues. Register with instant capacity validation, receive a unique digital QR pass, and track attendance history.
- **🎪 Club Organizers:** Host and manage events for their club, track participant numbers, scan QR passes at the entrance turnstiles, and export attendance records as CSV.
- **⚡ Administrators:** Supervise user roles, manage clubs, govern published events, and monitor platform analytics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, React Context, Axios / Fetch API, Responsive CSS |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Hibernate, Bean Validation |
| **Security** | BCrypt Password Hashing, JWT (HMAC-SHA256 Token Authentication), Role-Based Access Control (RBAC) |
| **Database** | MySQL 8.0+ (Production/Local), H2 (In-memory fallback/Testing) |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |
| **Build Tools** | Maven (Backend), Vite / npm (Frontend) |
| **Deployment** | Vercel (Frontend), Render (Spring Boot Backend), Railway (Managed MySQL Database) |

---

## 🏛️ System Architecture

The application strictly follows the **Three-Tier Architecture** and **Three-Layer Application Architecture**:

```
[ CLIENT TIER ]
   React 18 SPA (Vite / React Router / Context API / Modern SaaS UI)
         │  HTTP / REST (JSON) + Bearer JWT Token
         ▼
[ APPLICATION TIER - Spring Boot 3 ]
   ├── Presentation Layer: REST Controllers (AuthController, EventController, etc.)
   ├── Security Layer:     JwtUtils, AuthTokenFilter, SecurityFilterChain (RBAC)
   ├── Business Layer:     AuthService, EventService, RegistrationService, AttendanceService
   └── Data Access Layer:  Spring Data JPA Repositories (UserRepository, EventRepository, etc.)
         │  JDBC / Hibernate ORM
         ▼
[ DATA STORE TIER ]
   MySQL 8.0 Relational Database (users, clubs, events, categories, registrations, attendance)
```

---

## 🗄️ Database Design & Schema

### Relational Tables:
1. `users`: Stores students, organizers, and admins with BCrypt-hashed passwords and college roll numbers.
2. `categories`: 8 event categories (Hackathons, Workshops, Technical, Cultural, Sports, Entrepreneurship, Competitions, Seminars).
3. `clubs`: College student societies (Coding Club, E-Cell, AI & Robotics Society, Sports Board, Cultural Committee).
4. `events`: Scheduled events with room capacity, registration deadlines, rules, and venue details.
5. `registrations`: Student pass records with unique `registration_number`, `qr_token`, and strict `(event_id, user_id)` uniqueness.
6. `attendance`: Turnstile scan records with verifier ID, check-in timestamp, and method (`QR_SCAN` / `MANUAL`).
7. `notifications`: Real-time user alert records.

SQL scripts are located at:
- `database/schema.sql` (Table definitions, constraints, indexes)
- `database/data.sql` (Pre-seeded sample records and test accounts)

---

## 📂 Directory Structure

```
Campus_Events/
├── backend/
│   ├── src/main/java/com/campusevents/
│   │   ├── config/          # DataInitializer (auto-provisions default seed records)
│   │   ├── controller/      # REST API Controllers (Auth, Events, Registrations, Attendance)
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── model/           # JPA Entities (User, Event, Club, Registration, Attendance)
│   │   ├── repository/      # Spring Data JPA Repository Interfaces
│   │   ├── security/        # JWT Utils, Filter, UserDetailsService, SecurityConfig
│   │   ├── service/         # Business Logic Layer
│   │   └── CampusEventsApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties      # MySQL + Environment Variables Configuration
│   │   └── application-dev.properties  # Standalone In-memory H2 profile
│   ├── src/test/java/com/campusevents/ # JUnit 5 & Mockito Unit Tests
│   ├── .env.example
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer
│   │   ├── context/         # AuthContext (JWT session & Toast notifications)
│   │   ├── pages/           # Home, Events, EventDetails, Login, Register, MyRegistrations,
│   │   │                    # QrPass, OrganizerDashboard, CreateEvent, EditEvent, Attendance, AdminDashboard
│   │   ├── services/        # api.js (Spring Boot REST client with resilient offline demo fallback)
│   │   ├── styles/          # main.css (Modern SaaS Design System)
│   │   ├── App.jsx          # Protected React Routes
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql           # MySQL DDL Schema
│   └── data.sql             # Demo Seed Data
│
├── .gitignore
├── README.md
└── PROJECT_REPORT.md        # Academic Project Report (Chapters 1 to 4)
```

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or organizer | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Authenticated |

### 📅 Events (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/events` | List events with category, club, search & upcoming filters | Public |
| `GET` | `/api/events/{id}` | Retrieve complete event details & remaining seats | Public |
| `POST` | `/api/events` | Create and publish a new event | Organizer / Admin |
| `PUT` | `/api/events/{id}` | Update event details | Organizer / Admin |
| `DELETE` | `/api/events/{id}` | Delete event | Organizer / Admin |

### 🎟️ Registrations (`/api/registrations`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/registrations/events/{id}` | Register for event & generate unique QR pass | Student |
| `DELETE` | `/api/registrations/{id}` | Cancel active registration | Student / Admin |
| `GET` | `/api/registrations/my` | Retrieve logged-in student's passes | Student |
| `GET` | `/api/registrations/token/{token}` | Validate pass details via QR token | Organizer / Admin |

### 📷 Attendance (`/api/attendance`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/attendance/check-in` | Validate QR scan and record attendance | Organizer / Admin |
| `GET` | `/api/attendance/events/{id}` | View participant attendance log | Organizer / Admin |
| `GET` | `/api/attendance/events/{id}/export-csv` | Download official attendance CSV register | Organizer / Admin |

---

## 🚀 Step-by-Step Local Setup

### Phase 1: Database Setup (MySQL)
1. Open **MySQL Workbench** or your terminal client:
   ```sql
   CREATE DATABASE campus_events;
   ```
2. Run `database/schema.sql` followed by `database/data.sql`.
   *(Note: The Spring Boot backend's `DataInitializer` also automatically populates tables on boot if empty!)*

### Phase 2: Running Backend (Spring Boot)
1. In `backend/src/main/resources/application.properties`, update your MySQL password if needed:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
2. Run backend via Maven:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will start at **`http://localhost:8080/api`**.

### Phase 3: Running Frontend (React)
1. Open a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at **`http://localhost:5173`**.

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Student** | `student@campusevents.edu` | `Student@123` | Browse events, 1-click register, view QR passes, cancel |
| **Club Organizer** | `organizer@campusevents.edu` | `Organizer@123` | Host events, edit, scan QR pass, attendance CSV |
| **Administrator** | `admin@campusevents.edu` | `Admin@123` | Full system control, role changes, all clubs & events |

*(The navigation bar includes a 1-click quick role switcher for instant academic demonstration!)*

---

## ☁️ Cloud Deployment Guide

### 1. Database (Railway)
1. Go to [railway.app](https://railway.app) and create a **New Project** → **Provision MySQL**.
2. Copy the connection variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).

### 2. Backend (Render)
1. Push your repository to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → Connect your repository.
3. Root Directory: `backend`.
4. Runtime: `Java` (Maven).
5. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?useSSL=false&allowPublicKeyRetrieval=true`
   - `SPRING_DATASOURCE_USERNAME`: `<MYSQLUSER>`
   - `SPRING_DATASOURCE_PASSWORD`: `<MYSQLPASSWORD>`
   - `JWT_SECRET`: `<YOUR_SECRET_KEY>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`

### 3. Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repository.
2. Root Directory: `frontend`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
5. Click **Deploy**.

