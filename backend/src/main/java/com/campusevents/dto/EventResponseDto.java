package com.campusevents.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EventResponseDto {
    private Long id;
    private String title;
    private String description;
    private Long clubId;
    private String clubName;
    private String clubLogoUrl;
    private Long categoryId;
    private String categoryName;
    private String bannerUrl;
    private LocalDate eventDate;
    private String eventTime;
    private String venue;
    private Integer maxCapacity;
    private LocalDate registrationDeadline;
    private String eligibility;
    private String rules;
    private Boolean isPublished;
    private Boolean isCancelled;
    private Long totalRegistrations;
    private Integer availableSeats;
    private Boolean isRegisteredByCurrentUser = false;
    private Boolean isDeadlinePassed = false;
    private Boolean isCapacityFull = false;
    private LocalDateTime createdAt;

    public EventResponseDto() {
    }

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

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public void setClubName(String clubName) {
        this.clubName = clubName;
    }

    public String getClubLogoUrl() {
        return clubLogoUrl;
    }

    public void setClubLogoUrl(String clubLogoUrl) {
        this.clubLogoUrl = clubLogoUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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
        return isPublished;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    public Boolean getIsCancelled() {
        return isCancelled;
    }

    public void setIsCancelled(Boolean isCancelled) {
        this.isCancelled = isCancelled;
    }

    public Long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(Long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public Boolean getIsRegisteredByCurrentUser() {
        return isRegisteredByCurrentUser;
    }

    public void setIsRegisteredByCurrentUser(Boolean registeredByCurrentUser) {
        isRegisteredByCurrentUser = registeredByCurrentUser;
    }

    public Boolean getIsDeadlinePassed() {
        return isDeadlinePassed;
    }

    public void setIsDeadlinePassed(Boolean deadlinePassed) {
        isDeadlinePassed = deadlinePassed;
    }

    public Boolean getIsCapacityFull() {
        return isCapacityFull;
    }

    public void setIsCapacityFull(Boolean capacityFull) {
        isCapacityFull = capacityFull;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
