package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.adapters.AlertAdapter;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.Alert;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class AlertsActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_alerts);

        recyclerView = findViewById(R.id.recycler_view);
        progressBar  = findViewById(R.id.progress_bar);
        tvEmpty      = findViewById(R.id.tv_empty);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        loadAlerts();
    }

    private void loadAlerts() {
        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).getAlerts()
            .enqueue(new Callback<List<Alert>>() {
                @Override
                public void onResponse(Call<List<Alert>> call, Response<List<Alert>> response) {
                    progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                        AlertAdapter adapter = new AlertAdapter(response.body(), AlertsActivity.this);
                        recyclerView.setAdapter(adapter);
                        recyclerView.setVisibility(View.VISIBLE);
                        tvEmpty.setVisibility(View.GONE);
                    } else {
                        tvEmpty.setText("✅ Aucune alerte active");
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerView.setVisibility(View.GONE);
                    }
                }
                @Override
                public void onFailure(Call<List<Alert>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                }
            });
    }
}
