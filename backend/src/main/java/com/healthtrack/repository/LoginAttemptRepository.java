package com.healthtrack.repository;
import com.healthtrack.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt,Long> {
    @Query("SELECT COUNT(a) FROM LoginAttempt a WHERE a.email=:email AND a.success=false AND a.attemptTime > :since")
    long countFailedAttempts(String email, LocalDateTime since);
    @Query("SELECT COUNT(a) FROM LoginAttempt a WHERE a.ipAddress=:ip AND a.success=false AND a.attemptTime > :since")
    long countFailedByIp(String ip, LocalDateTime since);
}
