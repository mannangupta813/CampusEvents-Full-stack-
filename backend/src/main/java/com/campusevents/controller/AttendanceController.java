package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.AttendanceCheckInDto;
import com.campusevents.dto.AttendanceResponseDto;
import com.campusevents.model.User;
import com.campusevents.service.AttendanceService;
import com.campusevents.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AuthService authService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> checkIn(
            @Valid @RequestBody AttendanceCheckInDto dto
    ) {
        User organizer = authService.getCurrentAuthenticatedUser();
        AttendanceResponseDto response = attendanceService.checkIn(dto, organizer);
        return ResponseEntity.ok(ApiResponse.ok("Attendance checked in successfully!", response));
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDto>>> getEventAttendance(
            @PathVariable Long eventId
    ) {
        List<AttendanceResponseDto> list = attendanceService.getEventAttendance(eventId);
        return ResponseEntity.ok(ApiResponse.ok("Event attendance list retrieved", list));
    }

    @GetMapping("/events/{eventId}/export-csv")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<byte[]> exportCsv(@PathVariable Long eventId) {
        String csvData = attendanceService.exportAttendanceCsv(eventId);
        byte[] bytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance-event-" + eventId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
