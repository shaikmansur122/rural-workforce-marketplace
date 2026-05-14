package com.ruralworkforce.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProfileRequest {
    // All fields optional — only non-null values are applied
    private String name;
    private String skills;
    private String profileImageUrl;
    private Integer experienceYears;
    private String bio;
    private String availability;
    private String location;
    private BigDecimal dailyWage;
    private String languages;
    private String businessName;
}
