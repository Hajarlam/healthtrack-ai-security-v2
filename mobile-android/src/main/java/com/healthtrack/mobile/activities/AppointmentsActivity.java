package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.adapters.AppointmentAdapter;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.Appointment;
import com.healthtrack.mobile.models.User;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.*;

public class AppointmentsActivity extends AppCompatActivity {

    private Spinner spinnerDoctor;
    private TextInputEditText etDate, etReason;
    private MaterialButton btnBook;
    private ProgressBar progressBar;
    private RecyclerView recyclerView;
    private TextView tvEmpty;
    private View bookingForm;
    private boolean isStaff;
    private List<User> doctorList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appointments);

        String role = SessionManager.getInstance(this).getRole();
        isStaff = "DOCTOR".equals(role) || "ADMIN".equals(role);

        spinnerDoctor = findViewById(R.id.spinner_doctor);
        etDate        = findViewById(R.id.et_date);
        etReason      = findViewById(R.id.et_reason);
        btnBook       = findViewById(R.id.btn_book);
        progressBar   = findViewById(R.id.progress_bar);
        recyclerView  = findViewById(R.id.recycler_appointments);
        tvEmpty       = findViewById(R.id.tv_empty);
        bookingForm   = findViewById(R.id.layout_booking_form);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());

        if (isStaff) {
            // Les medecins/admins ne prennent pas de RDV, ils les confirment.
            bookingForm.setVisibility(View.GONE);
        } else {
            loadDoctors();
        }

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
        progressBar.setVisibility(View.VISIBLE);
        ApiClient.getInstance(this).create(ApiService.class).getAppointments()
            .enqueue(new Callback<List<Appointment>>() {
                @Override
                public void onResponse(Call<List<Appointment>> call, Response<List<Appointment>> r) {
                    progressBar.setVisibility(View.GONE);
                    if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                        recyclerView.setAdapter(new AppointmentAdapter(r.body(), AppointmentsActivity.this));
                        recyclerView.setVisibility(View.VISIBLE);
                        tvEmpty.setVisibility(View.GONE);
                    } else {
                        tvEmpty.setVisibility(View.VISIBLE);
                        recyclerView.setVisibility(View.GONE);
                    }
                }
                @Override
                public void onFailure(Call<List<Appointment>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                }
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
