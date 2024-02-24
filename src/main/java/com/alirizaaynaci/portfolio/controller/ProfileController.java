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


    @PostMapping("/alirizaaynaci/update")
    public String updateProfile(@ModelAttribute Profile updatedProfile) {
        profileService.updateProfile(updatedProfile);
        return "redirect:/alirizaaynaci";
    }

    @GetMapping("/admin/create-profile")
    public String createExperienceForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("profile", new Profile());
            return "createProfile";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-profile")
    public String createProfile(@ModelAttribute Profile profile) {
        profileService.createProfile(profile);
        return "redirect:/profile";
    }
}
