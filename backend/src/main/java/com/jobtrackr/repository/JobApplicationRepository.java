package com.jobtrackr.repository;

import com.jobtrackr.entity.ApplicationStatus;
import com.jobtrackr.entity.JobApplication;
import com.jobtrackr.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>,
        JpaSpecificationExecutor<JobApplication> {

    Page<JobApplication> findByUser(User user, Pageable pageable);

    List<JobApplication> findByUser(User user);

    long countByUserAndStatus(User user, ApplicationStatus status);

    @Query("SELECT j FROM JobApplication j WHERE j.user = :user AND j.followUpDate < CURRENT_DATE AND j.status NOT IN ('OFFER', 'REJECTED')")
    List<JobApplication> findOverdueFollowUps(@Param("user") User user);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j WHERE j.user = :user GROUP BY j.status")
    List<Object[]> countByUserGroupByStatus(@Param("user") User user);

    @Query("SELECT TO_CHAR(j.appliedDate, 'IYYY-IW'), COUNT(j) FROM JobApplication j WHERE j.user = :user AND j.appliedDate IS NOT NULL GROUP BY TO_CHAR(j.appliedDate, 'IYYY-IW') ORDER BY TO_CHAR(j.appliedDate, 'IYYY-IW')")
    List<Object[]> countByUserGroupByWeek(@Param("user") User user);
}
