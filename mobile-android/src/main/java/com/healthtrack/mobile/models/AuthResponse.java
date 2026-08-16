package com.healthtrack.mobile.models;
public class AuthResponse {
    private String accessToken, refreshToken, email, firstName, lastName, role, message;
    private int userId;
    private boolean twoFactorRequired;
    public String getAccessToken()   { return accessToken; }
    public String getRefreshToken()  { return refreshToken; }
    public String getEmail()         { return email; }
    public String getFirstName()     { return firstName; }
    public String getLastName()      { return lastName; }
    public String getRole()          { return role; }
    public String getMessage()       { return message; }
    public int getUserId()           { return userId; }
    public boolean isTwoFactorRequired(){ return twoFactorRequired; }
}
