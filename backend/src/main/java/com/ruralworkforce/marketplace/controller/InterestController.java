package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.InterestRequest;
import com.ruralworkforce.marketplace.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/interest")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;

    @PostMapping
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<Void> showInterest(
            @Valid @RequestBody InterestRequest request,
            Authentication authentication) {
        Long workerId = (Long) authentication.getPrincipal();
        interestService.showInterest(request.getJobId(), workerId);
        return ResponseEntity.ok().build();
    }
}
