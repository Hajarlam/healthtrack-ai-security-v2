package com.healthtrack.config;
import com.healthtrack.entity.User;
import com.healthtrack.entity.HealthRecord;
import com.healthtrack.repository.UserRepository;
import com.healthtrack.repository.HealthRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.logging.Logger;
@Configuration
public class DataInitializer {
    private static final Logger log=Logger.getLogger(DataInitializer.class.getName());
    @Bean CommandLineRunner init(UserRepository repo, HealthRecordRepository hrRepo, PasswordEncoder enc){
        return args->{
            if(!repo.existsByEmail("admin@healthtrack.ai")){repo.save(User.builder().email("admin@healthtrack.ai").password(enc.encode("Admin@123")).firstName("Admin").lastName("HealthTrack").role(User.Role.ADMIN).enabled(true).build());log.info("ADMIN: admin@healthtrack.ai / Admin@123");}
            if(!repo.existsByEmail("doctor@healthtrack.ai")){repo.save(User.builder().email("doctor@healthtrack.ai").password(enc.encode("Doctor@123")).firstName("Dr. Ahmed").lastName("Bennani").role(User.Role.DOCTOR).enabled(true).specialization("Cardiologie").hospital("CHU Rabat").build());log.info("DOCTOR 1: doctor@healthtrack.ai / Doctor@123");}
            if(!repo.existsByEmail("doctor2@healthtrack.ai")){repo.save(User.builder().email("doctor2@healthtrack.ai").password(enc.encode("Doctor@123")).firstName("Dr. Sophie").lastName("Laurent").role(User.Role.DOCTOR).enabled(true).specialization("Pédiatrie").hospital("Hôpital Ibn Sina").build());log.info("DOCTOR 2: doctor2@healthtrack.ai / Doctor@123");}
            if(!repo.existsByEmail("patient@healthtrack.ai")){
                User p = repo.save(User.builder().email("patient@healthtrack.ai").password(enc.encode("Patient@123")).firstName("Sara").lastName("El Amrani").role(User.Role.PATIENT).enabled(true).bloodType("A+").height(165.0).weight(62.0).chronicDiseases("Hypertension").build());
                log.info("PATIENT 1: patient@healthtrack.ai / Patient@123");
                
                hrRepo.save(HealthRecord.builder().patient(p).systolicBP(120.0).diastolicBP(80.0).heartRate(72.0).bloodGlucose(95.0).oxygenSaturation(98.0).temperature(36.6).notes("Mesure à jeun").source("PATIENT").build());
                hrRepo.save(HealthRecord.builder().patient(p).systolicBP(130.0).diastolicBP(84.0).heartRate(75.0).bloodGlucose(105.0).oxygenSaturation(97.0).temperature(36.7).notes("Après le déjeuner").source("PATIENT").build());
                hrRepo.save(HealthRecord.builder().patient(p).systolicBP(142.0).diastolicBP(88.0).heartRate(80.0).bloodGlucose(110.0).oxygenSaturation(97.0).temperature(36.8).notes("Légère fatigue").source("PATIENT").build());
                hrRepo.save(HealthRecord.builder().patient(p).systolicBP(125.0).diastolicBP(82.0).heartRate(74.0).bloodGlucose(98.0).oxygenSaturation(98.0).temperature(36.5).notes("RAS").source("PATIENT").build());
            }
            if(!repo.existsByEmail("patient2@healthtrack.ai")){
                User p2 = repo.save(User.builder().email("patient2@healthtrack.ai").password(enc.encode("Patient@123")).firstName("Jean").lastName("Martin").role(User.Role.PATIENT).enabled(true).bloodType("O-").height(180.0).weight(75.0).chronicDiseases("Diabète").build());
                log.info("PATIENT 2: patient2@healthtrack.ai / Patient@123");
                
                hrRepo.save(HealthRecord.builder().patient(p2).systolicBP(118.0).diastolicBP(76.0).heartRate(68.0).bloodGlucose(145.0).oxygenSaturation(99.0).temperature(36.5).notes("Glycémie post-prandiale élevée").source("PATIENT").build());
                hrRepo.save(HealthRecord.builder().patient(p2).systolicBP(120.0).diastolicBP(78.0).heartRate(70.0).bloodGlucose(98.0).oxygenSaturation(98.0).temperature(36.7).notes("À jeun").source("PATIENT").build());
            }
            if(!repo.existsByEmail("emergency@healthtrack.ai")){repo.save(User.builder().email("emergency@healthtrack.ai").password(enc.encode("Emergency@123")).firstName("Secours").lastName("Urgences").role(User.Role.EMERGENCY).enabled(true).build());log.info("EMERGENCY: emergency@healthtrack.ai / Emergency@123");}
        };
    }
}
