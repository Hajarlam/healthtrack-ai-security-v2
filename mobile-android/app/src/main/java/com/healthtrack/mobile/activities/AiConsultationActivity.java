package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.text.SimpleDateFormat;
import java.util.*;

public class AiConsultationActivity extends AppCompatActivity {

    public static class AiMessage {
        public String text;
        public String time;
        public boolean isUser;
        public String modelBadge;

        public AiMessage(String text, String time, boolean isUser, String modelBadge) {
            this.text = text;
            this.time = time;
            this.isUser = isUser;
            this.modelBadge = modelBadge;
        }
    }

    private RecyclerView recyclerChat;
    private ChatAdapter adapter;
    private List<AiMessage> messagesList = new ArrayList<>();
    private EditText etMessage;
    private View layoutTyping;
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ai_consultation);

        recyclerChat = findViewById(R.id.recycler_chat);
        etMessage = findViewById(R.id.et_message);
        layoutTyping = findViewById(R.id.layout_typing);

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());

        adapter = new ChatAdapter(messagesList);
        LinearLayoutManager lm = new LinearLayoutManager(this);
        lm.setStackFromEnd(true);
        recyclerChat.setLayoutManager(lm);
        recyclerChat.setAdapter(adapter);

        // Initial welcome message from AI Doctor
        String now = timeFormat.format(new Date());
        messagesList.add(new AiMessage(
                "Bonjour ! Je suis Dr. Sihati AI, votre assistant médical propulsé par OpenAI GPT.\n\nComment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur vos constantes, vos traitements ou des conseils d'hygiène de vie.",
                now,
                false,
                "OpenAI GPT"
        ));
        adapter.notifyDataSetChanged();

        // Send button
        findViewById(R.id.btn_send).setOnClickListener(v -> sendMessage());

        // Suggestion chips
        setupChip(R.id.chip_q1, "Comment faire baisser ma tension ?");
        setupChip(R.id.chip_q2, "Que faire en cas de mal de tête ?");
        setupChip(R.id.chip_q3, "Conseils glycémie et diabète");
    }

    private void setupChip(int resId, String query) {
        View chip = findViewById(resId);
        if (chip != null) {
            chip.setOnClickListener(v -> {
                etMessage.setText(query);
                sendMessage();
            });
        }
    }

    private void sendMessage() {
        String text = etMessage.getText().toString().trim();
        if (text.isEmpty()) return;

        String now = timeFormat.format(new Date());
        messagesList.add(new AiMessage(text, now, true, null));
        adapter.notifyItemInserted(messagesList.size() - 1);
        recyclerChat.scrollToPosition(messagesList.size() - 1);
        etMessage.setText("");

        layoutTyping.setVisibility(View.VISIBLE);

        Map<String, Object> req = new HashMap<>();
        req.put("message", text);

        ApiClient.getInstance(this).create(ApiService.class).chatWithAi(req)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                        runOnUiThread(() -> {
                            layoutTyping.setVisibility(View.GONE);
                            String reply = null;
                            String badge = "GPT-3.5";

                            if (response.isSuccessful() && response.body() != null) {
                                Map<String, Object> body = response.body();
                                reply = (String) body.get("reply");
                                String src = (String) body.get("source");
                                if (src != null) badge = src;
                            }

                            if (reply == null || reply.trim().isEmpty()) {
                                reply = "Je suis désolé, je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer ou contacter votre médecin.";
                            }

                            String timeReply = timeFormat.format(new Date());
                            messagesList.add(new AiMessage(reply, timeReply, false, badge));
                            adapter.notifyItemInserted(messagesList.size() - 1);
                            recyclerChat.scrollToPosition(messagesList.size() - 1);
                        });
                    }

                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        runOnUiThread(() -> {
                            layoutTyping.setVisibility(View.GONE);
                            String timeReply = timeFormat.format(new Date());
                            messagesList.add(new AiMessage(
                                    "🩺 Remarque clinique : En cas de malaise, douleur thoracique ou difficulté respiratoire, composez immédiatement le numéro d'urgence (15 ou 141) ou utilisez le bouton SOS.",
                                    timeReply,
                                    false,
                                    "Mode Secours"
                            ));
                            adapter.notifyItemInserted(messagesList.size() - 1);
                            recyclerChat.scrollToPosition(messagesList.size() - 1);
                        });
                    }
                });
    }

    // RecyclerView Adapter
    private static class ChatAdapter extends RecyclerView.Adapter<ChatAdapter.ViewHolder> {
        private final List<AiMessage> items;

        public ChatAdapter(List<AiMessage> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_ai_chat_message, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            AiMessage msg = items.get(position);
            if (msg.isUser) {
                holder.layoutUser.setVisibility(View.VISIBLE);
                holder.layoutAi.setVisibility(View.GONE);
                holder.tvUserText.setText(msg.text);
                holder.tvUserTime.setText(msg.time);
            } else {
                holder.layoutUser.setVisibility(View.GONE);
                holder.layoutAi.setVisibility(View.VISIBLE);
                holder.tvAiText.setText(msg.text);
                holder.tvAiTime.setText(msg.time);
                if (msg.modelBadge != null) {
                    holder.tvAiBadge.setText(msg.modelBadge);
                    holder.tvAiBadge.setVisibility(View.VISIBLE);
                } else {
                    holder.tvAiBadge.setVisibility(View.GONE);
                }
            }
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            View layoutUser, layoutAi;
            TextView tvUserText, tvUserTime;
            TextView tvAiText, tvAiTime, tvAiBadge;

            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                layoutUser = itemView.findViewById(R.id.layout_user_msg);
                layoutAi = itemView.findViewById(R.id.layout_ai_msg);
                tvUserText = itemView.findViewById(R.id.tv_user_text);
                tvUserTime = itemView.findViewById(R.id.tv_user_time);
                tvAiText = itemView.findViewById(R.id.tv_ai_text);
                tvAiTime = itemView.findViewById(R.id.tv_ai_time);
                tvAiBadge = itemView.findViewById(R.id.tv_ai_badge);
            }
        }
    }
}
