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
public class ProviderProfileResponse {
    private Long id;
    private String name;
    private String phone;
    private String profileImageUrl;
    private BigDecimal rating;
    private Integer totalJobsPosted;
    private Integer totalJobsCompleted;
    private String bio;
    // v2 profile fields
    private String businessName;
    private String location;
    private Boolean verified;
    private Integer profileCompletion;
    private List<ReviewResponse> recentReviews;
}
