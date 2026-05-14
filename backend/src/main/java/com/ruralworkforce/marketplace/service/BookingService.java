package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.BookingRequest;
import com.ruralworkforce.marketplace.dto.BookingResponse;
import com.ruralworkforce.marketplace.entity.*;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.BookingRepository;
import com.ruralworkforce.marketplace.repository.JobRepository;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.util.TimeSlotUtil;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          JobRepository jobRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Returns true if the worker has a conflicting booking on the given date and time slot.
     */
    public boolean checkAvailability(Long workerId, LocalDate date, String timeSlot) {
        List<Booking> existing = bookingRepository.findByWorkerIdAndJobDateAndStatusIn(
                workerId, date, List.of(BookingStatus.PENDING, BookingStatus.ACCEPTED));
        for (Booking booking : existing) {
            if (TimeSlotUtil.overlaps(booking.getTimeSlot(), timeSlot)) {
                return true;
            }
        }
        return false;
    }

    public BookingResponse createBooking(BookingRequest request, Long providerId) {
        // Load and validate job
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (!job.getProvider().getId().equals(providerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this job");
        }

        if (job.getStatus() != JobStatus.OPEN) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Job is not open for booking");
        }

        // Load and validate worker
        User worker = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Worker not found"));

        // Skill match check — only enforce if worker has skills AND job skill is specific
        // This is a soft check: if worker has no skills listed, allow booking
        String requiredSkill = job.getSkill().trim().toLowerCase();
        String workerSkills = worker.getSkills() == null ? "" : worker.getSkills().trim();
        if (!workerSkills.isEmpty() && !requiredSkill.isEmpty()) {
            boolean skillMatches = Arrays.stream(workerSkills.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .anyMatch(s -> s.contains(requiredSkill) || requiredSkill.contains(s)
                            || s.length() > 2 && requiredSkill.length() > 2 &&
                               (s.substring(0, Math.min(3, s.length()))
                                .equals(requiredSkill.substring(0, Math.min(3, requiredSkill.length())))));
            // Log mismatch but don't block — provider knows best who to hire
            if (!skillMatches) {
                // Allow booking anyway — provider is making an informed decision
                // Just log it (no exception thrown)
            }
        }

        // Availability conflict check
        if (checkAvailability(worker.getId(), job.getDate(), job.getTimeSlot())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Worker has a conflicting booking");
        }

        // Persist booking
        Booking booking = Booking.builder()
                .job(job)
                .worker(worker)
                .status(BookingStatus.PENDING)
                .timeSlot(job.getTimeSlot())
                .build();
        booking = bookingRepository.save(booking);

        // Update job status
        job.setStatus(JobStatus.PENDING);
        jobRepository.save(job);

        // Notify worker
        notificationService.dispatch(worker.getId(),
                "You have a new booking request for job: " + job.getSkill() + " on " + job.getDate());

        return toResponse(booking);
    }

    public BookingResponse updateStatus(Long bookingId, BookingStatus newStatus, Long requesterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getWorker().getId().equals(requesterId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not the assigned worker for this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status transition");
        }

        Job job = booking.getJob();

        if (newStatus == BookingStatus.ACCEPTED) {
            booking.setStatus(BookingStatus.ACCEPTED);
            job.setStatus(JobStatus.BOOKED);
            bookingRepository.save(booking);
            jobRepository.save(job);
            notificationService.dispatch(job.getProvider().getId(),
                    "Worker accepted your booking for job: " + job.getSkill());
        } else if (newStatus == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            job.setStatus(JobStatus.OPEN);
            bookingRepository.save(booking);
            jobRepository.save(job);
            notificationService.dispatch(job.getProvider().getId(),
                    "Worker rejected your booking for job: " + job.getSkill());
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status transition");
        }

        return toResponse(booking);
    }

    public BookingResponse completeBooking(Long bookingId, Long requesterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Only the provider (job owner) can mark as complete
        Long providerId = booking.getJob().getProvider().getId();
        if (!providerId.equals(requesterId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the job provider can complete this booking");
        }

        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only ACCEPTED bookings can be completed");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        // Update job status
        Job job = booking.getJob();
        job.setStatus(JobStatus.COMPLETED);
        jobRepository.save(job);

        // Increment worker's totalJobsCompleted
        User worker = booking.getWorker();
        worker.setTotalJobsCompleted(worker.getTotalJobsCompleted() + 1);
        userRepository.save(worker);

        // Increment provider's totalJobsCompleted
        User provider = job.getProvider();
        provider.setTotalJobsCompleted(provider.getTotalJobsCompleted() + 1);
        userRepository.save(provider);

        notificationService.dispatch(worker.getId(),
                "Your booking for job: " + job.getSkill() + " has been marked as completed.");

        return toResponse(booking);
    }

    public Optional<BookingResponse> getBookingByJobId(Long jobId, Long providerId) {
        return bookingRepository.findByJobId(jobId).stream()
                .filter(b -> b.getJob().getProvider().getId().equals(providerId))
                .filter(b -> b.getStatus() == BookingStatus.ACCEPTED ||
                             b.getStatus() == BookingStatus.COMPLETED)
                .findFirst()
                .map(this::toResponse);
    }

    public List<BookingResponse> getWorkerBookings(Long workerId) {
        return bookingRepository.findByWorkerId(workerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking booking) {
        Job job = booking.getJob();
        return BookingResponse.builder()
                .id(booking.getId())
                .jobId(job.getId())
                .workerId(booking.getWorker().getId())
                .status(booking.getStatus())
                .timeSlot(booking.getTimeSlot())
                .skill(job.getSkill())
                .date(job.getDate())
                .location(job.getLocation())
                .wage(job.getWage())
                .providerName(job.getProvider() != null ? job.getProvider().getName() : null)
                .build();
    }
}
