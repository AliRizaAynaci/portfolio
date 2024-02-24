package com.alirizaaynaci.portfolio.controller;


import com.alirizaaynaci.portfolio.model.Education;
import com.alirizaaynaci.portfolio.model.Project;
import com.alirizaaynaci.portfolio.repository.UserRepository;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;
    private final CommonService commonService;

    public ProjectController(ProjectService projectService, UserRepository userRepository,
                             AuthenticationService authenticationService, CommonService commonService) {
        this.projectService = projectService;
        this.userRepository = userRepository;
        this.authenticationService = authenticationService;
        this.commonService = commonService;
    }

    @GetMapping("/projects")
    public String projects(Model model) {
        commonService.prepareModel(model);
        return "projects";
    }


    @GetMapping("/projects/{projectId}")
    public String getProjectById(@PathVariable Long projectId, Model model) {
        Optional<Project> projects = projectService.getProjectById(projectId);
        projects.ifPresent(project -> model.addAttribute("project", project));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "project-details";
    }


    @GetMapping("/admin/create-project")
    public String createProjectForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("project", new Project());
            return "createProject";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-project")
    public String createProject(@ModelAttribute Project project) {
        projectService.createProject(project);
        return "redirect:/projects";
    }










}
