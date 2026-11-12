package com.campusevents.repository;

import com.campusevents.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByIsPublishedTrueAndIsCancelledFalseOrderByEventDateAsc();

    List<Event> findByClubId(Long clubId);

    List<Event> findByCategoryId(Long categoryId);

    @Query("SELECT e FROM Event e WHERE " +
           "(:categoryId IS NULL OR e.category.id = :categoryId) AND " +
           "(:clubId IS NULL OR e.club.id = :clubId) AND " +
           "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:upcomingOnly = false OR e.eventDate >= :today) AND " +
           "e.isPublished = true")
    List<Event> searchEvents(
            @Param("categoryId") Long categoryId,
            @Param("clubId") Long clubId,
            @Param("query") String query,
            @Param("upcomingOnly") boolean upcomingOnly,
            @Param("today") LocalDate today
    );

    long countByClubId(Long clubId);
}
