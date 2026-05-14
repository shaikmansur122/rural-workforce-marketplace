package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.CreateJobRequest;
import com.ruralworkforce.marketplace.dto.InterestResponse;
import com.ruralworkforce.marketplace.dto.JobResponse;
import com.ruralworkforce.marketplace.service.InterestService;
import com.ruralworkforce.marketplace.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final InterestService interestService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getOpenJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.getOpenJobs(page, size));
    }

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        JobResponse response = jobService.createJob(request, providerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<JobResponse>> getMyJobs(Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(jobService.getJobsByProvider(providerId));
    }

    @GetMapping("/{id}/interests")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<InterestResponse>> getInterests(
            @PathVariable Long id,
            Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        List<InterestResponse> interests = interestService.getInterestedWorkers(id, providerId);
        return ResponseEntity.ok(interests);
    }

    /** GET /jobs/nearby?lat=&lng=&radius=&skill=&minWage=&maxWage= */
    @GetMapping("/nearby")
    public ResponseEntity<List<JobResponse>> getNearbyJobs(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "25") double radius,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) BigDecimal minWage,
            @RequestParam(required = false) BigDecimal maxWage) {
        return ResponseEntity.ok(jobService.getNearbyJobs(lat, lng, radius, skill, minWage, maxWage));
    }
}
