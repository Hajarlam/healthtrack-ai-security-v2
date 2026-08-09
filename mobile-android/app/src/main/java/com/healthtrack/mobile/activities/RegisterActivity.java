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
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etFirstName, etLastName, etEmail, etPassword;
    private Spinner spinnerRole;
    private MaterialButton btnRegister;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etFirstName  = findViewById(R.id.et_first_name);
        etLastName   = findViewById(R.id.et_last_name);
        etEmail      = findViewById(R.id.et_email);
        etPassword   = findViewById(R.id.et_password);
        spinnerRole  = findViewById(R.id.spinner_role);
        btnRegister  = findViewById(R.id.btn_register);
        progressBar  = findViewById(R.id.progress_bar);

        String[] roles = {"PATIENT", "DOCTOR"};
        spinnerRole.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, roles));

        btnRegister.setOnClickListener(v -> attemptRegister());
        findViewById(R.id.tv_login).setOnClickListener(v -> finish());
    }

    private void attemptRegister() {
        String firstName = etFirstName.getText() != null ? etFirstName.getText().toString().trim() : "";
        String lastName  = etLastName.getText()  != null ? etLastName.getText().toString().trim()  : "";
        String email     = etEmail.getText()     != null ? etEmail.getText().toString().trim()     : "";
        String password  = etPassword.getText()  != null ? etPassword.getText().toString().trim()  : "";

        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);

        Map<String, Object> body = new HashMap<>();
        body.put("firstName", firstName);
        body.put("lastName", lastName);
        body.put("email", email);
        body.put("password", password);
        body.put("role", spinnerRole.getSelectedItem().toString());

        ApiClient.getInstance(this).create(ApiService.class).register(body)
            .enqueue(new Callback<AuthResponse>() {
                @Override
                public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                    setLoading(false);
                    if (response.isSuccessful()) {
                        Toast.makeText(RegisterActivity.this, "Inscription réussie ! Connectez-vous.", Toast.LENGTH_SHORT).show();
                        startActivity(new Intent(RegisterActivity.this, LoginActivity.class));
                        finish();
                    } else {
                        Toast.makeText(RegisterActivity.this, "Erreur d'inscription", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<AuthResponse> call, Throwable t) {
                    setLoading(false);
                    Toast.makeText(RegisterActivity.this, "Erreur réseau", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void setLoading(boolean loading) {
        btnRegister.setEnabled(!loading);
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}
