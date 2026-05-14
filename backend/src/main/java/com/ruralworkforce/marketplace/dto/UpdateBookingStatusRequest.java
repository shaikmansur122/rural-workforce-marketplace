package com.ruralworkforce.marketplace.dto;

import com.ruralworkforce.marketplace.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    @NotNull
    private Long bookingId;

    @NotNull
    private BookingStatus status;
}
