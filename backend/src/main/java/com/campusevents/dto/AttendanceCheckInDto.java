package com.campusevents.dto;

import jakarta.validation.constraints.NotNull;

public class AttendanceCheckInDto {

    private String qrToken;

    private Long registrationId;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    private String checkinMethod = "QR_SCAN"; // QR_SCAN or MANUAL

    private String remarks;

    public AttendanceCheckInDto() {
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
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
