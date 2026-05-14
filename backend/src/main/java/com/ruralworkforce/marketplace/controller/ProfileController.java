package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.ProfileResponse;
import com.ruralworkforce.marketplace.dto.UpdateLocationRequest;
import com.ruralworkforce.marketplace.dto.UpdateProfileRequest;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getBio() != null) user.setBio(request.getBio());

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    /** PUT /profile/location — save user's current lat/lng */
    @PutMapping("/location")
    public ResponseEntity<ProfileResponse> updateLocation(
            @RequestBody UpdateLocationRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getLatitude() != null) user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) user.setLongitude(request.getLongitude());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());

        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .rating(user.getRating())
                .skills(user.getSkills())
                .profileImageUrl(user.getProfileImageUrl())
                .experienceYears(user.getExperienceYears())
                .bio(user.getBio())
                .totalJobsCompleted(user.getTotalJobsCompleted())
                .totalJobsPosted(user.getTotalJobsPosted())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .city(user.getCity())
                .state(user.getState())
                .build();
    }
}
