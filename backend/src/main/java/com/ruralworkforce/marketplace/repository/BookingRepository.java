package com.ruralworkforce.marketplace.repository;

import com.ruralworkforce.marketplace.entity.Booking;
import com.ruralworkforce.marketplace.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByWorkerIdAndJobDateAndStatusIn(Long workerId, LocalDate date, List<BookingStatus> statuses);

    List<Booking> findByWorkerId(Long workerId);

    List<Booking> findByJobId(Long jobId);
}
