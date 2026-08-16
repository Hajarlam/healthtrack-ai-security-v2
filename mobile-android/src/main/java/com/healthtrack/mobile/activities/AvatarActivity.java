package com.healthtrack.mobile.activities;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import com.healthtrack.mobile.R;

/**
 * Ecran "Conseiller Sante" : integre l'avatar IA interactif LiveAvatar via une WebView
 * securisee. Necessite la permission RECORD_AUDIO (declaree dans le Manifest) pour que
 * l'utilisateur puisse parler a l'avatar en direct — la WebView delegue l'acces micro
 * du navigateur via WebChromeClient.onPermissionRequest une fois l'autorisation Android accordee.
 */
public class AvatarActivity extends AppCompatActivity {

    private static final String AVATAR_URL =
        "https://embed.liveavatar.com/v1/66219ded-41c8-47de-a54e-9729508b570e?orientation=horizontal";

    private WebView webView;
    private View layoutLoading, layoutError;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_avatar);

        webView       = findViewById(R.id.webview);
        layoutLoading = findViewById(R.id.layout_loading);
        layoutError   = findViewById(R.id.layout_error);

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        findViewById(R.id.btn_retry).setOnClickListener(v -> {
            layoutError.setVisibility(View.GONE);
            layoutLoading.setVisibility(View.VISIBLE);
            requestMicAndLoad();
        });

        setupWebView();
        requestMicAndLoad();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Autorise l'acces micro demande par la page (WebRTC) une fois la permission Android accordee.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                layoutLoading.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    layoutLoading.setVisibility(View.GONE);
                    layoutError.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private final androidx.activity.result.ActivityResultLauncher<String> micPermissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            if (!granted) {
                Toast.makeText(this,
                    "Sans le micro, vous pouvez lire les reponses mais pas parler a l'avatar.",
                    Toast.LENGTH_LONG).show();
            }
            loadAvatar();
        });

    private void requestMicAndLoad() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED) {
            loadAvatar();
        } else {
            micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO);
        }
    }

    private void loadAvatar() {
        webView.loadUrl(AVATAR_URL);
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }
}
