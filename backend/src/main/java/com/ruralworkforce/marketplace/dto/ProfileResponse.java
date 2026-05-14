package com.ruralworkforce.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private Long id;
    private String name;
    private String phone;
    private String role;
    private BigDecimal rating;
    private String skills;
    // v2
    private String profileImageUrl;
    private Integer experienceYears;
    private String bio;
    private Integer totalJobsCompleted;
    private Integer totalJobsPosted;
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;
}