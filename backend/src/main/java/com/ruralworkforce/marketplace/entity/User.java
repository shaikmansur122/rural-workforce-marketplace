package com.ruralworkforce.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(nullable = true)
    private String skills;

    @Column(name = "profile_image_url", columnDefinition = "MEDIUMTEXT")
    private String profileImageUrl;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "total_jobs_completed")
    @Builder.Default
    private Integer totalJobsCompleted = 0;

    @Column(name = "total_jobs_posted")
    @Builder.Default
    private Integer totalJobsPosted = 0;

    // v3 profile fields
    @Column(name = "availability")
    @Builder.Default
    private String availability = "AVAILABLE";

    @Column(name = "location")
    private String location;

    @Column(name = "daily_wage", precision = 10, scale = 2)
    private BigDecimal dailyWage;

    @Column(name = "languages")
    private String languages;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    // Location fields
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;
}
