package com.campusevents.repository;

import com.campusevents.model.Registration;
import com.campusevents.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByUserIdOrderByRegisteredAtDesc(Long userId);

    List<Registration> findByEventIdOrderByRegisteredAtDesc(Long eventId);

    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    Optional<Registration> findByQrToken(String qrToken);

    Optional<Registration> findByRegistrationNumber(String registrationNumber);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    long countByEventId(Long eventId);
}
