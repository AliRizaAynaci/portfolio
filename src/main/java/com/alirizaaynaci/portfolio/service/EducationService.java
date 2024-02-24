package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.Education;
import com.alirizaaynaci.portfolio.repository.EducationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    public List<Education> getAllEducation() {
        return educationRepository.findAll();
    }

    public Optional<Education> getEducationById(Long educationId) {
        return educationRepository.findById(educationId);
    }

    public Education createEducation(Education education) {
        return educationRepository.save(education);
    }



}
