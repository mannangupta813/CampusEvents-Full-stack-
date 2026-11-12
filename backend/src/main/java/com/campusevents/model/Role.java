package com.campusevents.model;

public enum Role {
    ROLE_STUDENT,
    ROLE_ORGANIZER,
    ROLE_ADMIN;

    public static Role fromString(String roleStr) {
        if (roleStr == null) return ROLE_STUDENT;
        String clean = roleStr.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        for (Role r : Role.values()) {
            if (r.name().equalsIgnoreCase(clean)) {
                return r;
            }
        }
        return ROLE_STUDENT;
    }
}
