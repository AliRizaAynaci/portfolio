package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.Experience;
import com.alirizaaynaci.portfolio.repository.ExperienceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    public ExperienceService(ExperienceRepository experienceRepository) {
        this.experienceRepository = experienceRepository;
    }

    public List<Experience> getAllExperiences() {
        return experienceRepository.findAll();
    }

    public Optional<Experience> getExperienceById(Long experienceId) {
        return experienceRepository.findById(experienceId);
    }

    public Experience createExperience(Experience experience) {
        return experienceRepository.save(experience);
    }


}
