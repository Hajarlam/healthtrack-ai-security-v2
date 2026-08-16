package com.healthtrack.repository;
import com.healthtrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.*; 
@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.role='DOCTOR' AND u.enabled=true") List<User> findActiveDoctors();
    @Query("SELECT u FROM User u WHERE u.role='PATIENT' AND u.enabled=true") List<User> findActivePatients();
}
