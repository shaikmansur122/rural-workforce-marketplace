package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.InterestResponse;
import com.ruralworkforce.marketplace.entity.Interest;
import com.ruralworkforce.marketplace.entity.Job;
import com.ruralworkforce.marketplace.entity.JobStatus;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.InterestRepository;
import com.ruralworkforce.marketplace.repository.JobRepository;
import com.ruralworkforce.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterestServiceImpl implements InterestService {

    private final InterestRepository interestRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InterestServiceImpl(InterestRepository interestRepository,
                               JobRepository jobRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.interestRepository = interestRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public void showInterest(Long jobId, Long workerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Job is not open");
        }

        if (interestRepository.existsByWorkerIdAndJobId(workerId, jobId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Already expressed interest in this job");
        }

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Worker not found"));

        Interest interest = Interest.builder()
                .worker(worker)
                .job(job)
                .build();
        interestRepository.save(interest);

        String message = "Worker " + worker.getName() + " expressed interest in your job: " + job.getSkill();
        notificationService.dispatch(job.getProvider().getId(), message);
    }

    @Override
    public List<InterestResponse> getInterestedWorkers(Long jobId, Long providerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (!job.getProvider().getId().equals(providerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return interestRepository.findByJobId(jobId).stream()
                .map(interest -> {
                    User worker = interest.getWorker();
                    return InterestResponse.builder()
                            .workerId(worker.getId())
                            .workerName(worker.getName())
                            .workerSkills(worker.getSkills())
                            .workerRating(worker.getRating())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
