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
import com.healthtrack.mobile.models.Medication;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.*;

public class MedicationsActivity extends AppCompatActivity {

    private TextInputEditText etName, etDosage, etFrequency, etInstructions;
    private MaterialButton btnAdd;
    private ProgressBar progressBar;
    private ListView listView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_medications);

        etName         = findViewById(R.id.et_name);
        etDosage       = findViewById(R.id.et_dosage);
        etFrequency    = findViewById(R.id.et_frequency);
        etInstructions = findViewById(R.id.et_instructions);
        btnAdd         = findViewById(R.id.btn_add);
        progressBar    = findViewById(R.id.progress_bar);
        listView       = findViewById(R.id.list_medications);

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        btnAdd.setOnClickListener(v -> addMedication());
        loadMedications();
    }

    private void loadMedications() {
        ApiClient.getInstance(this).create(ApiService.class).getMedications()
            .enqueue(new Callback<List<Medication>>() {
                @Override
                public void onResponse(Call<List<Medication>> call, Response<List<Medication>> r) {
                    if (r.isSuccessful() && r.body() != null) {
                        List<String> items = new ArrayList<>();
                        for (Medication m : r.body()) {
                            items.add("💊 " + m.getName() + "\n" + m.getDosage() + " - " + m.getFrequency());
                        }
                        listView.setAdapter(new ArrayAdapter<>(MedicationsActivity.this,
                            android.R.layout.simple_list_item_1, items));
                    }
                }
                @Override public void onFailure(Call<List<Medication>> call, Throwable t) {}
            });
    }

    private void addMedication() {
        String name  = etName.getText()!=null ? etName.getText().toString().trim() : "";
        String dosage= etDosage.getText()!=null ? etDosage.getText().toString().trim() : "";
        String freq  = etFrequency.getText()!=null ? etFrequency.getText().toString().trim() : "";
        if (name.isEmpty()||dosage.isEmpty()||freq.isEmpty()) {
            Toast.makeText(this,"Remplissez les champs obligatoires",Toast.LENGTH_SHORT).show(); return;
        }
        Map<String,Object> body = new HashMap<>();
        body.put("name",name); body.put("dosage",dosage); body.put("frequency",freq);
        if(etInstructions.getText()!=null) body.put("instructions",etInstructions.getText().toString());

        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).addMedication(body)
            .enqueue(new Callback<Medication>() {
                @Override
                public void onResponse(Call<Medication> call, Response<Medication> r) {
                    progressBar.setVisibility(View.GONE);
                    if(r.isSuccessful()) {
                        Toast.makeText(MedicationsActivity.this,"✅ Médicament ajouté !",Toast.LENGTH_SHORT).show();
                        etName.setText(""); etDosage.setText(""); etFrequency.setText(""); etInstructions.setText("");
                        loadMedications();
                    }
                }
                @Override public void onFailure(Call<Medication> call, Throwable t) { progressBar.setVisibility(View.GONE); }
            });
    }
}
