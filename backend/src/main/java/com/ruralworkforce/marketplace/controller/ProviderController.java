package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.JobResponse;
import com.ruralworkforce.marketplace.dto.ProviderProfileResponse;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.service.JobService;
import com.ruralworkforce.marketplace.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/providers")
public class ProviderController {

    private final UserRepository userRepository;
    private final ReviewService reviewService;
    private final JobService jobService;

    public ProviderController(UserRepository userRepository, ReviewService reviewService, JobService jobService) {
        this.userRepository = userRepository;
        this.reviewService = reviewService;
        this.jobService = jobService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> getProvider(@PathVariable Long id) {
        User provider = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Provider not found"));

        int completion = 0;
        if (provider.getName() != null && !provider.getName().isBlank()) completion += 25;
        if (provider.getBio() != null && !provider.getBio().isBlank()) completion += 25;
        if (provider.getProfileImageUrl() != null && !provider.getProfileImageUrl().isBlank()) completion += 25;
        if (provider.getLocation() != null && !provider.getLocation().isBlank()) completion += 25;

        return ResponseEntity.ok(ProviderProfileResponse.builder()
                .id(provider.getId())
                .name(provider.getName())
                .phone(provider.getPhone())
                .profileImageUrl(provider.getProfileImageUrl())
                .rating(provider.getRating())
                .totalJobsPosted(provider.getTotalJobsPosted())
                .totalJobsCompleted(provider.getTotalJobsCompleted())
                .bio(provider.getBio())
                .businessName(provider.getBusinessName())
                .location(provider.getLocation())
                .verified(provider.getVerified())
                .profileCompletion(completion)
                .recentReviews(reviewService.getWorkerReviews(id))
                .build());
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<JobResponse>> getProviderJobs(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobsByProvider(id));
    }
}
