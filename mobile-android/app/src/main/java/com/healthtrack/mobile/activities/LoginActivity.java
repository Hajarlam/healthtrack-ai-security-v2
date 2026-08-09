package com.healthtrack.mobile.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.AuthResponse;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etEmail, etPassword;
    private MaterialButton btnLogin;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail     = findViewById(R.id.et_email);
        etPassword  = findViewById(R.id.et_password);
        btnLogin    = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);

        // Demo buttons
        findViewById(R.id.btn_demo_patient).setOnClickListener(v -> fillDemo("patient"));
        findViewById(R.id.btn_demo_doctor).setOnClickListener(v -> fillDemo("doctor"));
        findViewById(R.id.btn_demo_admin).setOnClickListener(v -> fillDemo("admin"));

        btnLogin.setOnClickListener(v -> attemptLogin());

        findViewById(R.id.tv_register).setOnClickListener(v ->
            startActivity(new Intent(this, RegisterActivity.class)));
    }

    private void fillDemo(String role) {
        switch (role) {
            case "patient":
                etEmail.setText("patient@healthtrack.ai");
                etPassword.setText("Patient@123");
                break;
            case "doctor":
                etEmail.setText("doctor@healthtrack.ai");
                etPassword.setText("Doctor@123");
                break;
            case "admin":
                etEmail.setText("admin@healthtrack.ai");
                etPassword.setText("Admin@123");
                break;
        }
    }

    private void attemptLogin() {
        String email    = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);

        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);

        ApiService api = ApiClient.getInstance(this).create(ApiService.class);
        api.login(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                setLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse auth = response.body();
                    SessionManager.getInstance(LoginActivity.this).saveSession(
                        auth.getAccessToken(), auth.getEmail(),
                        auth.getFirstName(), auth.getLastName(),
                        auth.getRole(), auth.getUserId()
                    );
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                } else {
                    Toast.makeText(LoginActivity.this, "Email ou mot de passe incorrect", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                setLoading(false);
                Toast.makeText(LoginActivity.this, "Erreur réseau: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void setLoading(boolean loading) {
        btnLogin.setEnabled(!loading);
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}
