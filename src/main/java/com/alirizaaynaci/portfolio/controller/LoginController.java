package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.LoginService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    private final LoginService loginService;

    private final AuthenticationService authenticationService;

    public LoginController(LoginService loginService, AuthenticationService authenticationService) {
        this.loginService = loginService;
        this.authenticationService = authenticationService;
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, Model model) {
        if (authenticationService.authenticate(username, password)) {
            return "redirect:/admin-home";
        } else {
            return "redirect:/login?error";
        }
    }
}
