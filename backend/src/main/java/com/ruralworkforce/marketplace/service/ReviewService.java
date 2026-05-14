package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.ReviewRequest;
import com.ruralworkforce.marketplace.dto.ReviewResponse;
import com.ruralworkforce.marketplace.entity.*;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.BookingRepository;
import com.ruralworkforce.marketplace.repository.ReviewRepository;
import com.ruralworkforce.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ReviewService handles:
 * - Submitting a review after a COMPLETED booking
 * - Preventing duplicate reviews per booking
 * - Recalculating and persisting the worker's average rating after each review
 * - Fetching all reviews for a worker
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, Long reviewerId) {
        // 1. Load booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        // 2. Only COMPLETED bookings can be reviewed
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only completed bookings can be reviewed");
        }

        // 3. Only the provider (job owner) can review
        Long providerId = booking.getJob().getProvider().getId();
        if (!providerId.equals(reviewerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the job provider can submit a review");
        }

        // 4. Prevent duplicate review per booking
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Review already submitted for this booking");
        }

        // 5. Validate rating range
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reviewer not found"));
        User worker = booking.getWorker();

        // 6. Persist review
        Review review = Review.builder()
                .booking(booking)
                .reviewer(reviewer)
                .worker(worker)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);

        // 7. Recalculate and update worker's average rating
        reviewRepository.findAverageRatingByWorkerId(worker.getId()).ifPresent(avg -> {
            worker.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            userRepository.save(worker);
        });

        return toResponse(review);
    }

    public List<ReviewResponse> getWorkerReviews(Long workerId) {
        return reviewRepository.findByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .reviewerName(r.getReviewer().getName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
