package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.HealthRecord;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

public class AddHealthRecordActivity extends AppCompatActivity {

    private TextInputEditText etSystolic, etDiastolic, etHeartRate, etGlucose;
    private TextInputEditText etSpo2, etTemp, etWeight, etNotes;
    private MaterialButton btnSave;
    private ProgressBar progressBar;
    private TextView tvResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_health_record);

        etSystolic  = findViewById(R.id.et_systolic);
        etDiastolic = findViewById(R.id.et_diastolic);
        etHeartRate = findViewById(R.id.et_heart_rate);
        etGlucose   = findViewById(R.id.et_glucose);
        etSpo2      = findViewById(R.id.et_spo2);
        etTemp      = findViewById(R.id.et_temp);
        etWeight    = findViewById(R.id.et_weight);
        etNotes     = findViewById(R.id.et_notes);
        btnSave     = findViewById(R.id.btn_save);
        progressBar = findViewById(R.id.progress_bar);
        tvResult    = findViewById(R.id.tv_result);

        btnSave.setOnClickListener(v -> saveRecord());
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
    }

    private void saveRecord() {
        Map<String, Object> body = new HashMap<>();
        addIfNotEmpty(body, "systolicBP",       etSystolic.getText());
        addIfNotEmpty(body, "diastolicBP",      etDiastolic.getText());
        addIfNotEmpty(body, "heartRate",        etHeartRate.getText());
        addIfNotEmpty(body, "bloodGlucose",     etGlucose.getText());
        addIfNotEmpty(body, "oxygenSaturation", etSpo2.getText());
        addIfNotEmpty(body, "temperature",      etTemp.getText());
        addIfNotEmpty(body, "weight",           etWeight.getText());
        if (etNotes.getText() != null && !etNotes.getText().toString().isEmpty())
            body.put("notes", etNotes.getText().toString());
        body.put("source", "MOBILE");

        if (body.size() <= 1) {
            Toast.makeText(this, "Saisissez au moins une valeur", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSave.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);
        tvResult.setVisibility(View.GONE);

        ApiClient.getInstance(this).create(ApiService.class).addHealthRecord(body)
            .enqueue(new Callback<HealthRecord>() {
                @Override
                public void onResponse(Call<HealthRecord> call, Response<HealthRecord> response) {
                    btnSave.setEnabled(true);
                    progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null) {
                        HealthRecord r = response.body();
                        String status = r.getStatus() != null ? r.getStatus() : "NORMAL";
                        String msg;
                        int color;
                        switch (status) {
                            case "CRITICAL":
                                msg = "⚠️ VALEURS CRITIQUES ! Consultez un médecin immédiatement.";
                                color = 0xFFC62828; break;
                            case "WARNING":
                                msg = "⚠️ Valeurs anormales détectées.";
                                color = 0xFFE65100; break;
                            default:
                                msg = "✅ Mesure enregistrée avec succès !";
                                color = 0xFF2E7D32;
                        }
                        tvResult.setText(msg);
                        tvResult.setTextColor(color);
                        tvResult.setVisibility(View.VISIBLE);
                        clearFields();
                    }
                }
                @Override
                public void onFailure(Call<HealthRecord> call, Throwable t) {
                    btnSave.setEnabled(true);
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(AddHealthRecordActivity.this, "Erreur réseau: " + t.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void addIfNotEmpty(Map<String, Object> map, String key, CharSequence text) {
        if (text != null && !text.toString().isEmpty()) {
            try { map.put(key, Double.parseDouble(text.toString())); }
            catch (NumberFormatException ignored) {}
        }
    }

    private void clearFields() {
        etSystolic.setText(""); etDiastolic.setText(""); etHeartRate.setText("");
        etGlucose.setText(""); etSpo2.setText(""); etTemp.setText("");
        etWeight.setText(""); etNotes.setText("");
    }
}
