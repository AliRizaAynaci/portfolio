package com.alirizaaynaci.portfolio.repository;


import com.alirizaaynaci.portfolio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
