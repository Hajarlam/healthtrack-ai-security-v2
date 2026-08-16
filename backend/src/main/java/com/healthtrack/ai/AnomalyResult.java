package com.healthtrack.ai;
import java.util.List;
public class AnomalyResult {
    private RiskLevel riskLevel;
    private List<String> anomalies;
    private String trend;
    private List<String> recommendations;
    private double confidenceScore;

    public AnomalyResult(RiskLevel r, List<String> a, String t, List<String> rec, double c) {
        riskLevel=r; anomalies=a; trend=t; recommendations=rec; confidenceScore=c;
    }
    public RiskLevel getRiskLevel()        { return riskLevel; }
    public List<String> getAnomalies()     { return anomalies; }
    public String getTrend()               { return trend; }
    public List<String> getRecommendations(){ return recommendations; }
    public double getConfidenceScore()     { return confidenceScore; }
    public enum RiskLevel { NORMAL, WARNING, CRITICAL }
}
