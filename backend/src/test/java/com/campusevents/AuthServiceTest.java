package com.campusevents;

import com.campusevents.dto.AuthRequest;
import com.campusevents.dto.AuthResponse;
import com.campusevents.dto.RegisterRequest;
import com.campusevents.model.Role;
import com.campusevents.model.User;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.JwtUtils;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User sampleStudent;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleStudent = new User("John Doe", "john@college.edu", "encodedPassword", "21BCS001", "CSE", 3, Role.ROLE_STUDENT, "1234567890");
        sampleStudent.setId(10L);

        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@college.edu");
        registerRequest.setPassword("Secret@123");
        registerRequest.setRollNo("21BCS001");
        registerRequest.setDepartment("CSE");
        registerRequest.setYearOfStudy(3);
    }

    @Test
    @DisplayName("Should successfully register a new student")
    void testSuccessfulRegistration() {
        when(userRepository.existsByEmail("john@college.edu")).thenReturn(false);
        when(userRepository.existsByRollNo("21BCS001")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleStudent);

        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = UserDetailsImpl.build(sampleStudent);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("john@college.edu", response.getEmail());
        assertEquals("ROLE_STUDENT", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void testDuplicateEmailRegistration() {
        when(userRepository.existsByEmail("john@college.edu")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });

        assertTrue(exception.getMessage().contains("Email is already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate roll number")
    void testDuplicateRollNoRegistration() {
        when(userRepository.existsByEmail("john@college.edu")).thenReturn(false);
        when(userRepository.existsByRollNo("21BCS001")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });

        assertTrue(exception.getMessage().contains("Roll number already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testSuccessfulLogin() {
        AuthRequest authReq = new AuthRequest("john@college.edu", "Secret@123");
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = UserDetailsImpl.build(sampleStudent);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(principal);
        when(userRepository.findByEmail("john@college.edu")).thenReturn(Optional.of(sampleStudent));
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(authReq);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("john@college.edu", response.getEmail());
    }

    @Test
    @DisplayName("Should fail login with invalid password")
    void testFailedLogin() {
        AuthRequest authReq = new AuthRequest("john@college.edu", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(authReq);
        });
    }
}
