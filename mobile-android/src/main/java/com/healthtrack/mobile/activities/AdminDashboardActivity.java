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
import com.healthtrack.mobile.adapters.UserManageAdapter;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.User;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;
import java.util.Map;

public class AdminDashboardActivity extends AppCompatActivity {

    private TextView tvWelcome, tvEmpty;
    private TextView tvTotalUsers, tvTotalPatients, tvTotalDoctors, tvTotalAlerts, tvTotalRecords, tvTotalAppointments;
    private RecyclerView recyclerUsers;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_dashboard);

        SessionManager session = SessionManager.getInstance(this);

        tvWelcome            = findViewById(R.id.tv_welcome);
        tvEmpty              = findViewById(R.id.tv_empty);
        tvTotalUsers         = findViewById(R.id.tv_total_users);
        tvTotalPatients      = findViewById(R.id.tv_total_patients);
        tvTotalDoctors       = findViewById(R.id.tv_total_doctors);
        tvTotalAlerts        = findViewById(R.id.tv_total_alerts);
        tvTotalRecords       = findViewById(R.id.tv_total_records);
        tvTotalAppointments  = findViewById(R.id.tv_total_appointments);
        recyclerUsers        = findViewById(R.id.recycler_users);
        progressBar          = findViewById(R.id.progress_bar);

        recyclerUsers.setLayoutManager(new LinearLayoutManager(this));
        tvWelcome.setText("Bonjour, " + session.getFirstName());

        CardView cardProfile = findViewById(R.id.card_profile);
        cardProfile.setOnClickListener(v -> startActivity(new Intent(this, ProfileActivity.class)));

        findViewById(R.id.btn_logout).setOnClickListener(v -> {
            SessionManager.getInstance(this).clearSession();
            ApiClient.reset();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        loadStats();
        loadUsers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadStats();
    }

    private void loadStats() {
        ApiClient.getInstance(this).create(ApiService.class).getAdminStats()
            .enqueue(new Callback<Map<String, Object>>() {
                @Override
                public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        Map<String, Object> s = response.body();
                        tvTotalUsers.setText(fmt(s.get("totalUsers")));
                        tvTotalPatients.setText(fmt(s.get("totalPatients")));
                        tvTotalDoctors.setText(fmt(s.get("totalDoctors")));
                        tvTotalAlerts.setText(fmt(s.get("totalAlerts")));
                        tvTotalRecords.setText(fmt(s.get("totalRecords")));
                        tvTotalAppointments.setText(fmt(s.get("totalAppointments")));
                    }
                }
                @Override public void onFailure(Call<Map<String, Object>> call, Throwable t) {}
            });
    }

    private String fmt(Object v) {
        if (v == null) return "0";
        if (v instanceof Double) return String.valueOf(((Double) v).intValue());
        return String.valueOf(v);
    }

    private void loadUsers() {
        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).getAllUsers()
            .enqueue(new Callback<List<User>>() {
                @Override
                public void onResponse(Call<List<User>> call, Response<List<User>> response) {
                    progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                        recyclerUsers.setAdapter(new UserManageAdapter(response.body(), AdminDashboardActivity.this));
                        recyclerUsers.setVisibility(View.VISIBLE);
                        tvEmpty.setVisibility(View.GONE);
                    } else {
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerUsers.setVisibility(View.GONE);
                    }
                }
                @Override
                public void onFailure(Call<List<User>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(AdminDashboardActivity.this, "Erreur reseau", Toast.LENGTH_SHORT).show();
                }
            });
    }
}
