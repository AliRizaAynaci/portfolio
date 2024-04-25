package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.Post;
import com.alirizaaynaci.portfolio.model.Profile;
import com.alirizaaynaci.portfolio.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<Profile> getProfile() {
        return profileRepository.findAll();
    }

    public Profile findProfileByUsername(String username) {
        return profileRepository.findByUsername(username);
    }


    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    public Profile updateProfile(Profile updatedProfile) {
        Long profileId = 1L;
        Optional<Profile> existingProfileOptional = profileRepository.findById(profileId);

        if (existingProfileOptional != null) {
            Profile existingProfile = existingProfileOptional.get();
            existingProfile.setUsername(updatedProfile.getUsername());
            existingProfile.setGithubUrl(updatedProfile.getGithubUrl());
            existingProfile.setEmailAddress(updatedProfile.getEmailAddress());
            existingProfile.setLinkedinUrl(updatedProfile.getLinkedinUrl());

            return profileRepository.save(existingProfile);
        } else {
            throw new RuntimeException("Profile not found with id: " + profileId);
        }
    }

}
