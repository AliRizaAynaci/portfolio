package com.alirizaaynaci.portfolio.controller;


import com.alirizaaynaci.portfolio.model.Experience;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.ExperienceService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Optional;

@Controller
public class ExperienceController {

    private final AuthenticationService authenticationService;
    private final CommonService commonService;
    private final ExperienceService experienceService;

    public ExperienceController(AuthenticationService authenticationService,
                                CommonService commonService, ExperienceService experienceService) {
        this.authenticationService = authenticationService;
        this.commonService = commonService;
        this.experienceService = experienceService;
    }

    @GetMapping("/experiences")
    public String experiencePage(Model model) {
        commonService.prepareModel(model);
        return "experiences";
    }

    @GetMapping("/experiences/{experienceId}")
    public String getExperienceById(@PathVariable Long experienceId, Model model) {
        Optional<Experience> experiences = experienceService.getExperienceById(experienceId);
        experiences.ifPresent(experience -> model.addAttribute("experiences", experience));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "experience-details";
    }

    @GetMapping("/admin/create-experience")
    public String createExperienceForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("experience", new Experience());
            return "createExperience";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-experience")
    public String createEducation(@ModelAttribute Experience experience) {
        experienceService.createExperience(experience);
        return "redirect:/experiences";
    }
}
