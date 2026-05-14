package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.ReviewRequest;
import com.ruralworkforce.marketplace.dto.ReviewResponse;
import com.ruralworkforce.marketplace.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * POST /reviews
     * Provider submits a review for a completed booking.
     */
    @PostMapping("/reviews")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ReviewResponse> submitReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        Long reviewerId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitReview(request, reviewerId));
    }

    /**
     * GET /workers/{id}/reviews
     * Returns all reviews for a worker.
     */
    @GetMapping("/workers/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getWorkerReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getWorkerReviews(id));
    }
}
