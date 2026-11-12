package com.campusevents.config;

import com.campusevents.model.*;
import com.campusevents.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking and initializing Campus Events default seed data...");

        // 1. Categories
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(List.of(
                    new Category("Hackathons", "Sprint software & hardware creation competitions", "code"),
                    new Category("Workshops", "Hands-on practical learning sessions and bootcamps", "book-open"),
                    new Category("Technical", "Coding contests, tech symposia, and engineering showcases", "cpu"),
                    new Category("Cultural", "Music, dance, drama, art, and campus fest celebrations", "music"),
                    new Category("Sports", "Inter-departmental leagues, tournaments, and fitness meets", "activity"),
                    new Category("Entrepreneurship", "Startup pitches, investor connects, and business hackathons", "trending-up"),
                    new Category("Competitions", "Quizzes, debates, gaming tournaments, and case studies", "award"),
                    new Category("Seminars", "Expert guest lectures, panel discussions, and keynotes", "users")
            ));
            logger.info("Initialized default categories.");
        }

        // 2. Default Users
        User admin = userRepository.findByEmail("admin@campusevents.edu").orElseGet(() -> {
            User u = new User("System Administrator", "admin@campusevents.edu",
                    passwordEncoder.encode("Admin@123"), "ADM-001", "Computer Science", 4, Role.ROLE_ADMIN, "+91 9876543210");
            return userRepository.save(u);
        });

        User organizer = userRepository.findByEmail("organizer@campusevents.edu").orElseGet(() -> {
            User u = new User("Sarah Jenkins (Tech Lead)", "organizer@campusevents.edu",
                    passwordEncoder.encode("Organizer@123"), "ORG-101", "Information Technology", 3, Role.ROLE_ORGANIZER, "+91 9876543211");
            return userRepository.save(u);
        });

        User ecellLead = userRepository.findByEmail("ecell@campusevents.edu").orElseGet(() -> {
            User u = new User("Alex Rivera (E-Cell Head)", "ecell@campusevents.edu",
                    passwordEncoder.encode("Organizer@123"), "ORG-102", "Management Studies", 3, Role.ROLE_ORGANIZER, "+91 9876543212");
            return userRepository.save(u);
        });

        User student = userRepository.findByEmail("student@campusevents.edu").orElseGet(() -> {
            User u = new User("Aarav Sharma", "student@campusevents.edu",
                    passwordEncoder.encode("Student@123"), "21BCS1045", "Computer Science & Engineering", 3, Role.ROLE_STUDENT, "+91 9876543220");
            return userRepository.save(u);
        });

        User student2 = userRepository.findByEmail("priya@campusevents.edu").orElseGet(() -> {
            User u = new User("Priya Patel", "priya@campusevents.edu",
                    passwordEncoder.encode("Student@123"), "22BIT2014", "Information Technology", 2, Role.ROLE_STUDENT, "+91 9876543221");
            return userRepository.save(u);
        });

        // 3. Clubs
        if (clubRepository.count() == 0) {
            Club codingClub = clubRepository.save(new Club(
                    "Coding Club",
                    "Premier student developer community fostering competitive coding, app development, and open source.",
                    "Technical",
                    "codingclub@campusevents.edu",
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80",
                    organizer
            ));

            Club ecellClub = clubRepository.save(new Club(
                    "E-Cell (Entrepreneurship Cell)",
                    "Empowering campus founders and innovators to turn disruptive ideas into scalable startups.",
                    "Entrepreneurship",
                    "ecell@campusevents.edu",
                    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&q=80",
                    ecellLead
            ));

            Club roboticsClub = clubRepository.save(new Club(
                    "AI & Robotics Society",
                    "Pioneering artificial intelligence, autonomous robotics, machine learning, and IoT research.",
                    "Technical",
                    "robotics@campusevents.edu",
                    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80",
                    organizer
            ));

            Club sportsClub = clubRepository.save(new Club(
                    "Campus Sports Board",
                    "Organizing sports leagues, athletic tournaments, and fitness challenges across departments.",
                    "Sports",
                    "sports@campusevents.edu",
                    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80",
                    admin
            ));

            Club culturalClub = clubRepository.save(new Club(
                    "Cultural Arts Committee",
                    "Bringing music, theatre, literature, and visual arts alive on campus through festivals and concerts.",
                    "Cultural",
                    "cultural@campusevents.edu",
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
                    admin
            ));

            logger.info("Initialized default clubs.");
        }

        // 4. Events
        if (eventRepository.count() == 0) {
            Club coding = clubRepository.findByName("Coding Club").orElse(null);
            Club ecell = clubRepository.findByName("E-Cell (Entrepreneurship Cell)").orElse(null);
            Club robotics = clubRepository.findByName("AI & Robotics Society").orElse(null);
            Club sports = clubRepository.findByName("Campus Sports Board").orElse(null);
            Club cultural = clubRepository.findByName("Cultural Arts Committee").orElse(null);

            Category hackathons = categoryRepository.findByName("Hackathons").orElse(null);
            Category workshops = categoryRepository.findByName("Workshops").orElse(null);
            Category technical = categoryRepository.findByName("Technical").orElse(null);
            Category entrepreneurship = categoryRepository.findByName("Entrepreneurship").orElse(null);
            Category sportsCat = categoryRepository.findByName("Sports").orElse(null);
            Category culturalCat = categoryRepository.findByName("Cultural").orElse(null);
            Category compCat = categoryRepository.findByName("Competitions").orElse(null);

            Event e1 = eventRepository.save(new Event(
                    "CodeSprint 2026",
                    "Annual 24-hour algorithmic hackathon tackling real-world sustainability and smart campus problems. Cash prizes of $2,000, swags, and direct interview opportunities with leading technology sponsors.",
                    coding,
                    hackathons != null ? hackathons : technical,
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80",
                    LocalDate.now().plusDays(25),
                    "09:00 AM",
                    "Main Tech Complex - Lab 4 & 5",
                    120,
                    LocalDate.now().plusDays(20),
                    "All B.Tech / BCA / MCA students with valid college ID",
                    "Teams of 2 to 4 members. Bring laptops and power adapters. Code must be committed to GitHub during the sprint."
            ));

            Event e2 = eventRepository.save(new Event(
                    "E-Summit 2026",
                    "Flagship entrepreneurship conclave featuring keynote talks by unicorn startup founders, venture capital masterclasses, student seed funding pitches, and executive networking mixers.",
                    ecell,
                    entrepreneurship,
                    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&q=80",
                    LocalDate.now().plusDays(30),
                    "10:00 AM",
                    "Convention Center & Grand Auditorium",
                    300,
                    LocalDate.now().plusDays(24),
                    "Open to all departments and prospective student founders",
                    "Business formal or smart casual attire. Pre-registration required for angel investor pitch tracks."
            ));

            Event e3 = eventRepository.save(new Event(
                    "AI Innovation Workshop",
                    "Hands-on deep learning bootcamp covering LLM fine-tuning, retrieval-augmented generation (RAG), and deploying autonomous agent systems on modern cloud platforms.",
                    robotics,
                    workshops,
                    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=80",
                    LocalDate.now().plusDays(15),
                    "02:00 PM",
                    "Seminar Hall B, Block 3",
                    80,
                    LocalDate.now().plusDays(12),
                    "Students with foundational knowledge of Python and data structures",
                    "Individual participation. Free cloud GPU credits provisioned for hands-on exercises."
            ));

            Event e4 = eventRepository.save(new Event(
                    "Campus Premier League",
                    "The most anticipated inter-departmental cricket tournament of the year. Cheer for your branch, experience electrifying matches, food stalls, and music.",
                    sports,
                    sportsCat,
                    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&q=80",
                    LocalDate.now().plusDays(40),
                    "08:30 AM",
                    "University Central Sports Ground",
                    500,
                    LocalDate.now().plusDays(35),
                    "All enrolled undergraduate and postgraduate students",
                    "Department athletic jersey required. Standard ICC T20 modified league rules apply."
            ));

            Event e5 = eventRepository.save(new Event(
                    "Startup Ideathon",
                    "Pitch your disruptive product or social impact idea before seasoned venture investors, faculty mentors, and alumni founders. Win up to $5,000 in non-dilutive grant funding.",
                    ecell,
                    compCat != null ? compCat : entrepreneurship,
                    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1000&q=80",
                    LocalDate.now().plusDays(45),
                    "10:30 AM",
                    "Incubation Center, 2nd Floor",
                    60,
                    LocalDate.now().plusDays(38),
                    "Open to student teams with an early-stage prototype or business plan",
                    "Max 10 slides pitch deck. 5 minutes presentation followed by 3 minutes jury Q&A."
            ));

            Event e6 = eventRepository.save(new Event(
                    "Cultural Night 2026",
                    "An enchanting evening of live indie fusion bands, classical dance performances, stand-up comedy specials, and celebrity musical headliners.",
                    cultural,
                    culturalCat,
                    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&q=80",
                    LocalDate.now().plusDays(50),
                    "06:00 PM",
                    "Open Air Theatre (OAT)",
                    800,
                    LocalDate.now().plusDays(44),
                    "All university students, faculty, and alumni",
                    "Digital QR event pass mandatory at gate turnstiles for entry. University ID card verification required."
            ));

            logger.info("Initialized default sample events.");

            // 5. Seed initial registrations
            Registration r1 = registrationRepository.save(new Registration(
                    "CE-2026-0001-A1B2C3D4",
                    e1,
                    student,
                    "CEPASS-CODESPRINT2026-AARAV1045",
                    RegistrationStatus.CONFIRMED
            ));

            Registration r2 = registrationRepository.save(new Registration(
                    "CE-2026-0002-E5F6G7H8",
                    e2,
                    student,
                    "CEPASS-ESUMMIT2026-AARAV1045",
                    RegistrationStatus.CONFIRMED
            ));

            Registration r3 = registrationRepository.save(new Registration(
                    "CE-2026-0003-I9J0K1L2",
                    e3,
                    student,
                    "CEPASS-AIWORKSHOP-AARAV1045",
                    RegistrationStatus.ATTENDED
            ));

            registrationRepository.save(new Registration(
                    "CE-2026-0001-M3N4O5P6",
                    e1,
                    student2,
                    "CEPASS-CODESPRINT2026-PRIYA2014",
                    RegistrationStatus.CONFIRMED
            ));

            // 6. Seed initial attendance record
            attendanceRepository.save(new Attendance(
                    r3,
                    e3,
                    student,
                    organizer,
                    "QR_SCAN",
                    "Checked in on time at Seminar Hall B turnstile"
            ));

            logger.info("Initialized default registrations and attendance.");
        }

        logger.info("Campus Events backend initialization complete.");
    }
}
