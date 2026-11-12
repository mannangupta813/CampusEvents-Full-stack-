package com.campusevents.service;

import com.campusevents.model.Club;
import com.campusevents.model.User;
import com.campusevents.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubService {

    @Autowired
    private ClubRepository clubRepository;

    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    public Club getClubById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Club not found with ID: " + id));
    }

    public List<Club> getClubsByLeadUser(Long userId) {
        return clubRepository.findByLeadUserId(userId);
    }

    public Club createClub(Club club, User leadUser) {
        if (leadUser != null) {
            club.setLeadUser(leadUser);
        }
        return clubRepository.save(club);
    }
}
