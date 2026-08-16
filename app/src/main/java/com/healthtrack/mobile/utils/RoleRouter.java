package com.healthtrack.mobile.utils;

import com.healthtrack.mobile.activities.AdminDashboardActivity;
import com.healthtrack.mobile.activities.DoctorDashboardActivity;
import com.healthtrack.mobile.activities.MainActivity;

/**
 * Resolves the correct dashboard Activity for a given user role,
 * mirroring the role-based navigation of the Angular frontend
 * (Admin / Doctor / Patient each get their own space).
 */
public class RoleRouter {
    public static Class<?> dashboardFor(String role) {
        if (role == null) return MainActivity.class;
        switch (role) {
            case "ADMIN":  return AdminDashboardActivity.class;
            case "DOCTOR": return DoctorDashboardActivity.class;
            default:       return MainActivity.class; // PATIENT, EMERGENCY
        }
    }
}
