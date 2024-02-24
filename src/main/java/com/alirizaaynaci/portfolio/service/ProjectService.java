package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.Project;
import com.alirizaaynaci.portfolio.repository.PostRepository;
import com.alirizaaynaci.portfolio.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAllProject() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }




}
