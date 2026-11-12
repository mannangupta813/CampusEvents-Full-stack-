package com.campusevents.service;

import com.campusevents.dto.AttendanceCheckInDto;
import com.campusevents.dto.AttendanceResponseDto;
import com.campusevents.model.*;
import com.campusevents.repository.AttendanceRepository;
import com.campusevents.repository.EventRepository;
import com.campusevents.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public AttendanceResponseDto checkIn(AttendanceCheckInDto dto, User organizerUser) {
        Registration registration = null;

        if (dto.getQrToken() != null && !dto.getQrToken().isBlank()) {
            registration = registrationRepository.findByQrToken(dto.getQrToken().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid QR pass: No matching registration record found."));
        } else if (dto.getRegistrationId() != null) {
            registration = registrationRepository.findById(dto.getRegistrationId())
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found with ID: " + dto.getRegistrationId()));
        } else {
            throw new IllegalArgumentException("Either QR Token or Registration ID must be provided for check-in.");
        }

        // 1. Verify matching event
        if (dto.getEventId() != null && !registration.getEvent().getId().equals(dto.getEventId())) {
            throw new IllegalStateException("QR pass belongs to another event ('" +
                    registration.getEvent().getTitle() + "'), not this event.");
        }

        // 2. Verify registration status
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalStateException("Check-in rejected: This registration was previously CANCELLED by the student or administration.");
        }

        // 3. Prevent duplicate check-in
        if (attendanceRepository.existsByRegistrationId(registration.getId())) {
            Attendance existing = attendanceRepository.findByRegistrationId(registration.getId()).get();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            throw new IllegalStateException("Duplicate Check-in Alert: Participant " +
                    registration.getUser().getFullName() + " was already checked in at " +
                    existing.getCheckedInAt().format(fmt) + " via " + existing.getCheckinMethod() + ".");
        }

        // 4. Record attendance
        Attendance attendance = new Attendance(
                registration,
                registration.getEvent(),
                registration.getUser(),
                organizerUser,
                dto.getCheckinMethod() != null ? dto.getCheckinMethod() : "QR_SCAN",
                dto.getRemarks()
        );

        Attendance saved = attendanceRepository.save(attendance);

        // Update registration status to ATTENDED
        registration.setStatus(RegistrationStatus.ATTENDED);
        registrationRepository.save(registration);

        return mapToDto(saved);
    }

    public List<AttendanceResponseDto> getEventAttendance(Long eventId) {
        return attendanceRepository.findByEventIdOrderByCheckedInAtDesc(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public String exportAttendanceCsv(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        List<Attendance> attendances = attendanceRepository.findByEventIdOrderByCheckedInAtDesc(eventId);

        StringBuilder csv = new StringBuilder();
        csv.append("Campus Events - Attendance Report\n");
        csv.append("Event: ").append(event.getTitle()).append("\n");
        csv.append("Date: ").append(event.getEventDate()).append(" | Venue: ").append(event.getVenue()).append("\n");
        csv.append("Total Check-ins: ").append(attendances.size()).append("\n\n");

        csv.append("S.No,Roll No,Full Name,Email,Department,Registration ID,Checked-In At,Method,Verifier\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        int count = 1;
        for (Attendance a : attendances) {
            User u = a.getUser();
            Registration r = a.getRegistration();
            csv.append(count++).append(",")
                    .append(escapeCsv(u.getRollNo())).append(",")
                    .append(escapeCsv(u.getFullName())).append(",")
                    .append(escapeCsv(u.getEmail())).append(",")
                    .append(escapeCsv(u.getDepartment())).append(",")
                    .append(escapeCsv(r.getRegistrationNumber())).append(",")
                    .append(a.getCheckedInAt().format(dtf)).append(",")
                    .append(escapeCsv(a.getCheckinMethod())).append(",")
                    .append(escapeCsv(a.getCheckedInBy() != null ? a.getCheckedInBy().getFullName() : "System")).append("\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    public AttendanceResponseDto mapToDto(Attendance a) {
        AttendanceResponseDto dto = new AttendanceResponseDto();
        dto.setId(a.getId());
        dto.setRegistrationId(a.getRegistration().getId());
        dto.setRegistrationNumber(a.getRegistration().getRegistrationNumber());
        dto.setEventId(a.getEvent().getId());
        dto.setEventTitle(a.getEvent().getTitle());
        dto.setStudentId(a.getUser().getId());
        dto.setStudentName(a.getUser().getFullName());
        dto.setStudentRollNo(a.getUser().getRollNo());
        dto.setStudentDepartment(a.getUser().getDepartment());
        dto.setCheckinMethod(a.getCheckinMethod());
        dto.setCheckedInAt(a.getCheckedInAt());
        dto.setCheckedInByName(a.getCheckedInBy() != null ? a.getCheckedInBy().getFullName() : "Admin/Organizer");
        dto.setRemarks(a.getRemarks());
        return dto;
    }
}
