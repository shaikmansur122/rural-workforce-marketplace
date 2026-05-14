package com.ruralworkforce.marketplace.dto;

import com.ruralworkforce.marketplace.entity.BookingStatus;
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
public class BookingResponse {

    private Long id;
    private Long jobId;
    private Long workerId;
    private BookingStatus status;
    private String timeSlot;
    // Job details for display
    private String skill;
    private LocalDate date;
    private String location;
    private BigDecimal wage;
    private String providerName;
}
