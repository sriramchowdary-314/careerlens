package com.jobtrackr.dto.request;

import com.jobtrackr.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobApplicationRequest(
        @NotBlank(message = "Company is required")
        String company,

        @NotBlank(message = "Role is required")
        String role,

        String link,

        BigDecimal salaryMin,

        BigDecimal salaryMax,

        String location,

        @NotNull(message = "Status is required")
        ApplicationStatus status,

        LocalDate appliedDate,

        @Size(max = 2000, message = "Notes must not exceed 2000 characters")
        String notes,

        LocalDate followUpDate
) {
    public JobApplicationRequest {
        if (status == null) {
            status = ApplicationStatus.SAVED;
        }
    }
}
