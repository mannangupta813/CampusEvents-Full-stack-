package com.campusevents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = "registration_id")
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "checked_in_at", nullable = false)
    private LocalDateTime checkedInAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "checked_in_by")
    private User checkedInBy;

    @Size(max = 30)
    @Column(name = "checkin_method")
    private String checkinMethod = "QR_SCAN"; // QR_SCAN, MANUAL

    @Size(max = 255)
    private String remarks;

    public Attendance() {
    }

    public Attendance(Registration registration, Event event, User user, User checkedInBy, String checkinMethod, String remarks) {
        this.registration = registration;
        this.event = event;
        this.user = user;
        this.checkedInBy = checkedInBy;
        this.checkinMethod = checkinMethod != null ? checkinMethod : "QR_SCAN";
        this.remarks = remarks;
        this.checkedInAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
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

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public User getCheckedInBy() {
        return checkedInBy;
    }

    public void setCheckedInBy(User checkedInBy) {
        this.checkedInBy = checkedInBy;
    }

    public String getCheckinMethod() {
        return checkinMethod;
    }

    public void setCheckinMethod(String checkinMethod) {
        this.checkinMethod = checkinMethod;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
