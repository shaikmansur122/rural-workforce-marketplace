package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateWorkerProfileRequest {
    @NotBlank
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
