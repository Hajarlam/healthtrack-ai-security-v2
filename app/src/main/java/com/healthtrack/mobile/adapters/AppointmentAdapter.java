package com.healthtrack.mobile.adapters;

import android.content.Context;
import android.view.*;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.Appointment;
import com.healthtrack.mobile.models.User;
import com.healthtrack.mobile.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    private final List<Appointment> appointments;
    private final Context context;
    private final boolean isStaff; // DOCTOR or ADMIN can confirm/cancel

    public AppointmentAdapter(List<Appointment> appointments, Context context) {
        this.appointments = appointments;
        this.context = context;
        String role = SessionManager.getInstance(context).getRole();
        this.isStaff = "DOCTOR".equals(role) || "ADMIN".equals(role);
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_appointment, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        Appointment a = appointments.get(position);

        User person = isStaff ? a.getPatient() : a.getDoctor();
        String label = person != null ? person.getFullName() : (isStaff ? "Patient" : "Dr.");
        h.tvPerson.setText((isStaff ? "" : "Dr. ") + label);

        h.tvDate.setText("📅 " + (a.getAppointmentDate() != null ? a.getAppointmentDate().replace("T", " ") : ""));
        h.tvReason.setText(a.getReason() != null && !a.getReason().isEmpty() ? a.getReason() : "Sans motif precise");

        String status = a.getStatus() != null ? a.getStatus() : "PENDING";
        h.tvStatus.setText(statusLabel(status));
        h.tvStatus.setTextColor(statusColor(status));

        if (isStaff && "PENDING".equals(status)) {
            h.layoutActions.setVisibility(View.VISIBLE);
            h.btnConfirm.setOnClickListener(v -> {
                ApiClient.getInstance(context).create(ApiService.class).confirmAppointment(a.getId())
                    .enqueue(new Callback<Appointment>() {
                        @Override public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                            if (response.isSuccessful()) {
                                notifyStatusChanged(h, "CONFIRMED");
                                Toast.makeText(context, "RDV confirme", Toast.LENGTH_SHORT).show();
                            }
                        }
                        @Override public void onFailure(Call<Appointment> call, Throwable t) {}
                    });
            });
            h.btnCancel.setOnClickListener(v -> {
                ApiClient.getInstance(context).create(ApiService.class).cancelAppointment(a.getId())
                    .enqueue(new Callback<Appointment>() {
                        @Override public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                            if (response.isSuccessful()) {
                                notifyStatusChanged(h, "CANCELLED");
                                Toast.makeText(context, "RDV annule", Toast.LENGTH_SHORT).show();
                            }
                        }
                        @Override public void onFailure(Call<Appointment> call, Throwable t) {}
                    });
            });
        } else {
            h.layoutActions.setVisibility(View.GONE);
        }
    }

    private void notifyStatusChanged(ViewHolder h, String newStatus) {
        h.tvStatus.setText(statusLabel(newStatus));
        h.tvStatus.setTextColor(statusColor(newStatus));
        h.layoutActions.setVisibility(View.GONE);
    }

    private String statusLabel(String status) {
        switch (status) {
            case "CONFIRMED": return "Confirme";
            case "CANCELLED": return "Annule";
            case "COMPLETED": return "Termine";
            default: return "En attente";
        }
    }

    private int statusColor(String status) {
        switch (status) {
            case "CONFIRMED": return 0xFF2E7D32;
            case "CANCELLED": return 0xFFC62828;
            case "COMPLETED": return 0xFF5E7C79;
            default: return 0xFFEF6C00;
        }
    }

    @Override public int getItemCount() { return appointments.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvPerson, tvDate, tvReason, tvStatus;
        LinearLayout layoutActions;
        Button btnConfirm, btnCancel;
        ViewHolder(View v) {
            super(v);
            tvPerson      = v.findViewById(R.id.tv_person);
            tvDate        = v.findViewById(R.id.tv_date);
            tvReason      = v.findViewById(R.id.tv_reason);
            tvStatus      = v.findViewById(R.id.tv_status);
            layoutActions = v.findViewById(R.id.layout_actions);
            btnConfirm    = v.findViewById(R.id.btn_confirm);
            btnCancel     = v.findViewById(R.id.btn_cancel);
        }
    }
}
