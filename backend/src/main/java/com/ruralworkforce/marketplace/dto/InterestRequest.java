package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterestRequest {

    @NotNull
    private Long jobId;
}
