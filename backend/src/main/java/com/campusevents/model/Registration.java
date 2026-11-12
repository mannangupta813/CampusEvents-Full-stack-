package com.campusevents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"event_id", "user_id"}),
        @UniqueConstraint(columnNames = "registration_number"),
        @UniqueConstraint(columnNames = "qr_token")
})
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 60)
    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 120)
    @Column(name = "qr_token", nullable = false, unique = true)
    private String qrToken;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private RegistrationStatus status = RegistrationStatus.CONFIRMED;

    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    public Registration() {
    }

    public Registration(String registrationNumber, Event event, User user, String qrToken, RegistrationStatus status) {
        this.registrationNumber = registrationNumber;
        this.event = event;
        this.user = user;
        this.qrToken = qrToken;
        this.status = status != null ? status : RegistrationStatus.CONFIRMED;
        this.registeredAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
}
