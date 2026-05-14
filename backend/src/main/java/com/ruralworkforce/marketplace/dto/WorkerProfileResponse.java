package com.ruralworkforce.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfileResponse {
    private Long id;
    private String name;
    private String phone;
    private String profileImageUrl;
    private String skills;
    private BigDecimal rating;
    private Integer experienceYears;
    private String bio;
    private Integer totalJobsCompleted;
    private List<ReviewResponse> recentReviews;
    // v2 profile fields
    private String availability;   // AVAILABLE / BUSY / UNAVAILABLE
    private String location;
    private BigDecimal dailyWage;
    private String languages;
    private Boolean verified;
    private Integer profileCompletion;
}
