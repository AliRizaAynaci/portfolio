package com.alirizaaynaci.portfolio.controller;


import com.alirizaaynaci.portfolio.model.Education;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.EducationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Optional;

@Controller
public class EducationController {

    private final EducationService educationService;
    private final AuthenticationService authenticationService;
    private final CommonService commonService;

    public EducationController(EducationService educationService, AuthenticationService authenticationService,
                               CommonService commonService) {
        this.educationService = educationService;
        this.authenticationService = authenticationService;
        this.commonService = commonService;
    }

    @GetMapping("/educations")
    public String educationPage(Model model) {
        commonService.prepareModel(model);
        return "educations";
    }
    @GetMapping("/admin-educations")
    public String adminEducationPage(Model model) {
        commonService.prepareModel(model);
        return "admin-educations";
    }

    @GetMapping("/educations/{educationId}")
    public String getEducationById(@PathVariable Long educationId, Model model) {
        Optional<Education> education = educationService.getEducationById(educationId);
        education.ifPresent(edu -> model.addAttribute("education", edu));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "education-details";
    }

    @GetMapping("/admin-educations/{educationId}")
    public String getEducationByIdForAdmin(@PathVariable Long educationId, Model model) {
        Optional<Education> education = educationService.getEducationById(educationId);
        education.ifPresent(edu -> model.addAttribute("education", edu));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "admin-education-details";
    }

    @GetMapping("/admin/create-education")
    public String createEducationForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("education", new Education());
            return "createEducation";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-education")
    public String createEducation(@ModelAttribute Education education, Model model) {
        educationService.createEducation(education);
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminEsists", authenticationService.getAdminExists());
            return "redirect:/admin-educations";
        }
        return "redirect:/educations";
    }


}
