package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.model.Club;
import com.campusevents.model.Role;
import com.campusevents.model.User;
import com.campusevents.repository.ClubRepository;
import com.campusevents.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(@RequestParam(required = false) String role) {
        List<User> list;
        if (role != null && !role.isBlank()) {
            Role r = Role.fromString(role);
            list = userRepository.findByRole(r);
        } else {
            list = userRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", list));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));

        user.setRole(Role.fromString(role));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", saved));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully"));
    }

    @DeleteMapping("/clubs/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteClub(@PathVariable Long id) {
        clubRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Club deleted successfully"));
    }
}
