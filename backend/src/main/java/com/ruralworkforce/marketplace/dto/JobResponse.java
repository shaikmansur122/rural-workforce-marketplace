package com.ruralworkforce.marketplace.dto;

import com.ruralworkforce.marketplace.entity.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {

    private Long id;
    private String skill;
    private LocalDate date;
    private String timeSlot;
    private String location;
    private BigDecimal wage;
    private JobStatus status;
    private String providerName;
    private BigDecimal providerRating;
    private String providerImageUrl;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
}
