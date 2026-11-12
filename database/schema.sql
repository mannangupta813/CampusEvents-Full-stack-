-- ==========================================================
-- Campus Events: College Event Management System
-- Database Schema: MySQL Relational Design
-- Compatible with MySQL 8.0+ and H2 Database
-- ==========================================================

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) UNIQUE,
    department VARCHAR(80),
    year_of_study INT,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT', -- STUDENT, ORGANIZER, ADMIN
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50) DEFAULT 'calendar'
);

-- 3. CLUBS TABLE
CREATE TABLE clubs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(60),
    email VARCHAR(120),
    logo_url VARCHAR(255),
    lead_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clubs_lead FOREIGN KEY (lead_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. EVENTS TABLE
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    club_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    banner_url VARCHAR(255),
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 100,
    registration_deadline DATE NOT NULL,
    eligibility VARCHAR(200) DEFAULT 'All college students',
    rules TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 5. REGISTRATIONS TABLE
CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(60) NOT NULL UNIQUE,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    qr_token VARCHAR(120) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, ATTENDED
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_event_reg UNIQUE (event_id, user_id)
);

-- 6. ATTENDANCE TABLE
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL UNIQUE,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_by BIGINT,
    checkin_method VARCHAR(30) DEFAULT 'QR_SCAN', -- QR_SCAN, MANUAL
    remarks VARCHAR(255),
    CONSTRAINT fk_att_reg FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_checker FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO', -- INFO, SUCCESS, WARNING
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_reg_event ON registrations(event_id);
CREATE INDEX idx_reg_user ON registrations(user_id);
CREATE INDEX idx_reg_token ON registrations(qr_token);
CREATE INDEX idx_att_event ON attendance(event_id);
