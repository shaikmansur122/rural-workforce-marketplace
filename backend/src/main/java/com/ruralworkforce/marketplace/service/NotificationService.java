package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    void dispatch(Long userId, String message);

    List<NotificationResponse> getNotifications(Long userId);

    void markAllRead(Long userId);
}
