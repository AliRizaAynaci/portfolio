package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.model.Experience;
import com.alirizaaynaci.portfolio.model.Profile;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.ProfileService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;


@Controller
public class ProfileController {

    private final ProfileService profileService;
    private final AuthenticationService authenticationService;
    private final CommonService commonService;

    public ProfileController(ProfileService profileService, AuthenticationService authenticationService,
                             CommonService commonService) {
        this.profileService = profileService;
        this.authenticationService = authenticationService;
        this.commonService = commonService;
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        commonService.prepareModelForProfile(model);
        return "profile";
    }

    @GetMapping("/admin-profile")
    public String adminProfilePage(Model model) {
        commonService.prepareModelForProfile(model);
        return "admin-profile";
    }

    @GetMapping("/admin/create-profile")
    public String createProfileForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("profile", new Profile());
            return "createProfile";
        }
        return "redirect:/";
    }

    @GetMapping("/admin/update-profile-form")
    public String updateprofile(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("profile", new Profile());
            return "updateProfile";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-profile")
    public String createProfile(@ModelAttribute Profile profile, Model model) {
        profileService.createProfile(profile);
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            return "redirect:/admin-profile";
        }
        return "redirect:/profile";
    }

    @PostMapping("/admin/update-profile")
    public String updateProfile(@ModelAttribute Profile updatedProfile, Model model) {
        profileService.updateProfile(updatedProfile);
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            return "redirect:/admin-profile";
        }
        return "redirect:/profile";
    }
}
