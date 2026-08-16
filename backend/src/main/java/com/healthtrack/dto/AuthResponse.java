package com.healthtrack.dto;
import com.healthtrack.entity.User;
public class AuthResponse {
    private String accessToken,refreshToken,email,firstName,lastName,message;
    private User.Role role; private Long userId; private boolean twoFactorRequired;
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final AuthResponse r=new AuthResponse();
        public Builder accessToken(String v){r.accessToken=v;return this;} public Builder refreshToken(String v){r.refreshToken=v;return this;}
        public Builder email(String v){r.email=v;return this;} public Builder firstName(String v){r.firstName=v;return this;}
        public Builder lastName(String v){r.lastName=v;return this;} public Builder role(User.Role v){r.role=v;return this;}
        public Builder userId(Long v){r.userId=v;return this;} public Builder twoFactorRequired(boolean v){r.twoFactorRequired=v;return this;}
        public Builder message(String v){r.message=v;return this;} public AuthResponse build(){return r;}
    }
    public String getAccessToken(){return accessToken;} public String getRefreshToken(){return refreshToken;}
    public String getEmail(){return email;} public String getFirstName(){return firstName;}
    public String getLastName(){return lastName;} public User.Role getRole(){return role;}
    public Long getUserId(){return userId;} public boolean isTwoFactorRequired(){return twoFactorRequired;}
    public String getMessage(){return message;}
}