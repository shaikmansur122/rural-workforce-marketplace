package com.ruralworkforce.marketplace.controller;

import com.ruralworkforce.marketplace.dto.NotificationResponse;
import com.ruralworkforce.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }
}
