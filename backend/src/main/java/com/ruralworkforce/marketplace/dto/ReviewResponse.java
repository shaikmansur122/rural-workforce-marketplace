package com.ruralworkforce.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
