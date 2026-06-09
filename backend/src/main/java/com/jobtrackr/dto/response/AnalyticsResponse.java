package com.jobtrackr.dto.response;

import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        List<WeeklyCount> applicationsPerWeek,
        Map<String, Long> statusBreakdown,
        double responseRate,
        double avgDaysToResponse,
        long totalApplications,
        long overdueFollowUps
) {
    public record WeeklyCount(
            String week,
            long count
    ) {
    }
}
