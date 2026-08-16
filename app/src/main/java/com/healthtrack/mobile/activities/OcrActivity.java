package com.healthtrack.mobile.activities;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.*;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.bumptech.glide.Glide;
import com.healthtrack.mobile.R;
import com.healthtrack.mobile.api.ApiClient;
import com.healthtrack.mobile.api.ApiService;
import com.healthtrack.mobile.models.MedicationImportRequest;
import com.healthtrack.mobile.models.Medication;
import com.healthtrack.mobile.models.OcrResult;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;

public class OcrActivity extends AppCompatActivity {

    private ImageView ivPreview;
    private TextView tvPlaceholder, tvRawText, tvError;
    private com.google.android.material.textfield.TextInputEditText etDoctor, etDate, etMedications;
    private Button btnCamera, btnGallery, btnToggleRaw;
    private com.google.android.material.button.MaterialButton btnAnalyze, btnImport;
    private ProgressBar progressBar;
    private androidx.cardview.widget.CardView cardResult;

    private Uri selectedImageUri;
    private File selectedImageFile;

    private ActivityResultLauncher<Uri> cameraLauncher;
    private ActivityResultLauncher<String> galleryLauncher;
    private ActivityResultLauncher<String> cameraPermissionLauncher;
    private Uri pendingCameraUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ocr);

        ivPreview      = findViewById(R.id.iv_preview);
        tvPlaceholder  = findViewById(R.id.tv_placeholder);
        tvRawText      = findViewById(R.id.tv_raw_text);
        tvError        = findViewById(R.id.tv_error);
        etDoctor       = findViewById(R.id.et_doctor);
        etDate         = findViewById(R.id.et_date);
        etMedications  = findViewById(R.id.et_medications);
        btnCamera      = findViewById(R.id.btn_camera);
        btnGallery     = findViewById(R.id.btn_gallery);
        btnToggleRaw   = findViewById(R.id.btn_toggle_raw);
        btnAnalyze     = findViewById(R.id.btn_analyze);
        btnImport      = findViewById(R.id.btn_import);
        progressBar    = findViewById(R.id.progress_bar);
        cardResult     = findViewById(R.id.card_result);

        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        btnToggleRaw.setOnClickListener(v -> {
            boolean show = tvRawText.getVisibility() != View.VISIBLE;
            tvRawText.setVisibility(show ? View.VISIBLE : View.GONE);
            btnToggleRaw.setText(show ? "Masquer le texte brut" : "Voir le texte brut detecte par l'IA");
        });

        registerLaunchers();

        btnCamera.setOnClickListener(v -> requestCameraAndLaunch());
        btnGallery.setOnClickListener(v -> galleryLauncher.launch("image/*"));
        btnAnalyze.setOnClickListener(v -> analyze());
        btnImport.setOnClickListener(v -> importMedications());
    }

    private void registerLaunchers() {
        cameraLauncher = registerForActivityResult(new ActivityResultContracts.TakePicture(), success -> {
            if (success && pendingCameraUri != null) {
                selectedImageUri = pendingCameraUri;
                showPreview(selectedImageUri);
            }
        });

        galleryLauncher = registerForActivityResult(new ActivityResultContracts.GetContent(), uri -> {
            if (uri != null) {
                selectedImageUri = uri;
                showPreview(uri);
            }
        });

        cameraPermissionLauncher = registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            if (granted) launchCamera();
            else Toast.makeText(this, "Permission camera refusee", Toast.LENGTH_SHORT).show();
        });
    }

    private void requestCameraAndLaunch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            launchCamera();
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void launchCamera() {
        try {
            File dir = new File(getCacheDir(), "images");
            if (!dir.exists()) dir.mkdirs();
            File photoFile = new File(dir, "ordonnance_" + System.currentTimeMillis() + ".jpg");
            pendingCameraUri = FileProvider.getUriForFile(
                this, getPackageName() + ".fileprovider", photoFile);
            cameraLauncher.launch(pendingCameraUri);
        } catch (Exception e) {
            Toast.makeText(this, "Erreur camera: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void showPreview(Uri uri) {
        ivPreview.setVisibility(View.VISIBLE);
        tvPlaceholder.setVisibility(View.GONE);
        Glide.with(this).load(uri).into(ivPreview);
        btnAnalyze.setEnabled(true);
        cardResult.setVisibility(View.GONE);
        tvError.setVisibility(View.GONE);
    }

    /** Copies the selected image into a real File so it can be streamed as multipart body. */
    private File resolveFile() throws Exception {
        if (selectedImageFile != null && selectedImageFile.exists()) return selectedImageFile;
        Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), selectedImageUri);
        File dir = new File(getCacheDir(), "images");
        if (!dir.exists()) dir.mkdirs();
        File file = new File(dir, "upload_" + System.currentTimeMillis() + ".jpg");
        try (FileOutputStream fos = new FileOutputStream(file)) {
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, fos);
        }
        selectedImageFile = file;
        return file;
    }

    private MultipartBody.Part buildFilePart() throws Exception {
        File file = resolveFile();
        RequestBody body = RequestBody.create(file, MediaType.parse("image/jpeg"));
        return MultipartBody.Part.createFormData("file", file.getName(), body);
    }

    private void analyze() {
        progressBar.setVisibility(View.VISIBLE);
        cardResult.setVisibility(View.GONE);
        tvError.setVisibility(View.GONE);
        btnAnalyze.setEnabled(false);

        try {
            MultipartBody.Part part = buildFilePart();
            ApiClient.getInstance(this).create(ApiService.class).analyzeOcr(part)
                .enqueue(new Callback<OcrResult>() {
                    @Override
                    public void onResponse(Call<OcrResult> call, Response<OcrResult> response) {
                        progressBar.setVisibility(View.GONE);
                        btnAnalyze.setEnabled(true);
                        if (response.isSuccessful() && response.body() != null) {
                            displayResult(response.body());
                        } else {
                            showError("Erreur serveur (" + response.code() + ")");
                        }
                    }
                    @Override
                    public void onFailure(Call<OcrResult> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        btnAnalyze.setEnabled(true);
                        showError("Erreur reseau: " + t.getMessage());
                    }
                });
        } catch (Exception e) {
            progressBar.setVisibility(View.GONE);
            btnAnalyze.setEnabled(true);
            showError("Impossible de lire l'image: " + e.getMessage());
        }
    }

    private void displayResult(OcrResult result) {
        if (!result.isSuccess()) {
            showError(result.getErrorMessage() != null ? result.getErrorMessage() : "Analyse impossible.");
            return;
        }
        cardResult.setVisibility(View.VISIBLE);

        etDoctor.setText(isDetected(result.getDoctorName()) ? result.getDoctorName() : "");
        etDate.setText(isDetected(result.getPrescriptionDate()) ? result.getPrescriptionDate() : "");

        StringBuilder meds = new StringBuilder();
        if (result.getDetectedMedications() != null) {
            List<String> names = result.getDetectedMedications();
            List<String> dosages = result.getDetectedDosages();
            for (int i = 0; i < names.size(); i++) {
                if (names.get(i).contains("Aucun")) continue; // rien a pre-remplir, l'utilisateur saisit manuellement
                String dosage = (dosages != null && i < dosages.size()) ? dosages.get(i) : "";
                meds.append(names.get(i));
                if (dosage != null && !dosage.isBlank() && !dosage.equals("Voir ordonnance")) {
                    meds.append(" - ").append(dosage);
                }
                meds.append("\n");
            }
        }
        etMedications.setText(meds.toString());
        etMedications.setHint("Ex: Amoxicilline 500mg - 3x/jour");

        tvRawText.setText(result.getRawText() != null ? result.getRawText() : "");
        tvRawText.setVisibility(View.GONE);
        btnToggleRaw.setText("Voir le texte brut detecte par l'IA");
    }

    private boolean isDetected(String v) {
        return v != null && !v.isBlank() && !v.startsWith("Non detect");
    }

    /** Parses the editable "Nom - Posologie" textarea into structured entries for import. */
    private List<MedicationImportRequest.Entry> parseEditedMedications() {
        List<MedicationImportRequest.Entry> entries = new ArrayList<>();
        String raw = etMedications.getText() != null ? etMedications.getText().toString() : "";
        for (String line : raw.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            String name, dosage;
            int sep = trimmed.indexOf(" - ");
            if (sep != -1) {
                name = trimmed.substring(0, sep).trim();
                dosage = trimmed.substring(sep + 3).trim();
            } else {
                name = trimmed;
                dosage = "Voir ordonnance";
            }
            if (!name.isEmpty()) entries.add(new MedicationImportRequest.Entry(name, dosage));
        }
        return entries;
    }

    private void importMedications() {
        List<MedicationImportRequest.Entry> entries = parseEditedMedications();
        if (entries.isEmpty()) {
            Toast.makeText(this, "Ajoutez au moins un medicament avant d'importer.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnImport.setEnabled(false);
        String doctor = etDoctor.getText() != null ? etDoctor.getText().toString().trim() : "";
        String date   = etDate.getText() != null ? etDate.getText().toString().trim() : "";

        MedicationImportRequest request = new MedicationImportRequest(
            doctor.isEmpty() ? "Non detecte" : doctor,
            date.isEmpty() ? "Non detectee" : date,
            entries
        );

        ApiClient.getInstance(this).create(ApiService.class).confirmOcrImport(request)
            .enqueue(new Callback<List<Medication>>() {
                @Override
                public void onResponse(Call<List<Medication>> call, Response<List<Medication>> response) {
                    btnImport.setEnabled(true);
                    if (response.isSuccessful() && response.body() != null) {
                        Toast.makeText(OcrActivity.this,
                            response.body().size() + " medicament(s) importe(s) !",
                            Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(OcrActivity.this, "Erreur importation", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<List<Medication>> call, Throwable t) {
                    btnImport.setEnabled(true);
                    Toast.makeText(OcrActivity.this, "Erreur reseau", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void showError(String message) {
        tvError.setVisibility(View.VISIBLE);
        tvError.setText(message);
    }
}
