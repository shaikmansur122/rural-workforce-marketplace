package com.ruralworkforce.marketplace.dto;

import lombok.Data;

@Data
public class UpdateLocationRequest {
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;
}
