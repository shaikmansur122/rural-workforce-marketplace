package com.ruralworkforce.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    private String name;

    @Pattern(regexp = "\\d{10,15}")
    private String phone;

    @Size(min = 6)
    private String password;

    @NotBlank
    private String role;

    private String skills;

    public RegisterRequest() {}

    public RegisterRequest(String name, String phone, String password, String role, String skills) {
        this.name = name;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.skills = skills;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}
