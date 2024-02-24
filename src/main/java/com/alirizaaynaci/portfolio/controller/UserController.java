package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.service.AuthenticationService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserController {

    private final AuthenticationService authenticationService;

    public UserController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @GetMapping("/admin")
    public String adminPage(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            return "admin";
        }
        return "redirect:/";
    }
}
