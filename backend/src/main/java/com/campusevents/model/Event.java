package com.campusevents.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "banner_url", length = 255)
    private String bannerUrl;

    @NotNull
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @NotBlank
    @Column(name = "event_time", nullable = false, length = 20)
    private String eventTime;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String venue;

    @NotNull
    @Min(1)
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity = 100;

    @NotNull
    @Column(name = "registration_deadline", nullable = false)
    private LocalDate registrationDeadline;

    @Column(length = 200)
    private String eligibility = "All college students";

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(name = "is_published")
    private Boolean isPublished = true;

    @Column(name = "is_cancelled")
    private Boolean isCancelled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Event() {
    }

    public Event(String title, String description, Club club, Category category, String bannerUrl,
                 LocalDate eventDate, String eventTime, String venue, Integer maxCapacity,
                 LocalDate registrationDeadline, String eligibility, String rules) {
        this.title = title;
        this.description = description;
        this.club = club;
        this.category = category;
        this.bannerUrl = bannerUrl;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.venue = venue;
        this.maxCapacity = maxCapacity;
        this.registrationDeadline = registrationDeadline;
        this.eligibility = eligibility;
        this.rules = rules;
        this.isPublished = true;
        this.isCancelled = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Club getClub() {
        return club;
    }

    public void setClub(Club club) {
        this.club = club;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventTime() {
        return eventTime;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public LocalDate getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDate registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public String getEligibility() {
        return eligibility;
    }

    public void setEligibility(String eligibility) {
        this.eligibility = eligibility;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public Boolean getIsPublished() {
        return isPublished != null ? isPublished : true;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    public Boolean getIsCancelled() {
        return isCancelled != null ? isCancelled : false;
    }

    public void setIsCancelled(Boolean isCancelled) {
        this.isCancelled = isCancelled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
