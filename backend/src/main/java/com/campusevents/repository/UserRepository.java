package com.campusevents.repository;

import com.campusevents.model.Role;
import com.campusevents.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByRollNo(String rollNo);
    List<User> findByRole(Role role);
    long countByRole(Role role);
}
