package com.jobtrackr.service;

import com.jobtrackr.dto.request.JobApplicationRequest;
import com.jobtrackr.dto.request.StatusUpdateRequest;
import com.jobtrackr.dto.response.AnalyticsResponse;
import com.jobtrackr.dto.response.JobApplicationResponse;
import com.jobtrackr.dto.response.PageResponse;
import com.jobtrackr.entity.ApplicationStatus;
import com.jobtrackr.entity.JobApplication;
import com.jobtrackr.entity.User;
import com.jobtrackr.exception.ResourceNotFoundException;
import com.jobtrackr.exception.UnauthorizedException;
import com.jobtrackr.repository.JobApplicationRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public PageResponse<JobApplicationResponse> getApplications(
            User user,
            int page,
            int size,
            ApplicationStatus statusFilter,
            String search,
            String sortBy,
            String sortDir
    ) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String sortField = resolveSortField(sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Specification<JobApplication> spec = buildSpecification(user, statusFilter, search);
        Page<JobApplication> resultPage = jobApplicationRepository.findAll(spec, pageable);

        List<JobApplicationResponse> content = resultPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return new PageResponse<>(
                content,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast()
        );
    }

    @Transactional
    public JobApplicationResponse createApplication(User user, JobApplicationRequest req) {
        JobApplication application = JobApplication.builder()
                .user(user)
                .company(req.company())
                .role(req.role())
                .link(req.link())
                .salaryMin(req.salaryMin())
                .salaryMax(req.salaryMax())
                .location(req.location())
                .status(req.status() != null ? req.status() : ApplicationStatus.SAVED)
                .appliedDate(req.appliedDate())
                .notes(req.notes())
                .followUpDate(req.followUpDate())
                .build();

        application = jobApplicationRepository.save(application);
        log.info("Created job application id={} for user={}", application.getId(), user.getEmail());
        return toResponse(application);
    }

    public JobApplicationResponse getApplication(User user, Long id) {
        JobApplication application = findApplicationById(id);
        verifyOwnership(user, application);
        return toResponse(application);
    }

    @Transactional
    public JobApplicationResponse updateApplication(User user, Long id, JobApplicationRequest req) {
        JobApplication application = findApplicationById(id);
        verifyOwnership(user, application);

        application.setCompany(req.company());
        application.setRole(req.role());
        application.setLink(req.link());
        application.setSalaryMin(req.salaryMin());
        application.setSalaryMax(req.salaryMax());
        application.setLocation(req.location());
        application.setStatus(req.status() != null ? req.status() : ApplicationStatus.SAVED);
        application.setAppliedDate(req.appliedDate());
        application.setNotes(req.notes());
        application.setFollowUpDate(req.followUpDate());

        application = jobApplicationRepository.save(application);
        log.info("Updated job application id={} for user={}", application.getId(), user.getEmail());
        return toResponse(application);
    }

    @Transactional
    public void deleteApplication(User user, Long id) {
        JobApplication application = findApplicationById(id);
        verifyOwnership(user, application);
        jobApplicationRepository.delete(application);
        log.info("Deleted job application id={} for user={}", id, user.getEmail());
    }

    @Transactional
    public JobApplicationResponse updateStatus(User user, Long id, StatusUpdateRequest req) {
        JobApplication application = findApplicationById(id);
        verifyOwnership(user, application);
        application.setStatus(req.status());
        application = jobApplicationRepository.save(application);
        log.info("Updated status of job application id={} to {} for user={}", id, req.status(), user.getEmail());
        return toResponse(application);
    }

    public AnalyticsResponse getAnalytics(User user) {
        // Status breakdown
        List<Object[]> statusCounts = jobApplicationRepository.countByUserGroupByStatus(user);
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            statusBreakdown.put(s.name(), 0L);
        }
        for (Object[] row : statusCounts) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            statusBreakdown.put(status.name(), count);
        }

        // Weekly counts
        List<Object[]> weeklyCounts = jobApplicationRepository.countByUserGroupByWeek(user);
        List<AnalyticsResponse.WeeklyCount> applicationsPerWeek = weeklyCounts.stream()
                .map(row -> new AnalyticsResponse.WeeklyCount((String) row[0], (Long) row[1]))
                .toList();

        // Total applications
        long totalApplications = jobApplicationRepository.findByUser(user).size();

        // Overdue follow-ups
        long overdueFollowUps = jobApplicationRepository.findOverdueFollowUps(user).size();

        // Response rate: count of (OA + INTERVIEW + OFFER + REJECTED) / count of (APPLIED + OA + INTERVIEW + OFFER + REJECTED) * 100
        long responded = statusBreakdown.getOrDefault("OA", 0L)
                + statusBreakdown.getOrDefault("INTERVIEW", 0L)
                + statusBreakdown.getOrDefault("OFFER", 0L)
                + statusBreakdown.getOrDefault("REJECTED", 0L);

        long denominator = statusBreakdown.getOrDefault("APPLIED", 0L) + responded;

        double responseRate = denominator > 0 ? (double) responded / denominator * 100.0 : 0.0;

        return new AnalyticsResponse(
                applicationsPerWeek,
                statusBreakdown,
                responseRate,
                0.0, // avgDaysToResponse - placeholder
                totalApplications,
                overdueFollowUps
        );
    }

    private JobApplication findApplicationById(Long id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", id));
    }

    private void verifyOwnership(User user, JobApplication application) {
        if (!application.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to access this resource");
        }
    }

    private String resolveSortField(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return "createdAt";
        }
        return switch (sortBy.toLowerCase()) {
            case "company" -> "company";
            case "role" -> "role";
            case "status" -> "status";
            case "applieddate" -> "appliedDate";
            case "createdat" -> "createdAt";
            case "updatedat" -> "updatedAt";
            case "followupdate" -> "followUpDate";
            default -> "createdAt";
        };
    }

    private Specification<JobApplication> buildSpecification(
            User user,
            ApplicationStatus statusFilter,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by user
            predicates.add(criteriaBuilder.equal(root.get("user"), user));

            // Optional status filter
            if (statusFilter != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), statusFilter));
            }

            // Optional search in company OR role (case-insensitive)
            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate companyPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("company")), searchPattern);
                Predicate rolePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("role")), searchPattern);
                predicates.add(criteriaBuilder.or(companyPredicate, rolePredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public JobApplicationResponse toResponse(JobApplication app) {
        boolean overdueFollowUp = app.getFollowUpDate() != null
                && app.getFollowUpDate().isBefore(LocalDate.now())
                && app.getStatus() != ApplicationStatus.OFFER
                && app.getStatus() != ApplicationStatus.REJECTED;

        return new JobApplicationResponse(
                app.getId(),
                app.getCompany(),
                app.getRole(),
                app.getLink(),
                app.getSalaryMin(),
                app.getSalaryMax(),
                app.getLocation(),
                app.getStatus(),
                app.getAppliedDate(),
                app.getNotes(),
                app.getFollowUpDate(),
                app.getCreatedAt(),
                app.getUpdatedAt(),
                overdueFollowUp
        );
    }
}
