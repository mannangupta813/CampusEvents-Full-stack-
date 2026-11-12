package com.campusevents.service;

import com.campusevents.dto.RegistrationResponseDto;
import com.campusevents.model.*;
import com.campusevents.repository.AttendanceRepository;
import com.campusevents.repository.EventRepository;
import com.campusevents.repository.NotificationRepository;
import com.campusevents.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public RegistrationResponseDto registerForEvent(Long eventId, User currentUser) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        if (Boolean.TRUE.equals(event.getIsCancelled())) {
            throw new IllegalStateException("Registration is closed because this event has been cancelled.");
        }

        if (Boolean.FALSE.equals(event.getIsPublished())) {
            throw new IllegalStateException("This event is not published for registration.");
        }

        // Validation: Deadline passed
        if (event.getRegistrationDeadline().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Registration deadline (" + event.getRegistrationDeadline() + ") has already passed.");
        }

        // Validation: Duplicate registration
        if (registrationRepository.existsByEventIdAndUserId(eventId, currentUser.getId())) {
            throw new IllegalStateException("You are already registered for this event.");
        }

        // Validation: Capacity full
        long activeRegistrations = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)
                + registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.ATTENDED);

        if (activeRegistrations >= event.getMaxCapacity()) {
            throw new IllegalStateException("Event has reached maximum participant capacity (" + event.getMaxCapacity() + ").");
        }

        // Generate unique registration number & secure QR token
        String shortId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String regNumber = "CE-" + LocalDate.now().getYear() + "-" + String.format("%04d", event.getId()) + "-" + shortId;
        String qrToken = "CEPASS-" + UUID.randomUUID().toString().replace("-", "");

        Registration registration = new Registration(
                regNumber,
                event,
                currentUser,
                qrToken,
                RegistrationStatus.CONFIRMED
        );

        Registration saved = registrationRepository.save(registration);

        // Create student notification
        Notification notification = new Notification(
                currentUser,
                "Registration Confirmed: " + event.getTitle(),
                "You have successfully registered for " + event.getTitle() + " on " + event.getEventDate() + " at " + event.getVenue() + ". Your pass ID is " + regNumber + ".",
                "SUCCESS"
        );
        notificationRepository.save(notification);

        return mapToResponseDto(saved);
    }

    @Transactional
    public RegistrationResponseDto cancelRegistration(Long registrationId, User currentUser) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found with ID: " + registrationId));

        // Only owner or admin can cancel
        if (currentUser.getRole() != Role.ROLE_ADMIN && !registration.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized: You can only cancel your own registrations.");
        }

        if (registration.getStatus() == RegistrationStatus.ATTENDED) {
            throw new IllegalStateException("Cannot cancel registration for an event you have already attended.");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        Registration saved = registrationRepository.save(registration);

        Notification notification = new Notification(
                registration.getUser(),
                "Registration Cancelled: " + registration.getEvent().getTitle(),
                "Your registration for " + registration.getEvent().getTitle() + " has been cancelled.",
                "WARNING"
        );
        notificationRepository.save(notification);

        return mapToResponseDto(saved);
    }

    public List<RegistrationResponseDto> getStudentRegistrations(Long studentId) {
        return registrationRepository.findByUserIdOrderByRegisteredAtDesc(studentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<RegistrationResponseDto> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public RegistrationResponseDto getRegistrationByQrToken(String qrToken) {
        Registration registration = registrationRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new IllegalArgumentException("No registration found matching the scanned QR code token."));

        return mapToResponseDto(registration);
    }

    public RegistrationResponseDto getRegistrationById(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found with ID: " + id));

        return mapToResponseDto(registration);
    }

    public RegistrationResponseDto mapToResponseDto(Registration reg) {
        RegistrationResponseDto dto = new RegistrationResponseDto();
        dto.setId(reg.getId());
        dto.setRegistrationNumber(reg.getRegistrationNumber());
        dto.setQrToken(reg.getQrToken());
        dto.setStatus(reg.getStatus());
        dto.setRegisteredAt(reg.getRegisteredAt());

        if (reg.getEvent() != null) {
            dto.setEventId(reg.getEvent().getId());
            dto.setEventTitle(reg.getEvent().getTitle());
            dto.setEventDate(reg.getEvent().getEventDate());
            dto.setEventTime(reg.getEvent().getEventTime());
            dto.setVenue(reg.getEvent().getVenue());
            dto.setBannerUrl(reg.getEvent().getBannerUrl());
            if (reg.getEvent().getCategory() != null) {
                dto.setCategoryName(reg.getEvent().getCategory().getName());
            }
            if (reg.getEvent().getClub() != null) {
                dto.setClubName(reg.getEvent().getClub().getName());
            }
        }

        if (reg.getUser() != null) {
            dto.setStudentId(reg.getUser().getId());
            dto.setStudentName(reg.getUser().getFullName());
            dto.setStudentEmail(reg.getUser().getEmail());
            dto.setStudentRollNo(reg.getUser().getRollNo());
            dto.setStudentDepartment(reg.getUser().getDepartment());
        }

        attendanceRepository.findByRegistrationId(reg.getId()).ifPresent(att -> {
            dto.setIsAttended(true);
            dto.setCheckedInAt(att.getCheckedInAt());
            dto.setCheckinMethod(att.getCheckinMethod());
        });

        return dto;
    }
}
