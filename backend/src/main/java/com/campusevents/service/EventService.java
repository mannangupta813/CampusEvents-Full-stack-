package com.campusevents.service;

import com.campusevents.dto.EventRequestDto;
import com.campusevents.dto.EventResponseDto;
import com.campusevents.model.*;
import com.campusevents.repository.CategoryRepository;
import com.campusevents.repository.ClubRepository;
import com.campusevents.repository.EventRepository;
import com.campusevents.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public List<EventResponseDto> searchEvents(Long categoryId, Long clubId, String query, Boolean upcomingOnly, Long currentUserId) {
        boolean upcoming = upcomingOnly != null ? upcomingOnly : false;
        List<Event> events = eventRepository.searchEvents(
                categoryId,
                clubId,
                (query != null && !query.isBlank()) ? query.trim() : null,
                upcoming,
                LocalDate.now()
        );

        return events.stream()
                .map(e -> mapToResponseDto(e, currentUserId))
                .collect(Collectors.toList());
    }

    public EventResponseDto getEventById(Long eventId, Long currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        return mapToResponseDto(event, currentUserId);
    }

    @Transactional
    public EventResponseDto createEvent(EventRequestDto dto, User currentUser) {
        Club club = clubRepository.findById(dto.getClubId())
                .orElseThrow(() -> new IllegalArgumentException("Club not found with ID: " + dto.getClubId()));

        // Role authorization check: Admin can create for any club, Organizer only for their assigned club
        validateClubAccess(club, currentUser);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + dto.getCategoryId()));

        Event event = new Event(
                dto.getTitle(),
                dto.getDescription(),
                club,
                category,
                dto.getBannerUrl() != null && !dto.getBannerUrl().isBlank()
                        ? dto.getBannerUrl()
                        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&q=80",
                dto.getEventDate(),
                dto.getEventTime(),
                dto.getVenue(),
                dto.getMaxCapacity(),
                dto.getRegistrationDeadline(),
                dto.getEligibility() != null ? dto.getEligibility() : "All college students",
                dto.getRules()
        );

        if (dto.getIsPublished() != null) event.setIsPublished(dto.getIsPublished());
        if (dto.getIsCancelled() != null) event.setIsCancelled(dto.getIsCancelled());

        Event saved = eventRepository.save(event);
        return mapToResponseDto(saved, currentUser.getId());
    }

    @Transactional
    public EventResponseDto updateEvent(Long eventId, EventRequestDto dto, User currentUser) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        validateClubAccess(event.getClub(), currentUser);

        if (dto.getTitle() != null) event.setTitle(dto.getTitle());
        if (dto.getDescription() != null) event.setDescription(dto.getDescription());
        if (dto.getBannerUrl() != null) event.setBannerUrl(dto.getBannerUrl());
        if (dto.getEventDate() != null) event.setEventDate(dto.getEventDate());
        if (dto.getEventTime() != null) event.setEventTime(dto.getEventTime());
        if (dto.getVenue() != null) event.setVenue(dto.getVenue());
        if (dto.getMaxCapacity() != null) event.setMaxCapacity(dto.getMaxCapacity());
        if (dto.getRegistrationDeadline() != null) event.setRegistrationDeadline(dto.getRegistrationDeadline());
        if (dto.getEligibility() != null) event.setEligibility(dto.getEligibility());
        if (dto.getRules() != null) event.setRules(dto.getRules());
        if (dto.getIsPublished() != null) event.setIsPublished(dto.getIsPublished());
        if (dto.getIsCancelled() != null) event.setIsCancelled(dto.getIsCancelled());

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(event.getCategory().getId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + dto.getCategoryId()));
            event.setCategory(category);
        }

        Event updated = eventRepository.save(event);
        return mapToResponseDto(updated, currentUser.getId());
    }

    @Transactional
    public void deleteEvent(Long eventId, User currentUser) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        validateClubAccess(event.getClub(), currentUser);
        eventRepository.delete(event);
    }

    public List<EventResponseDto> getEventsByClub(Long clubId, Long currentUserId) {
        return eventRepository.findByClubId(clubId).stream()
                .map(e -> mapToResponseDto(e, currentUserId))
                .collect(Collectors.toList());
    }

    private void validateClubAccess(Club club, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return; // Admin has full access
        }
        if (user.getRole() == Role.ROLE_ORGANIZER) {
            if (club.getLeadUser() != null && club.getLeadUser().getId().equals(user.getId())) {
                return; // Organizer owns this club
            }
        }
        throw new SecurityException("Unauthorized: You do not have permission to manage events for club: " + club.getName());
    }

    public EventResponseDto mapToResponseDto(Event event, Long currentUserId) {
        EventResponseDto dto = new EventResponseDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setBannerUrl(event.getBannerUrl());
        dto.setEventDate(event.getEventDate());
        dto.setEventTime(event.getEventTime());
        dto.setVenue(event.getVenue());
        dto.setMaxCapacity(event.getMaxCapacity());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setEligibility(event.getEligibility());
        dto.setRules(event.getRules());
        dto.setIsPublished(event.getIsPublished());
        dto.setIsCancelled(event.getIsCancelled());
        dto.setCreatedAt(event.getCreatedAt());

        if (event.getClub() != null) {
            dto.setClubId(event.getClub().getId());
            dto.setClubName(event.getClub().getName());
            dto.setClubLogoUrl(event.getClub().getLogoUrl());
        }

        if (event.getCategory() != null) {
            dto.setCategoryId(event.getCategory().getId());
            dto.setCategoryName(event.getCategory().getName());
        }

        long activeRegistrations = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CONFIRMED)
                + registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.ATTENDED);
        dto.setTotalRegistrations(activeRegistrations);

        int available = Math.max(0, event.getMaxCapacity() - (int) activeRegistrations);
        dto.setAvailableSeats(available);
        dto.setIsCapacityFull(available <= 0);

        boolean deadlinePassed = event.getRegistrationDeadline().isBefore(LocalDate.now());
        dto.setIsDeadlinePassed(deadlinePassed);

        if (currentUserId != null) {
            boolean isReg = registrationRepository.existsByEventIdAndUserId(event.getId(), currentUserId);
            dto.setIsRegisteredByCurrentUser(isReg);
        }

        return dto;
    }
}
