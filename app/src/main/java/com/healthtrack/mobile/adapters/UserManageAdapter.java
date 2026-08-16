package com.healthtrack.mobile.adapters;

import android.content.Context;
import android.view.*;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class UserManageAdapter extends RecyclerView.Adapter<UserManageAdapter.ViewHolder> {

    private final List<User> users;
    private final Context context;

    public UserManageAdapter(List<User> users, Context context) {
        this.users = users; this.context = context;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user_manage, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        User u = users.get(position);
        h.tvName.setText(u.getFullName());
        h.tvEmail.setText(u.getEmail());
        h.tvRoleBadge.setText(u.getRole() != null ? u.getRole() : "");

        int badgeColor;
        switch (u.getRole() != null ? u.getRole() : "") {
            case "ADMIN":  badgeColor = 0xFF5C35CC; break;
            case "DOCTOR": badgeColor = 0xFF0077B6; break;
            case "EMERGENCY": badgeColor = 0xFFC62828; break;
            default:       badgeColor = 0xFF2E7D32;
        }
        h.tvRoleBadge.setBackgroundColor(badgeColor);

        updateToggleButton(h, u.isEnabled());

        h.btnToggle.setOnClickListener(v -> {
            ApiClient.getInstance(context).create(ApiService.class).toggleUserStatus(u.getId())
                .enqueue(new Callback<Void>() {
                    @Override public void onResponse(Call<Void> call, Response<Void> response) {
                        if (response.isSuccessful()) {
                            u.setEnabled(!u.isEnabled());
                            updateToggleButton(h, u.isEnabled());
                            Toast.makeText(context,
                                u.isEnabled() ? "Compte active" : "Compte desactive",
                                Toast.LENGTH_SHORT).show();
                        }
                    }
                    @Override public void onFailure(Call<Void> call, Throwable t) {
                        Toast.makeText(context, "Erreur reseau", Toast.LENGTH_SHORT).show();
                    }
                });
        });
    }

    private void updateToggleButton(ViewHolder h, boolean enabled) {
        h.btnToggle.setText(enabled ? "Desactiver" : "Activer");
        h.btnToggle.setTextColor(enabled ? 0xFFC62828 : 0xFF2E7D32);
    }

    @Override public int getItemCount() { return users.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvEmail, tvRoleBadge;
        Button btnToggle;
        ViewHolder(View v) {
            super(v);
            tvName      = v.findViewById(R.id.tv_name);
            tvEmail     = v.findViewById(R.id.tv_email);
            tvRoleBadge = v.findViewById(R.id.tv_role_badge);
            btnToggle   = v.findViewById(R.id.btn_toggle);
        }
    }
}
