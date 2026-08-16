package com.healthtrack.mobile.api;

import com.healthtrack.mobile.utils.SessionManager;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import android.content.Context;
import java.util.concurrent.TimeUnit;

public class ApiClient {
    // IMPORTANT : remplace l'IP et le port ci-dessous par ceux de TON ordinateur/serveur backend.
    // - Emulateur Android Studio  -> "http://10.0.2.2:8085/api/"   (8085 = port de ton backend)
    // - Téléphone physique (même Wi-Fi que ton PC) -> "http://<IP_LOCALE_DE_TON_PC>:8085/api/"
    //   (trouve ton IP locale avec `ipconfig` sous Windows ou `ifconfig`/`ip a` sous Mac/Linux, ex: 192.168.1.20)
    // Le crash venait d'ici : "PORT" n'était pas un numéro de port valide, ce qui rendait
    // l'URL invalide et faisait planter l'app dès que tu cliquais sur "Se connecter".
    public static final String BASE_URL = "http://192.168.1.20:8085/api/";

    private static Retrofit retrofit;

    public static Retrofit getInstance(Context context) {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    String token = SessionManager.getInstance(context).getToken();
                    Request original = chain.request();
                    Request.Builder builder = original.newBuilder();
                    if (token != null && !token.isEmpty()) {
                        builder.header("Authorization", "Bearer " + token);
                    }
                    builder.header("Content-Type", "application/json");
                    return chain.proceed(builder.build());
                })
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();

            retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        }
        return retrofit;
    }

    public static void reset() { retrofit = null; }
}
