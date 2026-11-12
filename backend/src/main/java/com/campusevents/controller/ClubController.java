package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.model.Club;
import com.campusevents.model.User;
import com.campusevents.service.AuthService;
import com.campusevents.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Club>>> getAllClubs() {
        List<Club> clubs = clubService.getAllClubs();
        return ResponseEntity.ok(ApiResponse.ok("Clubs retrieved", clubs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Club>> getClubById(@PathVariable Long id) {
        Club club = clubService.getClubById(id);
        return ResponseEntity.ok(ApiResponse.ok("Club retrieved", club));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Club>> createClub(@Valid @RequestBody Club club) {
        User user = authService.getCurrentAuthenticatedUser();
        Club created = clubService.createClub(club, user);
        return ResponseEntity.ok(ApiResponse.ok("Club created successfully", created));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Club>>> getMyClubs() {
        User user = authService.getCurrentAuthenticatedUser();
        List<Club> clubs = clubService.getClubsByLeadUser(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Organizer clubs retrieved", clubs));
    }
}
