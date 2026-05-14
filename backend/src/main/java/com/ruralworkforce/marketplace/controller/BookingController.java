package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.BookingRequest;
import com.ruralworkforce.marketplace.dto.BookingResponse;
import com.ruralworkforce.marketplace.dto.UpdateBookingStatusRequest;
import com.ruralworkforce.marketplace.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        BookingResponse response = bookingService.createBooking(request, providerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/status")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @Valid @RequestBody UpdateBookingStatusRequest request,
            Authentication authentication) {
        Long workerId = (Long) authentication.getPrincipal();
        BookingResponse response = bookingService.updateStatus(request.getBookingId(), request.getStatus(), workerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-job/{jobId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> getBookingForJob(
            @PathVariable Long jobId,
            Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        return bookingService.getBookingByJobId(jobId, providerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        Long workerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getWorkerBookings(workerId));
    }

    /**
     * PATCH /booking/{id}/complete
     * Provider marks a booking as COMPLETED.
     * Increments worker's totalJobsCompleted and unlocks review submission.
     */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Long id,
            Authentication authentication) {
        Long providerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.completeBooking(id, providerId));
    }
}
