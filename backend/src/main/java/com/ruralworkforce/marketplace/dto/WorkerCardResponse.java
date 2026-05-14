package com.ruralworkforce.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class WorkerCardResponse {
    private Long id;
    private String name;
    private String profileImageUrl;
    private String skills;
    private BigDecimal rating;
    private Integer experienceYears;
    private Integer totalJobsCompleted;
    private String bio;
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;
    private String availability;
    private Double distanceKm;
}
