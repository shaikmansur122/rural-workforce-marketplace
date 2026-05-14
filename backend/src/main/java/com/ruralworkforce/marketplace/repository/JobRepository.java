package com.ruralworkforce.marketplace.repository;

import com.ruralworkforce.marketplace.entity.Job;
import com.ruralworkforce.marketplace.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Optional<Job> findByIdAndProviderId(Long id, Long providerId);

    List<Job> findByProviderId(Long providerId);
}
