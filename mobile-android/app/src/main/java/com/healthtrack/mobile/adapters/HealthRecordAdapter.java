package com.healthtrack.mobile.adapters;

import android.graphics.Color;
import android.view.*;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.models.HealthRecord;
import java.util.List;

public class HealthRecordAdapter extends RecyclerView.Adapter<HealthRecordAdapter.ViewHolder> {

    private final List<HealthRecord> records;

    public HealthRecordAdapter(List<HealthRecord> records) { this.records = records; }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_health_record, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        HealthRecord r = records.get(position);
        h.tvDate.setText(r.getRecordedAt() != null ? r.getRecordedAt().substring(0,16).replace("T"," ") : "--");
        h.tvBP.setText(r.getBloodPressure());
        h.tvHR.setText(r.getHeartRate() != null ? r.getHeartRate().intValue() + " bpm" : "--");
        h.tvGlucose.setText(r.getBloodGlucose() != null ? r.getBloodGlucose().intValue() + " mg/dL" : "--");
        h.tvSpo2.setText(r.getOxygenSaturation() != null ? r.getOxygenSaturation().intValue() + "%" : "--");
        h.tvTemp.setText(r.getTemperature() != null ? r.getTemperature() + "°C" : "--");

        String status = r.getStatus() != null ? r.getStatus() : "NORMAL";
        h.tvStatus.setText(status);
        switch (status) {
            case "CRITICAL": h.tvStatus.setTextColor(0xFFC62828); h.card.setCardBackgroundColor(0xFFFFF5F5); break;
            case "WARNING":  h.tvStatus.setTextColor(0xFFE65100); h.card.setCardBackgroundColor(0xFFFFFBF0); break;
            default:         h.tvStatus.setTextColor(0xFF2E7D32); h.card.setCardBackgroundColor(Color.WHITE);
        }
    }

    @Override public int getItemCount() { return records.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView card;
        TextView tvDate, tvBP, tvHR, tvGlucose, tvSpo2, tvTemp, tvStatus;
        ViewHolder(View v) {
            super(v);
            card      = v.findViewById(R.id.card);
            tvDate    = v.findViewById(R.id.tv_date);
            tvBP      = v.findViewById(R.id.tv_bp);
            tvHR      = v.findViewById(R.id.tv_hr);
            tvGlucose = v.findViewById(R.id.tv_glucose);
            tvSpo2    = v.findViewById(R.id.tv_spo2);
            tvTemp    = v.findViewById(R.id.tv_temp);
            tvStatus  = v.findViewById(R.id.tv_status);
        }
    }
}
