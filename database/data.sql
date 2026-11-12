-- ==========================================================
-- Campus Events: Sample Data & Seed Records
-- Run this script in MySQL Workbench or mysql CLI after schema.sql
-- ==========================================================

-- 1. SEED USERS
-- Default passwords:
-- Admin: Admin@123 ($2a$10$wB8G2vP4m7K5Y9r1Q3d8tOuQz1hK8o.y6/rY2hE.9kR3mS1vW7xK2)
-- Organizer: Organizer@123 ($2a$10$l4p1Y8v2k7m9Q3r5T6w8e.Z0aB1c2D3e4F5g6H7i8J9k0L1m2N3oP)
-- Student: Student@123 ($2a$10$a1b2c3d4e5f6g7h8i9j0k.1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6)
-- Note: Spring Boot DataInitializer also auto-provisions and synchronizes these accounts with BCrypt.

INSERT INTO users (id, full_name, email, password, roll_no, department, year_of_study, role, phone) VALUES
(1, 'System Administrator', 'admin@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', 'ADM-001', 'Computer Science & Engineering', 4, 'ADMIN', '+91 9876543210'),
(2, 'Sarah Jenkins (Tech Lead)', 'organizer@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', 'ORG-101', 'Information Technology', 3, 'ORGANIZER', '+91 9876543211'),
(3, 'Alex Rivera (E-Cell Head)', 'ecell@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', 'ORG-102', 'Management Studies', 3, 'ORGANIZER', '+91 9876543212'),
(4, 'David Chen (Robotics Pres)', 'robotics@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', 'ORG-103', 'Electronics & Comm', 4, 'ORGANIZER', '+91 9876543213'),
(5, 'Aarav Sharma', 'student@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', '21BCS1045', 'Computer Science & Engineering', 3, 'STUDENT', '+91 9876543220'),
(6, 'Priya Patel', 'priya@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', '22BIT2014', 'Information Technology', 2, 'STUDENT', '+91 9876543221'),
(7, 'Rohan Verma', 'rohan@campusevents.edu', '$2a$10$k1wKq.LgZfxHkQzP8XGv7uM5K3uQ2yR5hU4tF6wK8oP3mS1vW7xK2', '20BME3089', 'Mechanical Engineering', 4, 'STUDENT', '+91 9876543222');

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, description, icon) VALUES
(1, 'Hackathons', 'Sprint-like software & hardware creation competitions', 'code'),
(2, 'Workshops', 'Hands-on practical learning sessions and bootcamps', 'book-open'),
(3, 'Technical', 'Coding contests, tech symposia, and engineering showcases', 'cpu'),
(4, 'Cultural', 'Music, dance, drama, art, and campus fest celebrations', 'music'),
(5, 'Sports', 'Inter-departmental leagues, tournaments, and fitness meets', 'activity'),
(6, 'Entrepreneurship', 'Startup pitches, investor connects, and business hackathons', 'trending-up'),
(7, 'Competitions', 'Quizzes, debates, gaming tournaments, and case studies', 'award'),
(8, 'Seminars', 'Expert guest lectures, panel discussions, and keynotes', 'users');

-- 3. SEED CLUBS
INSERT INTO clubs (id, name, description, category, email, logo_url, lead_user_id) VALUES
(1, 'Coding Club', 'Premier student developer community fostering competitive coding and software development.', 'Technical', 'codingclub@campusevents.edu', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80', 2),
(2, 'E-Cell (Entrepreneurship Cell)', 'Empowering campus founders and innovators to turn ideas into viable ventures.', 'Entrepreneurship', 'ecell@campusevents.edu', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&q=80', 3),
(3, 'AI & Robotics Society', 'Pioneering artificial intelligence, autonomous robotics, and machine learning research.', 'Technical', 'robotics@campusevents.edu', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80', 4),
(4, 'Campus Sports Board', 'Organizing sports leagues, fitness activities, and varsity championships.', 'Sports', 'sports@campusevents.edu', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80', 1),
(5, 'Cultural Arts Committee', 'Bringing life and rhythm to campus through performing arts and annual cultural fests.', 'Cultural', 'cultural@campusevents.edu', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', 1);

-- 4. SEED EVENTS (Matching Prompt Requirements)
INSERT INTO events (id, title, description, club_id, category_id, banner_url, event_date, event_time, venue, max_capacity, registration_deadline, eligibility, rules, is_published, is_cancelled) VALUES
(1, 'CodeSprint 2026', 'Annual 24-hour algorithmic hackathon tackling real-world sustainability and campus automation problems. Exciting cash prizes, swags, and internship interviews with top tech firms.', 1, 1, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80', '2026-12-15', '09:00 AM', 'Main Tech Complex - Lab 4 & 5', 120, '2026-12-10', 'All B.Tech / BCA / MCA students with valid college ID', 'Teams of 2 to 4 members. Bring personal laptops and chargers. Plagiarism will lead to immediate disqualification.', TRUE, FALSE),

(2, 'E-Summit 2026', 'Flagship entrepreneurship conclave featuring keynote talks by unicorn founders, venture capital panel discussions, angel investment pitches, and networking mixers.', 2, 6, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&q=80', '2026-12-18', '10:00 AM', 'Convention Center & Grand Auditorium', 300, '2026-12-14', 'Open to all departments and alumni founders', 'Formal or business casual attire. Carry student ID. Pre-registration is mandatory for investor pitch sessions.', TRUE, FALSE),

(3, 'AI Innovation Workshop', 'Comprehensive hands-on deep learning bootcamp covering LLM fine-tuning, retrieval-augmented generation (RAG), and deploying autonomous agent systems on modern cloud platforms.', 3, 2, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=80', '2026-12-22', '02:00 PM', 'Seminar Hall B, Block 3', 80, '2026-12-20', 'Students with basic knowledge of Python and data structures', 'Individual participation. Jupyter environment will be provisioned. Certificate provided upon project completion.', TRUE, FALSE),

(4, 'Campus Premier League', 'The most anticipated inter-departmental cricket tournament of the year. Cheer for your branch, experience the stadium atmosphere, and enjoy live food stalls and commentary.', 4, 5, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&q=80', '2026-12-28', '08:30 AM', 'University Central Sports Ground', 500, '2026-12-25', 'All enrolled undergraduate and postgraduate students', 'Department jersey/sports uniform required. Standard ICC T20 modified league rules apply.', TRUE, FALSE),

(5, 'Startup Ideathon', 'Pitch your disruptive product or social impact idea before seasoned angel investors, alumni entrepreneurs, and faculty mentors. Win up to $5,000 seed grant funding.', 2, 7, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1000&q=80', '2027-01-08', '10:30 AM', 'Incubation Center, 2nd Floor', 60, '2027-01-05', 'Open to student teams with an early-stage concept or prototype', 'Pitch deck of max 10 slides. 5 minutes pitch followed by 3 minutes Q&A by jury.', TRUE, FALSE),

(6, 'Cultural Night 2026', 'An enchanting evening of live band performances, classical and western fusion dance troupes, stand-up comedy acts, and celebrity guest musical appearances.', 5, 4, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&q=80', '2027-01-15', '06:00 PM', 'Open Air Theatre (OAT)', 800, '2027-01-12', 'All university students, faculty, and staff members', 'Digital QR pass must be shown at the security turnstiles for entry. No outside beverages allowed.', TRUE, FALSE);

-- 5. SEED REGISTRATIONS
INSERT INTO registrations (id, registration_number, event_id, user_id, qr_token, status, registered_at) VALUES
(1, 'REG-2026-CS-001', 1, 5, 'QR-CS26-5-A1F98C3', 'CONFIRMED', '2026-11-01 10:15:00'),
(2, 'REG-2026-ES-002', 2, 5, 'QR-ES26-5-B7D44E1', 'CONFIRMED', '2026-11-02 14:30:00'),
(3, 'REG-2026-AI-003', 3, 5, 'QR-AI26-5-C2E88F9', 'ATTENDED', '2026-11-03 09:20:00'),
(4, 'REG-2026-CS-004', 1, 6, 'QR-CS26-6-D4A11B2', 'CONFIRMED', '2026-11-04 11:00:00'),
(5, 'REG-2026-CP-005', 4, 7, 'QR-CP26-7-E9F33A8', 'CONFIRMED', '2026-11-05 16:45:00');

-- 6. SEED ATTENDANCE
INSERT INTO attendance (id, registration_id, event_id, user_id, checked_in_at, checked_in_by, checkin_method, remarks) VALUES
(1, 3, 3, 5, '2026-11-10 14:05:00', 4, 'QR_SCAN', 'Checked in on time at Seminar Hall B turnstile');

-- 7. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 5, 'Registration Confirmed', 'Your pass for CodeSprint 2026 is confirmed. Please check your QR pass in My Registrations.', 'SUCCESS', FALSE),
(2, 5, 'Event Reminder', 'AI Innovation Workshop is scheduled for this week. Bring your laptop and charger.', 'INFO', TRUE),
(3, 2, 'New Participant Registered', 'Aarav Sharma registered for CodeSprint 2026.', 'INFO', FALSE);
