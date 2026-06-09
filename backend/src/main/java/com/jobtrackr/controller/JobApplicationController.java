package com.jobtrackr.controller;

import com.jobtrackr.dto.request.JobApplicationRequest;
import com.jobtrackr.dto.request.StatusUpdateRequest;
import com.jobtrackr.dto.response.AnalyticsResponse;
import com.jobtrackr.dto.response.JobApplicationResponse;
import com.jobtrackr.dto.response.PageResponse;
import com.jobtrackr.entity.ApplicationStatus;
import com.jobtrackr.entity.User;
import com.jobtrackr.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Job Applications", description = "Job application management endpoints")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    @Operation(summary = "Get all job applications with filtering, search, and pagination")
    public ResponseEntity<PageResponse<JobApplicationResponse>> getApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<JobApplicationResponse> response = jobApplicationService.getApplications(
                user, page, size, status, search, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create a new job application")
    public ResponseEntity<JobApplicationResponse> createApplication(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        JobApplicationResponse response = jobApplicationService.createApplication(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific job application by ID")
    public ResponseEntity<JobApplicationResponse> getApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        JobApplicationResponse response = jobApplicationService.getApplication(user, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a job application")
    public ResponseEntity<JobApplicationResponse> updateApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        JobApplicationResponse response = jobApplicationService.updateApplication(user, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a job application")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        jobApplicationService.deleteApplication(user, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update the status of a job application")
    public ResponseEntity<JobApplicationResponse> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        JobApplicationResponse response = jobApplicationService.updateStatus(user, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get analytics for the current user's job applications")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal User user
    ) {
        AnalyticsResponse response = jobApplicationService.getAnalytics(user);
        return ResponseEntity.ok(response);
    }
}
