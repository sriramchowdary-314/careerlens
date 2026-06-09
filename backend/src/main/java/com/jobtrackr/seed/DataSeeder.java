package com.jobtrackr.seed;

import com.jobtrackr.entity.ApplicationStatus;
import com.jobtrackr.entity.JobApplication;
import com.jobtrackr.entity.User;
import com.jobtrackr.repository.JobApplicationRepository;
import com.jobtrackr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has users, skipping seed data.");
            return;
        }

        log.info("Seeding demo data...");

        User demoUser = User.builder()
                .email("demo@jobtrackr.com")
                .password(passwordEncoder.encode("demo1234"))
                .firstName("Demo")
                .lastName("User")
                .build();

        demoUser = userRepository.save(demoUser);
        log.info("Created demo user: {}", demoUser.getEmail());

        List<JobApplication> applications = buildDemoApplications(demoUser);
        jobApplicationRepository.saveAll(applications);
        log.info("Seeded {} job applications for demo user.", applications.size());
    }

    private List<JobApplication> buildDemoApplications(User user) {
        LocalDate today = LocalDate.now();
        List<JobApplication> apps = new ArrayList<>();

        // Google - Software Engineer - INTERVIEW
        apps.add(JobApplication.builder()
                .user(user)
                .company("Google")
                .role("Software Engineer L5")
                .link("https://careers.google.com/jobs/12345")
                .salaryMin(new BigDecimal("180000"))
                .salaryMax(new BigDecimal("250000"))
                .location("Mountain View, CA")
                .status(ApplicationStatus.INTERVIEW)
                .appliedDate(today.minusDays(45))
                .followUpDate(today.minusDays(5))
                .notes("Phone screen passed. Onsite interview scheduled for next week. Focusing on system design.")
                .build());

        // Meta - Backend Engineer - OA
        apps.add(JobApplication.builder()
                .user(user)
                .company("Meta")
                .role("Backend Engineer")
                .link("https://www.metacareers.com/jobs/67890")
                .salaryMin(new BigDecimal("190000"))
                .salaryMax(new BigDecimal("260000"))
                .location("Menlo Park, CA")
                .status(ApplicationStatus.OA)
                .appliedDate(today.minusDays(30))
                .followUpDate(today.minusDays(2))
                .notes("Received online assessment link. Need to complete within 7 days.")
                .build());

        // Amazon - Software Development Engineer - OFFER
        apps.add(JobApplication.builder()
                .user(user)
                .company("Amazon")
                .role("Software Development Engineer II")
                .link("https://www.amazon.jobs/en/jobs/11111")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("220000"))
                .location("Seattle, WA")
                .status(ApplicationStatus.OFFER)
                .appliedDate(today.minusDays(60))
                .followUpDate(today.plusDays(7))
                .notes("Offer received! Base: $185k + RSU: $150k/yr + Bonus. Deciding between this and other offers.")
                .build());

        // Apple - iOS Engineer - REJECTED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Apple")
                .role("iOS Software Engineer")
                .link("https://jobs.apple.com/en-us/details/22222")
                .salaryMin(new BigDecimal("175000"))
                .salaryMax(new BigDecimal("230000"))
                .location("Cupertino, CA")
                .status(ApplicationStatus.REJECTED)
                .appliedDate(today.minusDays(75))
                .notes("Rejected after technical phone screen. Asked about UIKit internals and memory management.")
                .build());

        // Netflix - Senior Software Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Netflix")
                .role("Senior Software Engineer")
                .link("https://jobs.netflix.com/jobs/33333")
                .salaryMin(new BigDecimal("250000"))
                .salaryMax(new BigDecimal("900000"))
                .location("Los Gatos, CA (Remote)")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(14))
                .followUpDate(today.minusDays(7))
                .notes("Netflix pays top of market. No equity, all cash. Waiting for recruiter response.")
                .build());

        // Stripe - Backend Engineer - INTERVIEW
        apps.add(JobApplication.builder()
                .user(user)
                .company("Stripe")
                .role("Backend Engineer")
                .link("https://stripe.com/jobs/listing/44444")
                .salaryMin(new BigDecimal("200000"))
                .salaryMax(new BigDecimal("280000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.INTERVIEW)
                .appliedDate(today.minusDays(35))
                .followUpDate(today.plusDays(3))
                .notes("Passed coding round. System design interview next. Focus on payment processing architecture.")
                .build());

        // Airbnb - Full Stack Engineer - SAVED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Airbnb")
                .role("Full Stack Engineer")
                .link("https://careers.airbnb.com/positions/55555")
                .salaryMin(new BigDecimal("170000"))
                .salaryMax(new BigDecimal("230000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.SAVED)
                .notes("Interesting role. Need to tailor resume before applying. Check their tech blog first.")
                .build());

        // Uber - Staff Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Uber")
                .role("Staff Software Engineer")
                .link("https://www.uber.com/us/en/careers/list/66666")
                .salaryMin(new BigDecimal("220000"))
                .salaryMax(new BigDecimal("320000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(20))
                .followUpDate(today.minusDays(13))
                .notes("Applied via referral from ex-colleague. Strong referral should help.")
                .build());

        // Lyft - Senior Backend Engineer - REJECTED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Lyft")
                .role("Senior Backend Engineer")
                .link("https://www.lyft.com/careers/77777")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("210000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.REJECTED)
                .appliedDate(today.minusDays(50))
                .notes("Rejected after hiring freeze. Recruiter said to reapply in Q2.")
                .build());

        // OpenAI - Software Engineer - INTERVIEW
        apps.add(JobApplication.builder()
                .user(user)
                .company("OpenAI")
                .role("Software Engineer, Inference")
                .link("https://openai.com/careers/88888")
                .salaryMin(new BigDecimal("250000"))
                .salaryMax(new BigDecimal("400000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.INTERVIEW)
                .appliedDate(today.minusDays(25))
                .followUpDate(today.plusDays(5))
                .notes("Very competitive. Need to brush up on ML systems and distributed inference.")
                .build());

        // Anthropic - Backend Engineer - OA
        apps.add(JobApplication.builder()
                .user(user)
                .company("Anthropic")
                .role("Backend Software Engineer")
                .link("https://www.anthropic.com/careers/99999")
                .salaryMin(new BigDecimal("230000"))
                .salaryMax(new BigDecimal("380000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.OA)
                .appliedDate(today.minusDays(18))
                .followUpDate(today.minusDays(4))
                .notes("Doing take-home project. Building a simple API with specific requirements.")
                .build());

        // Microsoft - Senior SWE - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Microsoft")
                .role("Senior Software Engineer")
                .link("https://careers.microsoft.com/us/en/job/11112")
                .salaryMin(new BigDecimal("170000"))
                .salaryMax(new BigDecimal("240000"))
                .location("Redmond, WA (Hybrid)")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(10))
                .followUpDate(today.plusDays(4))
                .notes("Applied to Azure team. Good culture and WLB reviews on Glassdoor.")
                .build());

        // Salesforce - Platform Engineer - SAVED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Salesforce")
                .role("Platform Engineer")
                .link("https://salesforce.wd12.myworkdayjobs.com/External_Career_Site/job/11113")
                .salaryMin(new BigDecimal("155000"))
                .salaryMax(new BigDecimal("200000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.SAVED)
                .notes("Interesting Slack integration team. Need to research their Einstein AI platform.")
                .build());

        // Shopify - Backend Developer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Shopify")
                .role("Senior Backend Developer")
                .link("https://www.shopify.com/careers/11114")
                .salaryMin(new BigDecimal("150000"))
                .salaryMax(new BigDecimal("200000"))
                .location("Remote")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(8))
                .notes("Fully remote. Ruby on Rails stack. Good equity program.")
                .build());

        // Twitter/X - Software Engineer - REJECTED
        apps.add(JobApplication.builder()
                .user(user)
                .company("X (Twitter)")
                .role("Software Engineer")
                .link("https://careers.x.com/en/jobs/11115")
                .salaryMin(new BigDecimal("145000"))
                .salaryMax(new BigDecimal("190000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.REJECTED)
                .appliedDate(today.minusDays(80))
                .notes("Rejected quickly. Company going through major restructuring.")
                .build());

        // Datadog - Software Engineer - INTERVIEW
        apps.add(JobApplication.builder()
                .user(user)
                .company("Datadog")
                .role("Software Engineer - Backend")
                .link("https://www.datadoghq.com/careers/detail/11116")
                .salaryMin(new BigDecimal("165000"))
                .salaryMax(new BigDecimal("215000"))
                .location("New York, NY")
                .status(ApplicationStatus.INTERVIEW)
                .appliedDate(today.minusDays(28))
                .followUpDate(today.minusDays(1))
                .notes("Great engineering culture. Go and Python heavy stack. System design round next.")
                .build());

        // Snowflake - Senior Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Snowflake")
                .role("Senior Software Engineer")
                .link("https://careers.snowflake.com/us/en/job/11117")
                .salaryMin(new BigDecimal("190000"))
                .salaryMax(new BigDecimal("260000"))
                .location("San Mateo, CA")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(16))
                .followUpDate(today.minusDays(9))
                .notes("Cloud data platform. Interesting distributed systems problems.")
                .build());

        // Figma - Backend Engineer - OA
        apps.add(JobApplication.builder()
                .user(user)
                .company("Figma")
                .role("Backend Engineer")
                .link("https://www.figma.com/careers/job/11118")
                .salaryMin(new BigDecimal("175000"))
                .salaryMax(new BigDecimal("245000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.OA)
                .appliedDate(today.minusDays(22))
                .followUpDate(today.minusDays(8))
                .notes("Collaborative design tool. Interesting real-time sync challenges.")
                .build());

        // Palantir - Forward Deployed Engineer - SAVED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Palantir")
                .role("Forward Deployed Software Engineer")
                .link("https://jobs.lever.co/palantir/11119")
                .salaryMin(new BigDecimal("140000"))
                .salaryMax(new BigDecimal("185000"))
                .location("New York, NY")
                .status(ApplicationStatus.SAVED)
                .notes("Government/enterprise focus. Unique role combining engineering and consulting.")
                .build());

        // Notion - Full Stack Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Notion")
                .role("Full Stack Software Engineer")
                .link("https://www.notion.so/careers/11120")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("220000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(12))
                .notes("Great product, strong growth. TypeScript and React heavy.")
                .build());

        // Confluent - Platform Engineer - REJECTED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Confluent")
                .role("Senior Platform Engineer")
                .link("https://www.confluent.io/careers/job/11121")
                .salaryMin(new BigDecimal("170000"))
                .salaryMax(new BigDecimal("230000"))
                .location("Mountain View, CA (Remote)")
                .status(ApplicationStatus.REJECTED)
                .appliedDate(today.minusDays(55))
                .notes("Kafka streaming platform. Great technology but rejected after system design round.")
                .build());

        // Vercel - Backend Engineer - SAVED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Vercel")
                .role("Backend Engineer")
                .link("https://vercel.com/careers/11122")
                .salaryMin(new BigDecimal("155000"))
                .salaryMax(new BigDecimal("205000"))
                .location("Remote")
                .status(ApplicationStatus.SAVED)
                .notes("Edge computing and Next.js deployment. Small but fast-growing team.")
                .build());

        // HashiCorp - Senior SWE - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("HashiCorp")
                .role("Senior Software Engineer - Terraform")
                .link("https://www.hashicorp.com/job/11123")
                .salaryMin(new BigDecimal("165000"))
                .salaryMax(new BigDecimal("220000"))
                .location("Remote")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(7))
                .notes("Infrastructure as code. Go-heavy stack. Good remote culture.")
                .build());

        // Cloudflare - Systems Engineer - INTERVIEW
        apps.add(JobApplication.builder()
                .user(user)
                .company("Cloudflare")
                .role("Systems Software Engineer")
                .link("https://www.cloudflare.com/careers/jobs/11124")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("215000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.INTERVIEW)
                .appliedDate(today.minusDays(40))
                .followUpDate(today.minusDays(3))
                .notes("Edge network infrastructure. Rust and Go. Fascinating distributed systems at scale.")
                .build());

        // Twilio - Senior Engineer - OA
        apps.add(JobApplication.builder()
                .user(user)
                .company("Twilio")
                .role("Senior Software Engineer")
                .link("https://careers.twilio.com/jobs/11125")
                .salaryMin(new BigDecimal("155000"))
                .salaryMax(new BigDecimal("210000"))
                .location("San Francisco, CA (Remote)")
                .status(ApplicationStatus.OA)
                .appliedDate(today.minusDays(17))
                .followUpDate(today.minusDays(10))
                .notes("Communications API platform. Good W-2 benefits and remote options.")
                .build());

        // GitHub - Backend Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("GitHub")
                .role("Backend Engineer")
                .link("https://github.com/about/careers/11126")
                .salaryMin(new BigDecimal("170000"))
                .salaryMax(new BigDecimal("235000"))
                .location("Remote")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(5))
                .notes("Working on developer tools used by millions. Ruby on Rails + Go.")
                .build());

        // Discord - Infrastructure Engineer - SAVED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Discord")
                .role("Infrastructure Software Engineer")
                .link("https://discord.com/jobs/11127")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("215000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.SAVED)
                .notes("Real-time messaging at scale. Rust-based backend is interesting.")
                .build());

        // Plaid - Senior Backend Engineer - APPLIED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Plaid")
                .role("Senior Backend Engineer")
                .link("https://plaid.com/careers/11128")
                .salaryMin(new BigDecimal("175000"))
                .salaryMax(new BigDecimal("240000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.APPLIED)
                .appliedDate(today.minusDays(9))
                .followUpDate(today.plusDays(5))
                .notes("Fintech API platform. Interesting compliance and security challenges.")
                .build());

        // Robinhood - Platform Engineer - REJECTED
        apps.add(JobApplication.builder()
                .user(user)
                .company("Robinhood")
                .role("Senior Platform Engineer")
                .link("https://careers.robinhood.com/jobs/11129")
                .salaryMin(new BigDecimal("160000"))
                .salaryMax(new BigDecimal("215000"))
                .location("Menlo Park, CA")
                .status(ApplicationStatus.REJECTED)
                .appliedDate(today.minusDays(65))
                .notes("Fintech trading platform. Rejected after first round due to culture mismatch concerns.")
                .build());

        // Databricks - Staff Engineer - OFFER
        apps.add(JobApplication.builder()
                .user(user)
                .company("Databricks")
                .role("Staff Software Engineer")
                .link("https://www.databricks.com/company/careers/11130")
                .salaryMin(new BigDecimal("250000"))
                .salaryMax(new BigDecimal("370000"))
                .location("San Francisco, CA")
                .status(ApplicationStatus.OFFER)
                .appliedDate(today.minusDays(70))
                .followUpDate(today.plusDays(3))
                .notes("Competing offer to Amazon! Base: $220k + equity. Data/AI platform team. Very exciting role.")
                .build());

        return apps;
    }
}
