package com.healthtrack.mobile.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.adapters.PatientAdapter;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.Appointment;
import com.healthtrack.mobile.models.User;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class DoctorDashboardActivity extends AppCompatActivity {

    private TextView tvWelcome, tvSpecialization, tvPatientCount, tvApptCount, tvAlertCount, tvEmpty;
    private RecyclerView recyclerPatients;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctor_dashboard);

        SessionManager session = SessionManager.getInstance(this);

        tvWelcome        = findViewById(R.id.tv_welcome);
        tvSpecialization = findViewById(R.id.tv_specialization);
        tvPatientCount   = findViewById(R.id.tv_patient_count);
        tvApptCount      = findViewById(R.id.tv_appt_count);
        tvAlertCount     = findViewById(R.id.tv_alert_count);
        tvEmpty          = findViewById(R.id.tv_empty);
        recyclerPatients = findViewById(R.id.recycler_patients);
        progressBar      = findViewById(R.id.progress_bar);

        recyclerPatients.setLayoutManager(new LinearLayoutManager(this));

        tvWelcome.setText("Dr. " + session.getFirstName() + " " + session.getLastName());
        tvSpecialization.setText("Espace medecin");

        CardView cardAppts   = findViewById(R.id.card_appointments);
        CardView cardAlerts  = findViewById(R.id.card_alerts);
        CardView cardProfile = findViewById(R.id.card_profile);

        cardAppts.setOnClickListener(v   -> startActivity(new Intent(this, AppointmentsActivity.class)));
        cardAlerts.setOnClickListener(v  -> startActivity(new Intent(this, AlertsActivity.class)));
        cardProfile.setOnClickListener(v -> startActivity(new Intent(this, ProfileActivity.class)));

        findViewById(R.id.btn_logout).setOnClickListener(v -> {
            SessionManager.getInstance(this).clearSession();
            ApiClient.reset();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        loadPatients();
        loadAppointmentCount();
        loadAlertCount();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadAppointmentCount();
        loadAlertCount();
    }

    private void loadPatients() {
        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).getPatients()
            .enqueue(new Callback<List<User>>() {
                @Override
                public void onResponse(Call<List<User>> call, Response<List<User>> response) {
                    progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                        tvPatientCount.setText(String.valueOf(response.body().size()));
                        recyclerPatients.setAdapter(new PatientAdapter(response.body(), DoctorDashboardActivity.this));
                        recyclerPatients.setVisibility(View.VISIBLE);
                        tvEmpty.setVisibility(View.GONE);
                    } else {
                        tvPatientCount.setText("0");
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerPatients.setVisibility(View.GONE);
                    }
                }
                @Override
                public void onFailure(Call<List<User>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(DoctorDashboardActivity.this, "Erreur reseau", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void loadAppointmentCount() {
        ApiClient.getInstance(this).create(ApiService.class).getAppointments()
            .enqueue(new Callback<List<Appointment>>() {
                @Override
                public void onResponse(Call<List<Appointment>> call, Response<List<Appointment>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        long pending = response.body().stream()
                            .filter(a -> "PENDING".equals(a.getStatus())).count();
                        tvApptCount.setText(String.valueOf(pending));
                    }
                }
                @Override public void onFailure(Call<List<Appointment>> call, Throwable t) {}
            });
    }

    private void loadAlertCount() {
        ApiClient.getInstance(this).create(ApiService.class).getAlertCount()
            .enqueue(new Callback<Long>() {
                @Override
                public void onResponse(Call<Long> call, Response<Long> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        tvAlertCount.setText(String.valueOf(response.body()));
                    }
                }
                @Override public void onFailure(Call<Long> call, Throwable t) {}
            });
    }
}
