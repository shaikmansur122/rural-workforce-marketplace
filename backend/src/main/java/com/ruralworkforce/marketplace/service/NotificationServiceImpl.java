package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.NotificationResponse;
import com.ruralworkforce.marketplace.entity.Notification;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.NotificationRepository;
import com.ruralworkforce.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void dispatch(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
