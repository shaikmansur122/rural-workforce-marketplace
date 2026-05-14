package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.UpdateWorkerProfileRequest;
import com.ruralworkforce.marketplace.dto.WorkerCardResponse;
import com.ruralworkforce.marketplace.dto.WorkerProfileResponse;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/workers")
public class WorkerController {

    private final WorkerService workerService;
    private final UserRepository userRepository;

    public WorkerController(WorkerService workerService, UserRepository userRepository) {
        this.workerService = workerService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<WorkerCardResponse>> listWorkers(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) java.math.BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(workerService.searchWorkers(skill, minRating, page, size));
    }

    /** GET /workers/nearby?lat=&lng=&radius=&skill=&minRating= */
    @GetMapping("/nearby")
    public ResponseEntity<java.util.List<WorkerCardResponse>> getNearbyWorkers(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "25") double radius,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) java.math.BigDecimal minRating) {
        return ResponseEntity.ok(workerService.getNearbyWorkers(lat, lng, radius, skill, minRating));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerProfileResponse> getWorker(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerProfile(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<WorkerProfileResponse> updateWorkerProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkerProfileRequest request,
            Authentication authentication) {
        Long requesterId = (Long) authentication.getPrincipal();
        if (!requesterId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Worker not found"));

        user.setName(request.getName());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvailability() != null) user.setAvailability(request.getAvailability());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getDailyWage() != null) user.setDailyWage(request.getDailyWage());
        if (request.getLanguages() != null) user.setLanguages(request.getLanguages());
        if (request.getBusinessName() != null) user.setBusinessName(request.getBusinessName());

        userRepository.save(user);
        return ResponseEntity.ok(workerService.getWorkerProfile(id));
    }
}
