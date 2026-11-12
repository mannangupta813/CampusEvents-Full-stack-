package com.campusevents;

import com.campusevents.dto.AttendanceCheckInDto;
import com.campusevents.dto.AttendanceResponseDto;
import com.campusevents.model.*;
import com.campusevents.repository.AttendanceRepository;
import com.campusevents.repository.EventRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.service.AttendanceService;
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
public class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private User organizer;
    private User student;
    private Event event;
    private Registration registration;

    @BeforeEach
    void setUp() {
        organizer = new User("Organizer Name", "org@college.edu", "pass", "ORG-01", "IT", 3, Role.ROLE_ORGANIZER, "12345");
        organizer.setId(2L);

        student = new User("Student Name", "student@college.edu", "pass", "21BCS01", "CSE", 3, Role.ROLE_STUDENT, "67890");
        student.setId(5L);

        event = new Event("Hackathon 2026", "Desc", null, null, null, LocalDate.now().plusDays(2), "09:00 AM", "Lab 1", 100, LocalDate.now().plusDays(1), "All", "Rules");
        event.setId(10L);

        registration = new Registration("CE-2026-0010-ABCD", event, student, "VALID-QR-TOKEN-123", RegistrationStatus.CONFIRMED);
        registration.setId(50L);
    }

    @Test
    @DisplayName("Should successfully mark attendance upon valid QR scan")
    void testSuccessfulQrCheckIn() {
        AttendanceCheckInDto dto = new AttendanceCheckInDto();
        dto.setQrToken("VALID-QR-TOKEN-123");
        dto.setEventId(10L);
        dto.setCheckinMethod("QR_SCAN");

        when(registrationRepository.findByQrToken("VALID-QR-TOKEN-123")).thenReturn(Optional.of(registration));
        when(attendanceRepository.existsByRegistrationId(50L)).thenReturn(false);

        Attendance savedAttendance = new Attendance(registration, event, student, organizer, "QR_SCAN", "Checked in");
        savedAttendance.setId(1L);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(savedAttendance);

        AttendanceResponseDto response = attendanceService.checkIn(dto, organizer);

        assertNotNull(response);
        assertEquals("CE-2026-0010-ABCD", response.getRegistrationNumber());
        assertEquals("QR_SCAN", response.getCheckinMethod());
        assertEquals(RegistrationStatus.ATTENDED, registration.getStatus());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
        verify(registrationRepository, times(1)).save(registration);
    }

    @Test
    @DisplayName("Should prevent duplicate attendance check-in")
    void testPreventDuplicateCheckIn() {
        AttendanceCheckInDto dto = new AttendanceCheckInDto();
        dto.setQrToken("VALID-QR-TOKEN-123");
        dto.setEventId(10L);

        when(registrationRepository.findByQrToken("VALID-QR-TOKEN-123")).thenReturn(Optional.of(registration));
        when(attendanceRepository.existsByRegistrationId(50L)).thenReturn(true);
        when(attendanceRepository.findByRegistrationId(50L)).thenReturn(Optional.of(new Attendance(registration, event, student, organizer, "QR_SCAN", null)));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            attendanceService.checkIn(dto, organizer);
        });

        assertTrue(exception.getMessage().contains("Duplicate Check-in Alert"));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Should reject QR scan when event does not match")
    void testEventMismatchCheckIn() {
        AttendanceCheckInDto dto = new AttendanceCheckInDto();
        dto.setQrToken("VALID-QR-TOKEN-123");
        dto.setEventId(999L); // Wrong event ID!

        when(registrationRepository.findByQrToken("VALID-QR-TOKEN-123")).thenReturn(Optional.of(registration));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            attendanceService.checkIn(dto, organizer);
        });

        assertTrue(exception.getMessage().contains("belongs to another event"));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }
}
