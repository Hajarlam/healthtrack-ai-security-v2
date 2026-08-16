package com.healthtrack.mobile.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.HealthRecord;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private TextView tvWelcome, tvBP, tvGlucose, tvSpo2, tvHR, tvStatus, tvAlertCount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SessionManager session = SessionManager.getInstance(this);

        tvWelcome    = findViewById(R.id.tv_welcome);
        tvBP         = findViewById(R.id.tv_bp);
        tvGlucose    = findViewById(R.id.tv_glucose);
        tvSpo2       = findViewById(R.id.tv_spo2);
        tvHR         = findViewById(R.id.tv_hr);
        tvStatus     = findViewById(R.id.tv_status);
        tvAlertCount = findViewById(R.id.tv_alert_count);

        tvWelcome.setText("Bonjour, " + session.getFirstName() + " 👋");

        loadLatestRecord();
        loadAlertCount();

        // Navigation cards
        CardView cardMeasure = findViewById(R.id.card_measure);
        CardView cardHistory = findViewById(R.id.card_history);
        CardView cardAlerts  = findViewById(R.id.card_alerts);
        CardView cardAppts   = findViewById(R.id.card_appointments);
        CardView cardMeds    = findViewById(R.id.card_medications);
        CardView cardProfile = findViewById(R.id.card_profile);
        CardView cardSos     = findViewById(R.id.card_sos);
        CardView cardOcr     = findViewById(R.id.card_ocr);
        CardView cardAvatar  = findViewById(R.id.card_avatar);

        cardMeasure.setOnClickListener(v -> startActivity(new Intent(this, AddHealthRecordActivity.class)));
        cardHistory.setOnClickListener(v -> startActivity(new Intent(this, HistoryActivity.class)));
        cardAlerts.setOnClickListener(v  -> startActivity(new Intent(this, AlertsActivity.class)));
        cardAppts.setOnClickListener(v   -> startActivity(new Intent(this, AppointmentsActivity.class)));
        cardMeds.setOnClickListener(v    -> startActivity(new Intent(this, MedicationsActivity.class)));
        cardProfile.setOnClickListener(v -> startActivity(new Intent(this, ProfileActivity.class)));
        cardSos.setOnClickListener(v     -> startActivity(new Intent(this, SosActivity.class)));
        cardOcr.setOnClickListener(v     -> startActivity(new Intent(this, OcrActivity.class)));
        cardAvatar.setOnClickListener(v  -> startActivity(new Intent(this, AvatarActivity.class)));

        // Logout
        findViewById(R.id.btn_logout).setOnClickListener(v -> {
            SessionManager.getInstance(this).clearSession();
            ApiClient.reset();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadLatestRecord();
        loadAlertCount();
    }

    private void loadLatestRecord() {
        ApiClient.getInstance(this).create(ApiService.class).getLatestRecord()
            .enqueue(new Callback<HealthRecord>() {
                @Override
                public void onResponse(Call<HealthRecord> call, Response<HealthRecord> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        HealthRecord r = response.body();
                        runOnUiThread(() -> {
                            tvBP.setText(r.getBloodPressure());
                            tvGlucose.setText(r.getBloodGlucose() != null ? r.getBloodGlucose().intValue() + " mg/dL" : "--");
                            tvSpo2.setText(r.getOxygenSaturation() != null ? r.getOxygenSaturation().intValue() + "%" : "--");
                            tvHR.setText(r.getHeartRate() != null ? r.getHeartRate().intValue() + " bpm" : "--");
                            String status = r.getStatus() != null ? r.getStatus() : "NORMAL";
                            tvStatus.setText(getStatusLabel(status));
                            int color = getStatusColor(status);
                            tvStatus.setTextColor(color);
                        });
                    }
                }
                @Override public void onFailure(Call<HealthRecord> call, Throwable t) {}
            });
    }

    private void loadAlertCount() {
        ApiClient.getInstance(this).create(ApiService.class).getAlertCount()
            .enqueue(new Callback<Long>() {
                @Override
                public void onResponse(Call<Long> call, Response<Long> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        long count = response.body();
                        runOnUiThread(() -> {
                            if (count > 0) {
                                tvAlertCount.setText(count + " alerte(s) active(s)");
                                tvAlertCount.setVisibility(android.view.View.VISIBLE);
                            } else {
                                tvAlertCount.setVisibility(android.view.View.GONE);
                            }
                        });
                    }
                }
                @Override public void onFailure(Call<Long> call, Throwable t) {}
            });
    }

    private String getStatusLabel(String status) {
        switch (status) {
            case "CRITICAL": return "⚠️ CRITIQUE — Consultez un médecin";
            case "WARNING":  return "⚠️ Valeurs anormales";
            default:         return "✅ État normal";
        }
    }

    private int getStatusColor(String status) {
        switch (status) {
            case "CRITICAL": return 0xFFC62828;
            case "WARNING":  return 0xFFEF6C00;
            default:         return 0xFF2E7D32;
        }
    }
}
