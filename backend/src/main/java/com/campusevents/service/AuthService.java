package com.campusevents.service;

import com.campusevents.dto.AuthRequest;
import com.campusevents.dto.AuthResponse;
import com.campusevents.dto.RegisterRequest;
import com.campusevents.model.Role;
import com.campusevents.model.User;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.JwtUtils;
import com.campusevents.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        if (request.getRollNo() != null && !request.getRollNo().isBlank()) {
            if (userRepository.existsByRollNo(request.getRollNo())) {
                throw new IllegalArgumentException("Registration/Roll number already exists: " + request.getRollNo());
            }
        }

        Role role = Role.ROLE_STUDENT;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            role = Role.fromString(request.getRole());
        }

        User user = new User(
                request.getFullName(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getRollNo(),
                request.getDepartment(),
                request.getYearOfStudy(),
                role,
                request.getPhone()
        );

        userRepository.save(user);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getUsername(),
                user.getRole().name(),
                userDetails.getRollNo(),
                userDetails.getDepartment()
        );
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getUsername(),
                user.getRole().name(),
                userDetails.getRollNo(),
                userDetails.getDepartment()
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found in session");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
