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
public class InterestResponse {

    private Long workerId;
    private String workerName;
    private String workerSkills;
    private BigDecimal workerRating;
}
