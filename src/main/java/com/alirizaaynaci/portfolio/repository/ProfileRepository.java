package com.alirizaaynaci.portfolio.repository;

import com.alirizaaynaci.portfolio.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Profile findByUsername(String username);
}
