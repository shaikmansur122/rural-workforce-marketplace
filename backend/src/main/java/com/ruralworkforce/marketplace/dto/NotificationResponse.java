package com.ruralworkforce.marketplace.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
