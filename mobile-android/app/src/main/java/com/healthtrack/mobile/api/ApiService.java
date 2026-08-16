package com.healthtrack.mobile.api;

import com.healthtrack.mobile.models.*;
import retrofit2.Call;
import retrofit2.http.*;
import java.util.List;
import java.util.Map;

public interface ApiService {

    // ── Auth ──
    @POST("auth/login")
    Call<AuthResponse> login(@Body Map<String,String> body);

    @POST("auth/register")
    Call<AuthResponse> register(@Body Map<String,Object> body);

    // ── User ──
    @GET("users/me")
    Call<User> getMe();

    @GET("users/doctors")
    Call<List<User>> getDoctors();

    // ── Health Records ──
    @GET("health-records")
    Call<PageResponse<HealthRecord>> getHealthRecords(
        @Query("page") int page,
        @Query("size") int size
    );

    @GET("health-records/latest")
    Call<HealthRecord> getLatestRecord();

    @POST("health-records")
    Call<HealthRecord> addHealthRecord(@Body Map<String,Object> body);

    // ── Alerts ──
    @GET("alerts")
    Call<List<Alert>> getAlerts();

    @GET("alerts/count")
    Call<Long> getAlertCount();

    @PATCH("alerts/{id}/acknowledge")
    Call<Alert> acknowledgeAlert(@Path("id") int id);

    // ── Appointments ──
    @GET("appointments")
    Call<List<Appointment>> getAppointments();

    @POST("appointments")
    Call<Appointment> createAppointment(@Body Map<String,Object> body);

    @PATCH("appointments/{id}/cancel")
    Call<Appointment> cancelAppointment(@Path("id") int id);

    // ── Medications ──
    @GET("medications")
    Call<List<Medication>> getMedications();

    @POST("medications")
    Call<Medication> addMedication(@Body Map<String,Object> body);

    @DELETE("medications/{id}")
    Call<Void> deleteMedication(@Path("id") int id);
}
