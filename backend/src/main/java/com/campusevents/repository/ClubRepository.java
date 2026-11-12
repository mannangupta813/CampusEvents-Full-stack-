package com.campusevents.repository;

import com.campusevents.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findByName(String name);
    List<Club> findByLeadUserId(Long leadUserId);
    List<Club> findByCategory(String category);
}
