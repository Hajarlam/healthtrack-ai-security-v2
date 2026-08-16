package com.healthtrack.mobile.adapters;

import android.content.Context;
import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.Alert;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class AlertAdapter extends RecyclerView.Adapter<AlertAdapter.ViewHolder> {

    private final List<Alert> alerts;
    private final Context context;

    public AlertAdapter(List<Alert> alerts, Context context) {
        this.alerts = alerts; this.context = context;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_alert, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        Alert a = alerts.get(position);
        String message = a.getMessage();
        if (a.getPatient() != null && a.getPatient().getFullName() != null) {
            message = a.getPatient().getFullName() + " — " + message;
        }
        h.tvMessage.setText(message);
        h.tvDate.setText(a.getCreatedAt() != null ? a.getCreatedAt().substring(0,16).replace("T"," ") : "");
        h.tvSeverity.setText(a.getSeverity());

        int bgColor;
        switch (a.getSeverity() != null ? a.getSeverity() : "") {
            case "CRITICAL": bgColor = 0xFFFFF0F0; h.tvSeverity.setTextColor(0xFFC62828); break;
            case "HIGH":     bgColor = 0xFFFFF8F0; h.tvSeverity.setTextColor(0xFFEF6C00); break;
            default:         bgColor = 0xFFF0F4FF; h.tvSeverity.setTextColor(0xFF1565C0);
        }
        h.card.setCardBackgroundColor(bgColor);

        if (a.isAcknowledged()) {
            h.btnAck.setVisibility(View.GONE);
            h.tvAcked.setVisibility(View.VISIBLE);
        } else {
            h.btnAck.setVisibility(View.VISIBLE);
            h.tvAcked.setVisibility(View.GONE);
            h.btnAck.setOnClickListener(v -> {
                ApiClient.getInstance(context).create(ApiService.class).acknowledgeAlert(a.getId())
                    .enqueue(new Callback<Alert>() {
                        @Override public void onResponse(Call<Alert> call, Response<Alert> response) {
                            if (response.isSuccessful()) {
                                a.setAcknowledged(true);
                                notifyItemChanged(position);
                            }
                        }
                        @Override public void onFailure(Call<Alert> call, Throwable t) {}
                    });
            });
        }
    }

    @Override public int getItemCount() { return alerts.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        CardView card;
        TextView tvMessage, tvDate, tvSeverity, tvAcked;
        Button btnAck;
        ViewHolder(View v) {
            super(v);
            card       = v.findViewById(R.id.card);
            tvMessage  = v.findViewById(R.id.tv_message);
            tvDate     = v.findViewById(R.id.tv_date);
            tvSeverity = v.findViewById(R.id.tv_severity);
            tvAcked    = v.findViewById(R.id.tv_acked);
            btnAck     = v.findViewById(R.id.btn_acknowledge);
        }
    }
}
