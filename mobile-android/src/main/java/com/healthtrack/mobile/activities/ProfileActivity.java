package com.healthtrack.mobile.activities;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.utils.SessionManager;

public class ProfileActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        SessionManager s = SessionManager.getInstance(this);
        ((TextView)findViewById(R.id.tv_name)).setText(s.getFullName());
        ((TextView)findViewById(R.id.tv_email)).setText(s.getEmail());
        ((TextView)findViewById(R.id.tv_role)).setText(s.getRole());
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
    }
}
