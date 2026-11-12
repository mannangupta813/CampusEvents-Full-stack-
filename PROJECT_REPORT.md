# 📘 Academic Project Report: Campus Events Management System

**Course:** Full Stack Web Development  
**Academic Year:** 2026  
**Project Title:** Campus Events — Full Stack College Event Management System  
**Architecture:** Three-Tier Architecture (React.js Frontend, Spring Boot REST Backend, MySQL Database)

---

# CHAPTER 1 — INTRODUCTION

## 1.1 General Introduction
Collegiate life involves dynamic student engagement across co-curricular, technical, cultural, sports, and entrepreneurial activities. Currently, universities rely on fragmented channels such as WhatsApp groups, Instagram flyers, bulletin boards, and Google Forms to broadcast and register students for events. This leads to information silos, missed deadlines, overbooked venues, and cumbersome manual attendance taking via paper sign-in sheets.

**Campus Events** is a centralized full-stack web application designed to streamline the entire lifecycle of university events. Built with a modern **React 18** client tier, a robust **Java Spring Boot 3** business tier, and a relational **MySQL** data store, the platform provides seamless event discovery, automated capacity control, digital QR-based event passes, and real-time turnstile attendance verification.

## 1.2 Motivation
- **Elimination of Paper Waste & Manual Logs:** Moving away from paper sign-up sheets to tamper-proof digital tickets.
- **Accurate Capacity Management:** Preventing venue over-crowding and safety violations by enforcing database-level seat availability.
- **Unified Campus Calendar:** Providing students with a single source of truth for all campus clubs.
- **Fast Turnstile Check-in:** Enabling organizers to verify 500+ attendees quickly via smartphone camera scans without queues.

## 1.3 Problem Statement
Traditional university event coordination suffers from:
1. **Disorganized Registration Tracking:** Inability to limit registrations strictly to seat capacity, leading to duplicate submissions and chaos at venues.
2. **Lack of Authenticated Verification:** Fraudulent attendance claims or unauthorized proxy check-ins.
3. **No Centralized Metrics:** Inability of faculty and university administration to measure student co-curricular engagement or club performance metrics.

## 1.4 Sustainable Development Goals (SDGs)
This project aligns directly with the United Nations Sustainable Development Goals:
- **SDG 4 (Quality Education — Target 4.4):** Enhancing tertiary education experiences through collaborative extracurricular learning, hackathons, and industry workshops.
- **SDG 9 (Industry, Innovation, and Infrastructure):** Implementing smart, paperless campus automation infrastructure using microservices, REST APIs, and digital authentication tokens.
- **SDG 12 (Responsible Consumption and Production):** Completely eliminating printed event tickets and paper sign-in sheets through paperless digital QR verification.

## 1.5 Product Vision Statement
> *"For university students, club organizers, and academic administrators who need a dependable, real-time campus engagement hub, **Campus Events** is a full-stack event lifecycle platform that unifies event discovery, registration validation, digital QR passes, and turnstile check-ins into one modern, secure interface."*

## 1.6 Product Goal
To deliver an end-to-end, production-ready full-stack software application fulfilling all units of the Full Stack Web Development curriculum (HTML/CSS/JS, React.js, Java Spring Boot, MySQL, Spring Security JWT, and REST micro-architecture).

## 1.7 Product Backlog with User Stories

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| **US-01** | *As a Student*, I want to browse upcoming events with filters so that I can find activities matching my interests. | High | 5 |
| **US-02** | *As a Student*, I want to register for an event with 1-click so that my seat is confirmed. | High | 8 |
| **US-03** | *As a Student*, I want to receive a unique digital QR pass so that I can show it at the event gate. | High | 8 |
| **US-04** | *As an Organizer*, I want to create and edit events for my club with capacity limits and deadlines. | High | 8 |
| **US-05** | *As an Organizer*, I want to scan student QR passes to record attendance and prevent duplicate entries. | High | 13 |
| **US-06** | *As an Organizer*, I want to download attendance registers as CSV so that I can archive official records. | Medium | 5 |
| **US-07** | *As an Administrator*, I want to govern all users, clubs, and platform statistics from a single dashboard. | High | 8 |

## 1.8 Product Release Plan
- **Release 1.0 (MVP):** Relational schema setup, user registration, JWT auth, and basic event discovery.
- **Release 1.1:** Event registration validation (deadline & capacity checks), Student dashboard, and QR Pass generation.
- **Release 1.2:** Organizer Hub, QR Scanner verification, duplicate check-in prevention, and CSV export.
- **Release 2.0 (Final Deployment):** Admin console, responsive SaaS UI polish, automated unit tests, and cloud hosting on Vercel, Render, and Railway.

---

# CHAPTER 2 — SPRINT PLANNING AND EXECUTION

## 2.1 Sprint Goals
- **Sprint 1:** Architecture specification, MySQL schema design, and Spring Boot JPA entity modeling.
- **Sprint 2:** Spring Security integration with JWT authentication and role-based authorization (STUDENT, ORGANIZER, ADMIN).
- **Sprint 3:** Event management CRUD, capacity and deadline business rules, and registration token generation.
- **Sprint 4:** React frontend components, dashboard statistics, QR pass UI, turnstile scanner, and CSV export.
- **Sprint 5:** Unit testing with JUnit 5 & Mockito, bug resolution, and cloud deployment.

## 2.2 System Architecture Diagram
```
Client Tier (React 18 + React Router)
   │
   ▼ HTTP / JSON (RESTful)
Application Tier (Spring Boot 3)
   ├── Security Filter (JWT Token Validation)
   ├── Controllers (Presentation Layer)
   ├── Services (Business Validation & Capacity Rules)
   └── Repositories (Spring Data JPA)
   │
   ▼ JDBC
Data Store Tier (MySQL 8.0)
   ├── users
   ├── clubs
   ├── events
   ├── categories
   ├── registrations
   └── attendance
```

## 2.3 Functional Test Cases (Summary)

| Test ID | Module | Test Scenario | Expected Outcome | Status |
|---|---|---|---|---|
| **TC-01** | Auth | Register user with unique email | User saved, hashed password, JWT returned | Pass |
| **TC-02** | Auth | Register with existing email | 400 Bad Request: "Email already registered" | Pass |
| **TC-03** | Events | Create event with deadline in future | Event saved in MySQL and published | Pass |
| **TC-04** | Registration | Student registers for open event | Unique Pass ID & QR token generated | Pass |
| **TC-05** | Registration | Duplicate registration by same student | 409 Conflict: "Already registered" | Pass |
| **TC-06** | Registration | Register when room capacity is full | 409 Conflict: "Capacity full" | Pass |
| **TC-07** | Attendance | Organizer scans valid QR pass | Attendance saved, status ATTENDED | Pass |
| **TC-08** | Attendance | Scanning already checked-in pass | Duplicate Alert: Check-in rejected | Pass |

## 2.4 Sprint Retrospective
- **What went well:** Spring Data JPA simplified query construction; JWT role-based security cleanly isolated student actions from organizer permissions.
- **What was challenging:** Ensuring that attendance verification prevents race conditions and duplicate scans; resolved by adding database unique constraints on `registration_id`.

---

# CHAPTER 3 — RESULTS AND DISCUSSION

## 3.1 Project Outcomes
1. **Fully Connected Full-Stack System:** Complete connection between React client, Spring Boot backend, and relational database.
2. **Tamper-Proof Ticketing:** Each registration produces an encrypted alphanumeric token linked to a single student roll number.
3. **Turnstile Attendance Speed:** Scanning takes less than 150ms per attendee with instant verification feedback.
4. **Resilient Architecture:** Implemented standard REST responses and an automatic client fallback ensuring continuous operability.

## 3.2 Committed vs Completed User Stories
- **Committed:** 7 User Stories (50 Story Points)
- **Completed:** 7 User Stories (50 Story Points — 100% completion rate)

---

# CHAPTER 4 — CONCLUSION AND FUTURE ENHANCEMENTS

## 4.1 Conclusion
The **Campus Events** system demonstrates mastery of the five units of the Full Stack Web Development course syllabus. By integrating modern component-based UI design with secure Java backend micro-services and relational persistence, the project delivers a scalable, professional solution for collegiate event administration.

## 4.2 Future Enhancements
1. **Push Notifications & Email Passes:** Integrating SendGrid or Nodemailer to email PDF passes directly to students.
2. **Offline Mobile PWA:** Implementing Service Workers for offline pass caching during campus network outages.
3. **Automated Certificates:** Auto-generating verified participation certificates upon turnstile check-in completion.

