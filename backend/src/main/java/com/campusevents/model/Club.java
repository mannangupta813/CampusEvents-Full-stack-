package com.campusevents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "clubs", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 60)
    private String category;

    @Size(max = 120)
    private String email;

    @Size(max = 255)
    @Column(name = "logo_url")
    private String logoUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_user_id")
    private User leadUser;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Club() {
    }

    public Club(String name, String description, String category, String email, String logoUrl, User leadUser) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.email = email;
        this.logoUrl = logoUrl;
        this.leadUser = leadUser;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public User getLeadUser() {
        return leadUser;
    }

    public void setLeadUser(User leadUser) {
        this.leadUser = leadUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
