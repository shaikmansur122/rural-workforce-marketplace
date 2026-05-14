package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.InterestResponse;

import java.util.List;

public interface InterestService {

    void showInterest(Long jobId, Long workerId);

    List<InterestResponse> getInterestedWorkers(Long jobId, Long providerId);
}
