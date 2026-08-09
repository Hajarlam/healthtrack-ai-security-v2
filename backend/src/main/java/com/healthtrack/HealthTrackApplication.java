package com.healthtrack;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
@SpringBootApplication @EnableAsync
public class HealthTrackApplication {
    public static void main(String[] args) { SpringApplication.run(HealthTrackApplication.class, args); }
}
