package com.healthtrack.ai;
import java.time.LocalDateTime;
public class ChatbotResponse {
    private String answer;
    private String disclaimer;
    private LocalDateTime timestamp;
    private String model;

    public ChatbotResponse(String a, String model) {
        this.answer      = a;
        this.model       = model;
        this.timestamp   = LocalDateTime.now();
        this.disclaimer  = "AVERTISSEMENT: Cette reponse est fournie a titre informatif uniquement. " +
                           "Elle ne remplace pas un avis medical professionnel. " +
                           "Consultez toujours un medecin pour tout diagnostic ou traitement.";
    }
    public String getAnswer()      { return answer; }
    public String getDisclaimer()  { return disclaimer; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getModel()       { return model; }
}
