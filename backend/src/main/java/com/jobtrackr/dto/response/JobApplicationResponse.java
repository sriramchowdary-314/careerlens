package com.jobtrackr.dto.response;

import com.jobtrackr.entity.ApplicationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplicationResponse(
        Long id,
        String company,
        String role,
        String link,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String location,
        ApplicationStatus status,
        LocalDate appliedDate,
        String notes,
        LocalDate followUpDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean overdueFollowUp
) {
}
