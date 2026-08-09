package com.healthtrack.mobile.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static SessionManager instance;
    private final SharedPreferences prefs;
    private static final String PREF_NAME = "HealthTrackSession";

    private SessionManager(Context ctx) {
        prefs = ctx.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized SessionManager getInstance(Context ctx) {
        if (instance == null) instance = new SessionManager(ctx.getApplicationContext());
        return instance;
    }

    public void saveSession(String token, String email, String firstName, String lastName, String role, int userId) {
        prefs.edit()
            .putString("token", token)
            .putString("email", email)
            .putString("firstName", firstName)
            .putString("lastName", lastName)
            .putString("role", role)
            .putInt("userId", userId)
            .putBoolean("loggedIn", true)
            .apply();
    }

    public void clearSession() { prefs.edit().clear().apply(); }

    public String  getToken()     { return prefs.getString("token", ""); }
    public String  getEmail()     { return prefs.getString("email", ""); }
    public String  getFirstName() { return prefs.getString("firstName", ""); }
    public String  getLastName()  { return prefs.getString("lastName", ""); }
    public String  getRole()      { return prefs.getString("role", ""); }
    public int     getUserId()    { return prefs.getInt("userId", 0); }
    public boolean isLoggedIn()   { return prefs.getBoolean("loggedIn", false); }
    public String  getFullName()  { return getFirstName() + " " + getLastName(); }
}
