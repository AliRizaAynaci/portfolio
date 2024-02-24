package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.*;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.util.Collections;
import java.util.List;

@Service
public class CommonService {

    private final ExperienceService experienceService;
    private final PostService postService;
    private final EducationService educationService;
    private final ProjectService projectService;
    private final AuthenticationService authenticationService;
    private final ProfileService profileService;

    public CommonService (ExperienceService experienceService, PostService postService,
                          EducationService educationService, ProjectService projectService,
                          AuthenticationService authenticationService, ProfileService profileService) {
        this.experienceService = experienceService;
        this.postService = postService;
        this.educationService = educationService;
        this.projectService = projectService;
        this.authenticationService = authenticationService;
        this.profileService = profileService;
    }

    public void prepareModel(Model model) {
        List<Post> posts = postService.getAllPost();
        Collections.reverse(posts);
        List<Education> educations = educationService.getAllEducation();
        List<Experience> experiences = experienceService.getAllExperiences();
        List<Project> projects = projectService.getAllProject();
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        model.addAttribute("posts", posts);
        model.addAttribute("educations", educations);
        model.addAttribute("experiences", experiences);
        model.addAttribute("projects", projects);
    }

    public void prepareModelForProfile(Model model) {
        List<Profile> profiles = profileService.getProfile();
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        if (!profiles.isEmpty()) {
            Profile profile = profiles.get(0);
            model.addAttribute("profile", profile);
        }
    }



}

