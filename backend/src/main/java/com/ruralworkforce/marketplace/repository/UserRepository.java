package com.ruralworkforce.marketplace.repository;

import com.ruralworkforce.marketplace.entity.Role;
import com.ruralworkforce.marketplace.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    // Worker search with optional filters
    @Query("SELECT u FROM User u WHERE u.role = 'WORKER' " +
           "AND (:skill IS NULL OR LOWER(u.skills) LIKE LOWER(CONCAT('%', :skill, '%'))) " +
           "AND (:minRating IS NULL OR u.rating >= :minRating)")
    Page<User> findWorkers(
            @Param("skill") String skill,
            @Param("minRating") BigDecimal minRating,
            Pageable pageable);
}
