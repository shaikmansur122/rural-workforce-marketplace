package com.ruralworkforce.marketplace.repository;

import com.ruralworkforce.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByBookingId(Long bookingId);

    List<Review> findByWorkerIdOrderByCreatedAtDesc(Long workerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.worker.id = :workerId")
    Optional<Double> findAverageRatingByWorkerId(@Param("workerId") Long workerId);
}
