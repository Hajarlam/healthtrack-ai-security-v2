package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.healthtrack.mobile.R;

public class SosActivity extends AppCompatActivity {

    private boolean sosSent = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sos);

        MaterialButton btnSos = findViewById(R.id.btn_sos);
        TextView tvStatus = findViewById(R.id.tv_sos_status);

        btnSos.setOnClickListener(v -> {
            if (!sosSent) {
                sosSent = true;
                btnSos.setEnabled(false);
                tvStatus.setText("📡 Envoi de l'alerte SOS...");
                tvStatus.setTextColor(0xFFE65100);

                // Simulate SOS sending (in production: use GPS + call API)
                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    tvStatus.setText("✅ SOS envoyé ! Les secours ont été notifiés.");
                    tvStatus.setTextColor(0xFF2E7D32);
                    Toast.makeText(this, "SOS envoyé avec succès !", Toast.LENGTH_LONG).show();
                }, 2000);
            }
        });

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
    }
}
