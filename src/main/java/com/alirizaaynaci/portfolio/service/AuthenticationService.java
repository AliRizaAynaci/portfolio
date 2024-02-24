package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.User;
import com.alirizaaynaci.portfolio.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private boolean adminExists = false;

    private final UserRepository userRepository;

    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean authenticate(String username, String password) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getPassword().equals(password);
    }

    public boolean getAdminExists() {
        return adminExists;
    }

    public void setAdminExists(boolean adminExists) {
        this.adminExists = adminExists;
    }
}
