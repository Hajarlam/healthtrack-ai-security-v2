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
import com.healthtrack.mobile.models.Appointment;
import com.healthtrack.mobile.models.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.*;

public class AppointmentsActivity extends AppCompatActivity {

    private Spinner spinnerDoctor;
    private TextInputEditText etDate, etReason;
    private MaterialButton btnBook;
    private ProgressBar progressBar;
    private ListView listView;
    private List<User> doctorList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appointments);

        spinnerDoctor = findViewById(R.id.spinner_doctor);
        etDate        = findViewById(R.id.et_date);
        etReason      = findViewById(R.id.et_reason);
        btnBook       = findViewById(R.id.btn_book);
        progressBar   = findViewById(R.id.progress_bar);
        listView      = findViewById(R.id.list_appointments);

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());

        loadDoctors();
        loadAppointments();

        btnBook.setOnClickListener(v -> bookAppointment());
    }

    private void loadDoctors() {
        ApiClient.getInstance(this).create(ApiService.class).getDoctors()
            .enqueue(new Callback<List<User>>() {
                @Override
                public void onResponse(Call<List<User>> call, Response<List<User>> r) {
                    if (r.isSuccessful() && r.body() != null) {
                        doctorList = r.body();
                        List<String> names = new ArrayList<>();
                        for (User d : doctorList) names.add("Dr. " + d.getFullName());
                        spinnerDoctor.setAdapter(new ArrayAdapter<>(AppointmentsActivity.this,
                            android.R.layout.simple_spinner_dropdown_item, names));
                    }
                }
                @Override public void onFailure(Call<List<User>> call, Throwable t) {}
            });
    }

    private void loadAppointments() {
        ApiClient.getInstance(this).create(ApiService.class).getAppointments()
            .enqueue(new Callback<List<Appointment>>() {
                @Override
                public void onResponse(Call<List<Appointment>> call, Response<List<Appointment>> r) {
                    if (r.isSuccessful() && r.body() != null) {
                        List<String> items = new ArrayList<>();
                        for (Appointment a : r.body()) {
<<<<<<< HEAD
                            items.add("📅 " + a.getAppointmentDate() + "\n" + a.getReason() + " [" + a.getStatus() + "]");
=======
                            items.add("📅 " + a.getAppointmentDate() + "
" + a.getReason() + " [" + a.getStatus() + "]");
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
                        }
                        listView.setAdapter(new ArrayAdapter<>(AppointmentsActivity.this,
                            android.R.layout.simple_list_item_1, items));
                    }
                }
                @Override public void onFailure(Call<List<Appointment>> call, Throwable t) {}
            });
    }

    private void bookAppointment() {
        if (doctorList.isEmpty()) { Toast.makeText(this,"Aucun médecin disponible",Toast.LENGTH_SHORT).show(); return; }
        String date   = etDate.getText()   != null ? etDate.getText().toString().trim()   : "";
        String reason = etReason.getText() != null ? etReason.getText().toString().trim() : "";
        if (date.isEmpty()) { Toast.makeText(this,"Entrez la date",Toast.LENGTH_SHORT).show(); return; }

        int doctorId = doctorList.get(spinnerDoctor.getSelectedItemPosition()).getId();
        Map<String,Object> body = new HashMap<>();
        body.put("doctorId", doctorId);
        body.put("appointmentDate", date + ":00");
        body.put("reason", reason);

        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).createAppointment(body)
            .enqueue(new Callback<Appointment>() {
                @Override
                public void onResponse(Call<Appointment> call, Response<Appointment> r) {
                    progressBar.setVisibility(View.GONE);
                    if (r.isSuccessful()) {
                        Toast.makeText(AppointmentsActivity.this,"✅ RDV confirmé !",Toast.LENGTH_SHORT).show();
                        etDate.setText(""); etReason.setText("");
                        loadAppointments();
                    }
                }
                @Override public void onFailure(Call<Appointment> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(AppointmentsActivity.this,"Erreur réseau",Toast.LENGTH_SHORT).show();
                }
            });
    }
}
