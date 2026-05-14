package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull
    private Long jobId;

    @NotNull
    private Long workerId;
}
