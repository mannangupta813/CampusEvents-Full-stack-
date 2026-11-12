package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.DashboardStatsDto;
import com.campusevents.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getPublicStats() {
        DashboardStatsDto stats = statsService.getDashboardStats(null);
        return ResponseEntity.ok(ApiResponse.ok("Public platform statistics", stats));
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getOrganizerStats(
            @RequestParam(required = false) Long clubId
    ) {
        DashboardStatsDto stats = statsService.getDashboardStats(clubId);
        return ResponseEntity.ok(ApiResponse.ok("Organizer dashboard statistics", stats));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getAdminStats() {
        DashboardStatsDto stats = statsService.getDashboardStats(null);
        return ResponseEntity.ok(ApiResponse.ok("Admin platform statistics", stats));
    }
}
