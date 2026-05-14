package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.WorkerCardResponse;
import com.ruralworkforce.marketplace.dto.WorkerProfileResponse;
import com.ruralworkforce.marketplace.entity.Role;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.util.HaversineUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * WorkerService handles:
 * - Paginated worker listing with optional filters (skill, minRating)
 * - Fetching detailed worker profile by ID
 * - Mapping User entities to WorkerCardResponse and WorkerProfileResponse DTOs
 */
@Service
public class WorkerService {

    private final UserRepository userRepository;
    private final ReviewService reviewService;

    public WorkerService(UserRepository userRepository, ReviewService reviewService) {
        this.userRepository = userRepository;
        this.reviewService = reviewService;
    }

    public Page<WorkerCardResponse> searchWorkers(String skill, BigDecimal minRating, int page, int size) {
        return userRepository.findWorkers(skill, minRating, PageRequest.of(page, size))
                .map(this::toCardResponse);
    }

    public WorkerProfileResponse getWorkerProfile(Long workerId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Worker not found"));

        int completion = calculateCompletion(worker);

        return WorkerProfileResponse.builder()
                .id(worker.getId())
                .name(worker.getName())
                .phone(worker.getPhone())
                .profileImageUrl(worker.getProfileImageUrl())
                .skills(worker.getSkills())
                .rating(worker.getRating())
                .experienceYears(worker.getExperienceYears())
                .bio(worker.getBio())
                .totalJobsCompleted(worker.getTotalJobsCompleted())
                .recentReviews(reviewService.getWorkerReviews(workerId))
                .availability(worker.getAvailability())
                .location(worker.getLocation())
                .dailyWage(worker.getDailyWage())
                .languages(worker.getLanguages())
                .verified(worker.getVerified())
                .profileCompletion(completion)
                .build();
    }

    private int calculateCompletion(User u) {
        int score = 0;
        if (u.getName() != null && !u.getName().isBlank()) score += 20;
        if (u.getBio() != null && !u.getBio().isBlank()) score += 20;
        if (u.getSkills() != null && !u.getSkills().isBlank()) score += 20;
        if (u.getProfileImageUrl() != null && !u.getProfileImageUrl().isBlank()) score += 20;
        if (u.getExperienceYears() != null && u.getExperienceYears() > 0) score += 10;
        if (u.getLocation() != null && !u.getLocation().isBlank()) score += 10;
        return score;
    }

    private WorkerCardResponse toCardResponse(User u) {
        return WorkerCardResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .profileImageUrl(u.getProfileImageUrl())
                .skills(u.getSkills())
                .rating(u.getRating())
                .experienceYears(u.getExperienceYears())
                .totalJobsCompleted(u.getTotalJobsCompleted())
                .bio(u.getBio())
                .latitude(u.getLatitude())
                .longitude(u.getLongitude())
                .city(u.getCity())
                .state(u.getState())
                .availability(u.getAvailability())
                .build();
    }

    /** Returns workers within radiusKm of the given coordinates, sorted by distance */
    public List<WorkerCardResponse> getNearbyWorkers(double lat, double lng, double radiusKm,
                                                      String skill, BigDecimal minRating) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.WORKER)
                .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                .filter(u -> skill == null || skill.isBlank() ||
                        (u.getSkills() != null && u.getSkills().toLowerCase().contains(skill.toLowerCase())))
                .filter(u -> minRating == null || u.getRating().compareTo(minRating) >= 0)
                .map(u -> {
                    double dist = HaversineUtil.round1(HaversineUtil.distanceKm(lat, lng, u.getLatitude(), u.getLongitude()));
                    WorkerCardResponse card = toCardResponse(u);
                    return card.toBuilder().distanceKm(dist).build();
                })
                .filter(w -> w.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(WorkerCardResponse::getDistanceKm))
                .collect(Collectors.toList());
    }
}
