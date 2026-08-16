package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.adapters.HealthRecordAdapter;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.HealthRecord;
import com.healthtrack.mobile.models.PageResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HistoryActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_history);

        recyclerView = findViewById(R.id.recycler_view);
        progressBar  = findViewById(R.id.progress_bar);
        tvEmpty      = findViewById(R.id.tv_empty);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());

        loadHistory();
    }

    private void loadHistory() {
        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).getHealthRecords(0, 50)
            .enqueue(new Callback<PageResponse<HealthRecord>>() {
                @Override
                public void onResponse(Call<PageResponse<HealthRecord>> call, Response<PageResponse<HealthRecord>> response) {
                    progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null && !response.body().getContent().isEmpty()) {
                        recyclerView.setAdapter(new HealthRecordAdapter(response.body().getContent()));
                        recyclerView.setVisibility(View.VISIBLE);
                        tvEmpty.setVisibility(View.GONE);
                    } else {
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerView.setVisibility(View.GONE);
                    }
                }
                @Override
                public void onFailure(Call<PageResponse<HealthRecord>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(HistoryActivity.this, "Erreur: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
    }
}
