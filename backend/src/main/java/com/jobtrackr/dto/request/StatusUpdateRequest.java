package com.jobtrackr.dto.request;

import com.jobtrackr.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        ApplicationStatus status
) {
}
