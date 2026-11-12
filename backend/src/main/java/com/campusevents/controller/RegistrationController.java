package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.RegistrationResponseDto;
import com.campusevents.model.User;
import com.campusevents.service.AuthService;
import com.campusevents.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AuthService authService;

    @PostMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<RegistrationResponseDto>> registerForEvent(@PathVariable Long eventId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RegistrationResponseDto response = registrationService.registerForEvent(eventId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Event registration confirmed! Your QR pass is ready.", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationResponseDto>> cancelRegistration(@PathVariable Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RegistrationResponseDto response = registrationService.cancelRegistration(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Registration cancelled successfully.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RegistrationResponseDto>>> getMyRegistrations() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<RegistrationResponseDto> list = registrationService.getStudentRegistrations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("My registrations retrieved", list));
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RegistrationResponseDto>>> getEventRegistrations(@PathVariable Long eventId) {
        List<RegistrationResponseDto> list = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(ApiResponse.ok("Event participant registrations retrieved", list));
    }

    @GetMapping("/token/{qrToken}")
    public ResponseEntity<ApiResponse<RegistrationResponseDto>> getRegistrationByQrToken(@PathVariable String qrToken) {
        RegistrationResponseDto dto = registrationService.getRegistrationByQrToken(qrToken);
        return ResponseEntity.ok(ApiResponse.ok("Registration details retrieved", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationResponseDto>> getRegistrationById(@PathVariable Long id) {
        RegistrationResponseDto dto = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(ApiResponse.ok("Registration pass retrieved", dto));
    }
}
