package com.healthtrack.dto;
public class AuthRequest {
    private String email,password,otpCode;
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public String getOtpCode(){return otpCode;} public void setOtpCode(String v){otpCode=v;}
}