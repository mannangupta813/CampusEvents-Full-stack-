package com.campusevents.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalStudents;
    private long totalClubs;
    private long totalEvents;
    private long totalRegistrations;
    private long totalAttendance;
    private long upcomingEvents;
    private long activeCategories;

    // Chart analytics
    private List<Map<String, Object>> registrationsByEvent;
    private List<Map<String, Object>> attendanceByEvent;
    private List<Map<String, Object>> monthlyEvents;
    private List<Map<String, Object>> eventsByCategory;

    public DashboardStatsDto() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalClubs() {
        return totalClubs;
    }

    public void setTotalClubs(long totalClubs) {
        this.totalClubs = totalClubs;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public long getTotalAttendance() {
        return totalAttendance;
    }

    public void setTotalAttendance(long totalAttendance) {
        this.totalAttendance = totalAttendance;
    }

    public long getUpcomingEvents() {
        return upcomingEvents;
    }

    public void setUpcomingEvents(long upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }

    public long getActiveCategories() {
        return activeCategories;
    }

    public void setActiveCategories(long activeCategories) {
        this.activeCategories = activeCategories;
    }

    public List<Map<String, Object>> getRegistrationsByEvent() {
        return registrationsByEvent;
    }

    public void setRegistrationsByEvent(List<Map<String, Object>> registrationsByEvent) {
        this.registrationsByEvent = registrationsByEvent;
    }

    public List<Map<String, Object>> getAttendanceByEvent() {
        return attendanceByEvent;
    }

    public void setAttendanceByEvent(List<Map<String, Object>> attendanceByEvent) {
        this.attendanceByEvent = attendanceByEvent;
    }

    public List<Map<String, Object>> getMonthlyEvents() {
        return monthlyEvents;
    }

    public void setMonthlyEvents(List<Map<String, Object>> monthlyEvents) {
        this.monthlyEvents = monthlyEvents;
    }

    public List<Map<String, Object>> getEventsByCategory() {
        return eventsByCategory;
    }

    public void setEventsByCategory(List<Map<String, Object>> eventsByCategory) {
        this.eventsByCategory = eventsByCategory;
    }
}
