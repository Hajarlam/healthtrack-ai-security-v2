package com.healthtrack.repository;
import com.healthtrack.entity.HealthRecord;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime; import java.util.List;
@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord,Long> {
    Page<HealthRecord> findByPatientIdOrderByRecordedAtDesc(Long patientId, Pageable p);
    List<HealthRecord> findByPatientIdAndRecordedAtBetweenOrderByRecordedAtAsc(Long pid, LocalDateTime s, LocalDateTime e);
    @Query("SELECT h FROM HealthRecord h WHERE h.patient.id=:pid ORDER BY h.recordedAt DESC")
    List<HealthRecord> findLatestByPatient(Long pid, Pageable p);
}
