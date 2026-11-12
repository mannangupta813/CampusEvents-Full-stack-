package com.campusevents;

import com.campusevents.dto.RegistrationResponseDto;
import com.campusevents.model.*;
import com.campusevents.repository.AttendanceRepository;
import com.campusevents.repository.EventRepository;
import com.campusevents.repository.NotificationRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private RegistrationService registrationService;

    private User student;
    private Event openEvent;
    private Club club;
    private Category category;

    @BeforeEach
    void setUp() {
        student = new User("Alice Smith", "alice@college.edu", "pass", "22BCS101", "CSE", 2, Role.ROLE_STUDENT, "9876543210");
        student.setId(5L);

        club = new Club("Tech Club", "Tech events", "Technical", "tech@college.edu", null, null);
        club.setId(1L);

        category = new Category("Technical", "Tech category", "cpu");
        category.setId(1L);

        openEvent = new Event("Tech Fest 2026", "Big fest", club, category, "banner.png",
                LocalDate.now().plusDays(10), "10:00 AM", "Auditorium", 100,
                LocalDate.now().plusDays(5), "All Students", "Rules");
        openEvent.setId(20L);
    }

    @Test
    @DisplayName("Should successfully register student for an open event")
    void testSuccessfulEventRegistration() {
        when(eventRepository.findById(20L)).thenReturn(Optional.of(openEvent));
        when(registrationRepository.existsByEventIdAndUserId(20L, 5L)).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatus(20L, RegistrationStatus.CONFIRMED)).thenReturn(10L);
        when(registrationRepository.countByEventIdAndStatus(20L, RegistrationStatus.ATTENDED)).thenReturn(0L);

        Registration savedReg = new Registration("CE-2026-0020-ABCD", openEvent, student, "TOKEN-12345", RegistrationStatus.CONFIRMED);
        savedReg.setId(100L);
        when(registrationRepository.save(any(Registration.class))).thenReturn(savedReg);

        RegistrationResponseDto response = registrationService.registerForEvent(20L, student);

        assertNotNull(response);
        assertEquals("CE-2026-0020-ABCD", response.getRegistrationNumber());
        assertEquals("TOKEN-12345", response.getQrToken());
        assertEquals(RegistrationStatus.CONFIRMED, response.getStatus());
        verify(registrationRepository, times(1)).save(any(Registration.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should reject duplicate registration for the same event")
    void testPreventDuplicateRegistration() {
        when(eventRepository.findById(20L)).thenReturn(Optional.of(openEvent));
        when(registrationRepository.existsByEventIdAndUserId(20L, 5L)).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            registrationService.registerForEvent(20L, student);
        });

        assertTrue(exception.getMessage().contains("already registered"));
        verify(registrationRepository, never()).save(any(Registration.class));
    }

    @Test
    @DisplayName("Should reject registration when event capacity is full")
    void testPreventRegistrationWhenCapacityFull() {
        openEvent.setMaxCapacity(50);
        when(eventRepository.findById(20L)).thenReturn(Optional.of(openEvent));
        when(registrationRepository.existsByEventIdAndUserId(20L, 5L)).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatus(20L, RegistrationStatus.CONFIRMED)).thenReturn(50L);
        when(registrationRepository.countByEventIdAndStatus(20L, RegistrationStatus.ATTENDED)).thenReturn(0L);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            registrationService.registerForEvent(20L, student);
        });

        assertTrue(exception.getMessage().contains("maximum participant capacity"));
        verify(registrationRepository, never()).save(any(Registration.class));
    }

    @Test
    @DisplayName("Should reject registration after deadline has passed")
    void testPreventRegistrationAfterDeadline() {
        openEvent.setRegistrationDeadline(LocalDate.now().minusDays(1));
        when(eventRepository.findById(20L)).thenReturn(Optional.of(openEvent));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            registrationService.registerForEvent(20L, student);
        });

        assertTrue(exception.getMessage().contains("Registration deadline"));
        verify(registrationRepository, never()).save(any(Registration.class));
    }
}
