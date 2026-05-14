package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String phone;

    @NotBlank
    private String password;

    public LoginRequest() {}

    public LoginRequest(String phone, String password) {
        this.phone = phone;
        this.password = password;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
