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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @InjectMocks
    private JobApplicationService jobApplicationService;

    private User testUser;
    private User otherUser;
    private JobApplication testApplication;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .build();

        otherUser = User.builder()
                .id(2L)
                .email("other@example.com")
                .password("encodedPassword")
                .firstName("Other")
                .lastName("User")
                .build();

        testApplication = JobApplication.builder()
                .id(100L)
                .user(testUser)
                .company("Google")
                .role("Software Engineer")
                .link("https://careers.google.com")
                .salaryMin(new BigDecimal("150000"))
                .salaryMax(new BigDecimal("200000"))
                .location("Mountain View, CA")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(LocalDate.now().minusDays(10))
                .notes("Great opportunity")
                .followUpDate(LocalDate.now().plusDays(5))
                .build();

        // Set timestamps manually since @PrePersist won't fire in unit tests
        testApplication.setCreatedAt(LocalDateTime.now().minusDays(10));
        testApplication.setUpdatedAt(LocalDateTime.now().minusDays(10));
    }

    @Test
    @DisplayName("createApplication_success - Should create and return a new job application")
    void createApplication_success() {
        JobApplicationRequest request = new JobApplicationRequest(
                "Google",
                "Software Engineer",
                "https://careers.google.com",
                new BigDecimal("150000"),
                new BigDecimal("200000"),
                "Mountain View, CA",
                ApplicationStatus.APPLIED,
                LocalDate.now().minusDays(1),
                "Great role",
                LocalDate.now().plusDays(7)
        );

        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setId(100L);
            app.setCreatedAt(LocalDateTime.now());
            app.setUpdatedAt(LocalDateTime.now());
            return app;
        });

        JobApplicationResponse response = jobApplicationService.createApplication(testUser, request);

        assertThat(response).isNotNull();
        assertThat(response.company()).isEqualTo("Google");
        assertThat(response.role()).isEqualTo("Software Engineer");
        assertThat(response.status()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(response.id()).isEqualTo(100L);

        verify(jobApplicationRepository, times(1)).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("createApplication_mapsFieldsCorrectly - Should correctly map all fields from request to entity")
    void createApplication_mapsFieldsCorrectly() {
        LocalDate appliedDate = LocalDate.now().minusDays(5);
        LocalDate followUpDate = LocalDate.now().plusDays(10);

        JobApplicationRequest request = new JobApplicationRequest(
                "Meta",
                "Backend Engineer",
                "https://metacareers.com",
                new BigDecimal("180000"),
                new BigDecimal("250000"),
                "Menlo Park, CA",
                ApplicationStatus.OA,
                appliedDate,
                "Interesting position",
                followUpDate
        );

        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setId(200L);
            app.setCreatedAt(LocalDateTime.now());
            app.setUpdatedAt(LocalDateTime.now());
            return app;
        });

        JobApplicationService service = new JobApplicationService(jobApplicationRepository);
        JobApplicationResponse response = service.createApplication(testUser, request);

        ArgumentCaptor<JobApplication> captor = ArgumentCaptor.forClass(JobApplication.class);
        verify(jobApplicationRepository).save(captor.capture());

        JobApplication saved = captor.getValue();
        assertThat(saved.getCompany()).isEqualTo("Meta");
        assertThat(saved.getRole()).isEqualTo("Backend Engineer");
        assertThat(saved.getLink()).isEqualTo("https://metacareers.com");
        assertThat(saved.getSalaryMin()).isEqualByComparingTo(new BigDecimal("180000"));
        assertThat(saved.getSalaryMax()).isEqualByComparingTo(new BigDecimal("250000"));
        assertThat(saved.getLocation()).isEqualTo("Menlo Park, CA");
        assertThat(saved.getStatus()).isEqualTo(ApplicationStatus.OA);
        assertThat(saved.getAppliedDate()).isEqualTo(appliedDate);
        assertThat(saved.getNotes()).isEqualTo("Interesting position");
        assertThat(saved.getFollowUpDate()).isEqualTo(followUpDate);
        assertThat(saved.getUser()).isEqualTo(testUser);
    }

    @Test
    @DisplayName("getApplication_notFound_throws - Should throw ResourceNotFoundException when application does not exist")
    void getApplication_notFound_throws() {
        when(jobApplicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.getApplication(testUser, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("getApplication_wrongUser_throws - Should throw UnauthorizedException when user does not own the application")
    void getApplication_wrongUser_throws() {
        when(jobApplicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() -> jobApplicationService.getApplication(otherUser, 100L))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("deleteApplication_success - Should delete the application successfully")
    void deleteApplication_success() {
        when(jobApplicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));
        doNothing().when(jobApplicationRepository).delete(testApplication);

        assertThatCode(() -> jobApplicationService.deleteApplication(testUser, 100L))
                .doesNotThrowAnyException();

        verify(jobApplicationRepository, times(1)).delete(testApplication);
    }

    @Test
    @DisplayName("deleteApplication_notFound_throws - Should throw ResourceNotFoundException when application does not exist")
    void deleteApplication_notFound_throws() {
        when(jobApplicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.deleteApplication(testUser, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");

        verify(jobApplicationRepository, never()).delete(any(JobApplication.class));
    }

    @Test
    @DisplayName("updateApplication_success - Should update and return the updated application")
    void updateApplication_success() {
        JobApplicationRequest updateRequest = new JobApplicationRequest(
                "Google",
                "Senior Software Engineer",
                "https://careers.google.com/updated",
                new BigDecimal("200000"),
                new BigDecimal("280000"),
                "Sunnyvale, CA",
                ApplicationStatus.INTERVIEW,
                LocalDate.now().minusDays(8),
                "Updated notes",
                LocalDate.now().plusDays(3)
        );

        when(jobApplicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));
        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setUpdatedAt(LocalDateTime.now());
            return app;
        });

        JobApplicationResponse response = jobApplicationService.updateApplication(testUser, 100L, updateRequest);

        assertThat(response).isNotNull();
        assertThat(response.role()).isEqualTo("Senior Software Engineer");
        assertThat(response.status()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(response.location()).isEqualTo("Sunnyvale, CA");

        verify(jobApplicationRepository, times(1)).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("updateStatus_success - Should update the status of the application")
    void updateStatus_success() {
        StatusUpdateRequest statusRequest = new StatusUpdateRequest(ApplicationStatus.OFFER);

        when(jobApplicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));
        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setUpdatedAt(LocalDateTime.now());
            return app;
        });

        JobApplicationResponse response = jobApplicationService.updateStatus(testUser, 100L, statusRequest);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(ApplicationStatus.OFFER);

        verify(jobApplicationRepository, times(1)).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("getApplications_filtersAndReturnsPage - Should return paginated results with correct metadata")
    @SuppressWarnings("unchecked")
    void getApplications_filtersAndReturnsPage() {
        List<JobApplication> applications = Arrays.asList(testApplication);
        Page<JobApplication> mockPage = new PageImpl<>(applications, PageRequest.of(0, 20), 1);

        when(jobApplicationRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(mockPage);

        PageResponse<JobApplicationResponse> response = jobApplicationService.getApplications(
                testUser, 0, 20, null, null, "createdAt", "desc");

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.page()).isEqualTo(0);
        assertThat(response.size()).isEqualTo(20);
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.totalPages()).isEqualTo(1);
        assertThat(response.last()).isTrue();
        assertThat(response.content().get(0).company()).isEqualTo("Google");
    }

    @Test
    @DisplayName("getAnalytics_computesResponseRate - Should correctly compute response rate")
    void getAnalytics_computesResponseRate() {
        // Setup status counts: 5 APPLIED, 2 OA, 2 INTERVIEW, 1 OFFER, 1 REJECTED
        // responded = 2 + 2 + 1 + 1 = 6
        // denominator = 5 + 6 = 11
        // responseRate = 6/11 * 100 ≈ 54.54%
        List<Object[]> statusCounts = Arrays.asList(
                new Object[]{ApplicationStatus.APPLIED, 5L},
                new Object[]{ApplicationStatus.OA, 2L},
                new Object[]{ApplicationStatus.INTERVIEW, 2L},
                new Object[]{ApplicationStatus.OFFER, 1L},
                new Object[]{ApplicationStatus.REJECTED, 1L},
                new Object[]{ApplicationStatus.SAVED, 3L}
        );

        List<Object[]> weeklyCounts = Arrays.asList(
                new Object[]{"2024-01", 3L},
                new Object[]{"2024-02", 5L},
                new Object[]{"2024-03", 3L}
        );

        JobApplication overdueApp = JobApplication.builder()
                .id(200L)
                .user(testUser)
                .company("Netflix")
                .role("Engineer")
                .status(ApplicationStatus.APPLIED)
                .followUpDate(LocalDate.now().minusDays(2))
                .build();
        overdueApp.setCreatedAt(LocalDateTime.now().minusDays(20));
        overdueApp.setUpdatedAt(LocalDateTime.now().minusDays(20));

        List<JobApplication> allApps = Arrays.asList(testApplication, overdueApp);
        List<JobApplication> overdueApps = Collections.singletonList(overdueApp);

        when(jobApplicationRepository.countByUserGroupByStatus(testUser)).thenReturn(statusCounts);
        when(jobApplicationRepository.countByUserGroupByWeek(testUser)).thenReturn(weeklyCounts);
        when(jobApplicationRepository.findByUser(testUser)).thenReturn(allApps);
        when(jobApplicationRepository.findOverdueFollowUps(testUser)).thenReturn(overdueApps);

        AnalyticsResponse analytics = jobApplicationService.getAnalytics(testUser);

        assertThat(analytics).isNotNull();
        assertThat(analytics.totalApplications()).isEqualTo(2);
        assertThat(analytics.overdueFollowUps()).isEqualTo(1);
        assertThat(analytics.statusBreakdown()).containsKey("APPLIED");
        assertThat(analytics.statusBreakdown().get("APPLIED")).isEqualTo(5L);
        assertThat(analytics.responseRate()).isCloseTo(54.54, within(0.1));
        assertThat(analytics.applicationsPerWeek()).hasSize(3);
        assertThat(analytics.applicationsPerWeek().get(0).week()).isEqualTo("2024-01");
        assertThat(analytics.applicationsPerWeek().get(0).count()).isEqualTo(3L);
        assertThat(analytics.avgDaysToResponse()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("getAnalytics_zeroResponseRate - Should return 0% response rate when there are no applied applications")
    void getAnalytics_zeroResponseRate() {
        List<Object[]> statusCounts = Collections.singletonList(
                new Object[]{ApplicationStatus.SAVED, 5L}
        );

        when(jobApplicationRepository.countByUserGroupByStatus(testUser)).thenReturn(statusCounts);
        when(jobApplicationRepository.countByUserGroupByWeek(testUser)).thenReturn(Collections.emptyList());
        when(jobApplicationRepository.findByUser(testUser)).thenReturn(Collections.emptyList());
        when(jobApplicationRepository.findOverdueFollowUps(testUser)).thenReturn(Collections.emptyList());

        AnalyticsResponse analytics = jobApplicationService.getAnalytics(testUser);

        assertThat(analytics.responseRate()).isEqualTo(0.0);
        assertThat(analytics.totalApplications()).isEqualTo(0);
        assertThat(analytics.overdueFollowUps()).isEqualTo(0);
    }

    @Test
    @DisplayName("toResponse_overdueFollowUp - Should correctly compute overdueFollowUp flag")
    void toResponse_overdueFollowUp() {
        // Application with a past follow-up date and non-terminal status
        JobApplication overdueApp = JobApplication.builder()
                .id(300L)
                .user(testUser)
                .company("Amazon")
                .role("SDE")
                .status(ApplicationStatus.APPLIED)
                .followUpDate(LocalDate.now().minusDays(1))
                .build();
        overdueApp.setCreatedAt(LocalDateTime.now());
        overdueApp.setUpdatedAt(LocalDateTime.now());

        JobApplicationResponse response = jobApplicationService.toResponse(overdueApp);
        assertThat(response.overdueFollowUp()).isTrue();

        // Application with OFFER status - should NOT be overdue
        JobApplication offerApp = JobApplication.builder()
                .id(301L)
                .user(testUser)
                .company("Netflix")
                .role("SWE")
                .status(ApplicationStatus.OFFER)
                .followUpDate(LocalDate.now().minusDays(1))
                .build();
        offerApp.setCreatedAt(LocalDateTime.now());
        offerApp.setUpdatedAt(LocalDateTime.now());

        JobApplicationResponse offerResponse = jobApplicationService.toResponse(offerApp);
        assertThat(offerResponse.overdueFollowUp()).isFalse();

        // Application with future follow-up date - should NOT be overdue
        JobApplication futureApp = JobApplication.builder()
                .id(302L)
                .user(testUser)
                .company("Stripe")
                .role("Engineer")
                .status(ApplicationStatus.APPLIED)
                .followUpDate(LocalDate.now().plusDays(3))
                .build();
        futureApp.setCreatedAt(LocalDateTime.now());
        futureApp.setUpdatedAt(LocalDateTime.now());

        JobApplicationResponse futureResponse = jobApplicationService.toResponse(futureApp);
        assertThat(futureResponse.overdueFollowUp()).isFalse();
    }
}
