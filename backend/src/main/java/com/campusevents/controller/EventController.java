package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.EventRequestDto;
import com.campusevents.dto.EventResponseDto;
import com.campusevents.model.User;
import com.campusevents.service.AuthService;
import com.campusevents.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AuthService authService;

    private Long tryGetCurrentUserId() {
        try {
            return authService.getCurrentAuthenticatedUser().getId();
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponseDto>>> getEvents(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean upcomingOnly
    ) {
        Long currentUserId = tryGetCurrentUserId();
        List<EventResponseDto> events = eventService.searchEvents(categoryId, clubId, search, upcomingOnly, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Events retrieved successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDto>> getEventById(@PathVariable Long id) {
        Long currentUserId = tryGetCurrentUserId();
        EventResponseDto event = eventService.getEventById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Event retrieved successfully", event));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EventResponseDto>> createEvent(@Valid @RequestBody EventRequestDto dto) {
        User user = authService.getCurrentAuthenticatedUser();
        EventResponseDto created = eventService.createEvent(dto, user);
        return ResponseEntity.ok(ApiResponse.ok("Event created successfully!", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EventResponseDto>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDto dto
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        EventResponseDto updated = eventService.updateEvent(id, dto, user);
        return ResponseEntity.ok(ApiResponse.ok("Event updated successfully!", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deleteEvent(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        eventService.deleteEvent(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully!"));
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<ApiResponse<List<EventResponseDto>>> getEventsByClub(@PathVariable Long clubId) {
        Long currentUserId = tryGetCurrentUserId();
        List<EventResponseDto> events = eventService.getEventsByClub(clubId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Club events retrieved", events));
    }
}
