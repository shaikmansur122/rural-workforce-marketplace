package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateJobRequest {

    @NotBlank
    private String skill;

    @NotNull
    private LocalDate date;

    @NotBlank
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d-([01]\\d|2[0-3]):[0-5]\\d$",
             message = "timeSlot must be in HH:mm-HH:mm format")
    private String timeSlot;

    @NotBlank
    private String location;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal wage;

    private Double latitude;
    private Double longitude;
}
