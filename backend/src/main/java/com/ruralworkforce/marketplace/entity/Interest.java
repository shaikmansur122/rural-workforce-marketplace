package com.ruralworkforce.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interests", uniqueConstraints = @UniqueConstraint(columnNames = {"worker_id", "job_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private User worker;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
}
