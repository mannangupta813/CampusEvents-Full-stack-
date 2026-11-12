package com.campusevents.repository;

import com.campusevents.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEventIdOrderByCheckedInAtDesc(Long eventId);

    Optional<Attendance> findByRegistrationId(Long registrationId);

    boolean existsByRegistrationId(Long registrationId);

    long countByEventId(Long eventId);
}
