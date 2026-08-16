package com.healthtrack.mobile.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.*;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.activities.PatientRecordsActivity;
import com.healthtrack.mobile.models.User;
import java.util.List;

public class PatientAdapter extends RecyclerView.Adapter<PatientAdapter.ViewHolder> {

    private final List<User> patients;
    private final Context context;

    public PatientAdapter(List<User> patients, Context context) {
        this.patients = patients; this.context = context;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_patient, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        User p = patients.get(position);
        h.tvName.setText(p.getFullName());
        h.tvInitial.setText(p.getFirstName() != null && !p.getFirstName().isEmpty()
            ? p.getFirstName().substring(0, 1).toUpperCase() : "?");

        StringBuilder details = new StringBuilder();
        if (p.getBloodType() != null && !p.getBloodType().isEmpty()) details.append(p.getBloodType());
        if (p.getChronicDiseases() != null && !p.getChronicDiseases().isEmpty()) {
            if (details.length() > 0) details.append(" · ");
            details.append(p.getChronicDiseases());
        }
        h.tvDetails.setText(details.length() > 0 ? details.toString() : p.getEmail());

        h.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, PatientRecordsActivity.class);
            intent.putExtra("patientId", p.getId());
            intent.putExtra("patientName", p.getFullName());
            intent.putExtra("patientInfo", details.toString());
            context.startActivity(intent);
        });
    }

    @Override public int getItemCount() { return patients.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvDetails, tvInitial;
        ViewHolder(View v) {
            super(v);
            tvName    = v.findViewById(R.id.tv_name);
            tvDetails = v.findViewById(R.id.tv_details);
            tvInitial = v.findViewById(R.id.tv_initial);
        }
    }
}
