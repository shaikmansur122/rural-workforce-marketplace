package com.ruralworkforce.marketplace.repository;

import com.ruralworkforce.marketplace.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    boolean existsByWorkerIdAndJobId(Long workerId, Long jobId);

    List<Interest> findByJobId(Long jobId);

    List<Interest> findByWorkerId(Long workerId);
}
