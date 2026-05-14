package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.CreateJobRequest;
import com.ruralworkforce.marketplace.dto.JobResponse;
import com.ruralworkforce.marketplace.entity.Job;
import com.ruralworkforce.marketplace.entity.JobStatus;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.JobRepository;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.util.HaversineUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobResponse createJob(CreateJobRequest request, Long providerId) {
        // Validate wage > 0 (belt-and-suspenders beyond DTO @DecimalMin)
        if (request.getWage() == null || request.getWage().signum() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Wage must be greater than 0");
        }

        // Validate timeSlot format HH:mm-HH:mm and start < end
        validateTimeSlot(request.getTimeSlot());

        // Load provider
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Provider not found"));

        Job job = Job.builder()
                .provider(provider)
                .skill(request.getSkill())
                .date(request.getDate())
                .timeSlot(request.getTimeSlot())
                .location(request.getLocation())
                .wage(request.getWage())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(JobStatus.OPEN)
                .build();

        Job saved = jobRepository.save(job);

        // Increment provider's totalJobsPosted
        provider.setTotalJobsPosted(provider.getTotalJobsPosted() + 1);
        userRepository.save(provider);

        return toJobResponse(saved);
    }

    public Page<JobResponse> getOpenJobs(int page, int size) {
        return jobRepository
                .findByStatus(JobStatus.OPEN, PageRequest.of(page, size))
                .map(this::toJobResponse);
    }

    public List<JobResponse> getJobsByProvider(Long providerId) {
        return jobRepository.findByProviderId(providerId)
                .stream()
                .map(this::toJobResponse)
                .collect(Collectors.toList());
    }

    private void validateTimeSlot(String timeSlot) {
        if (timeSlot == null || !timeSlot.matches("^([01]\\d|2[0-3]):[0-5]\\d-([01]\\d|2[0-3]):[0-5]\\d$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "timeSlot must be in HH:mm-HH:mm format");
        }
        String[] parts = timeSlot.split("-");
        try {
            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            if (!start.isBefore(end)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "timeSlot start must be before end");
            }
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "timeSlot must be in HH:mm-HH:mm format");
        }
    }

    JobResponse toJobResponse(Job job) {
        User provider = job.getProvider();
        return JobResponse.builder()
                .id(job.getId())
                .skill(job.getSkill())
                .date(job.getDate())
                .timeSlot(job.getTimeSlot())
                .location(job.getLocation())
                .wage(job.getWage())
                .status(job.getStatus())
                .providerName(provider != null ? provider.getName() : null)
                .providerRating(provider != null ? provider.getRating() : null)
                .providerImageUrl(provider != null ? provider.getProfileImageUrl() : null)
                .latitude(job.getLatitude())
                .longitude(job.getLongitude())
                .build();
    }

    /** Returns OPEN jobs within radiusKm of the given coordinates, sorted by distance */
    public List<JobResponse> getNearbyJobs(double lat, double lng, double radiusKm,
                                            String skill, BigDecimal minWage, BigDecimal maxWage) {
        return jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == JobStatus.OPEN)
                .filter(j -> j.getLatitude() != null && j.getLongitude() != null)
                .filter(j -> skill == null || skill.isBlank() ||
                        j.getSkill().toLowerCase().contains(skill.toLowerCase()))
                .filter(j -> minWage == null || j.getWage().compareTo(minWage) >= 0)
                .filter(j -> maxWage == null || j.getWage().compareTo(maxWage) <= 0)
                .map(j -> {
                    double dist = HaversineUtil.round1(HaversineUtil.distanceKm(lat, lng, j.getLatitude(), j.getLongitude()));
                    JobResponse r = toJobResponse(j);
                    r.setDistanceKm(dist);
                    return r;
                })
                .filter(j -> j.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(JobResponse::getDistanceKm))
                .collect(Collectors.toList());
    }
}
