package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.User;
import com.alirizaaynaci.portfolio.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginService {

    private final UserRepository userRepository;

    public LoginService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void saveUser(String username, String password) {
        User user = new User(username, password);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean validateLogin(String username, String password) {
        User user = userRepository.findByUsername(username);

        return user != null && user.getPassword().equals(password);
    }
}
