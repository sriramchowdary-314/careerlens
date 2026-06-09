# JobTrackr

A production-quality full-stack job application tracker built with Spring Boot 3, React 18, and PostgreSQL.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│                    React 18 + Vite + Tailwind                   │
│           Kanban Board │ Table View │ Analytics Dashboard       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (JWT Bearer)
┌────────────────────────────▼────────────────────────────────────┐
│                    Spring Boot 3 Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ AuthController│  │  AppController│  │ GlobalExHandler    │    │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘    │
│         │                 │                                      │
│  ┌──────▼───────┐  ┌──────▼───────┐                            │
│  │  AuthService │  │  AppService  │  Spring Security + JWT      │
│  └──────┬───────┘  └──────┬───────┘  JwtAuthenticationFilter   │
│         │                 │                                      │
│  ┌──────▼─────────────────▼───────┐                            │
│  │    Spring Data JPA Repositories│                             │
│  └──────────────────┬─────────────┘                            │
└─────────────────────┼───────────────────────────────────────────┘
                      │ JDBC
┌─────────────────────▼───────────────────────────────────────────┐
│                    PostgreSQL 16                                 │
│   users │ job_applications │ refresh_tokens                     │
└─────────────────────────────────────────────────────────────────┘
```

## ERD

```
┌──────────────────┐       ┌──────────────────────────┐
│      users       │       │     job_applications      │
├──────────────────┤       ├──────────────────────────┤
│ id (PK)          │──────<│ id (PK)                   │
│ email (UNIQUE)   │       │ user_id (FK → users)      │
│ password         │       │ company                   │
│ first_name       │       │ role                      │
│ last_name        │       │ link                      │
│ created_at       │       │ salary_min                │
└──────────────────┘       │ salary_max                │
                           │ location                  │
┌──────────────────┐       │ status (enum)             │
│  refresh_tokens  │       │ applied_date              │
├──────────────────┤       │ notes (TEXT)              │
│ id (PK)          │       │ follow_up_date            │
│ token (UNIQUE)   │       │ created_at                │
│ user_id (FK)     │       │ updated_at                │
│ expiry_date      │       └──────────────────────────┘
│ revoked          │
└──────────────────┘
```

## Features

- **Authentication** — JWT access tokens (15 min) + refresh tokens (7 days), BCrypt passwords
- **Job Applications CRUD** — company, role, link, salary range, location, status, dates, notes
- **Kanban Board** — drag-and-drop between status columns (SAVED → APPLIED → OA → INTERVIEW → OFFER / REJECTED)
- **Table View** — search, filter by status, sortable columns, pagination
- **Analytics Dashboard** — applications per week (bar chart), status distribution (pie chart), response rate
- **Overdue Follow-ups** — visual highlight when follow-up date has passed
- **Swagger UI** — interactive API docs at `/swagger-ui/index.html`
- **Seed Data** — 30 realistic sample applications with demo account

## Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- (For local dev) Java 17, Maven 3.9+, Node 20+

### Running with Docker Compose

```bash
# 1. Clone and enter the project
git clone <repo-url> && cd jobtrackr

# 2. Copy env file and set a strong JWT secret
cp .env.example .env
# Edit .env — at minimum change DB_PASSWORD and JWT_SECRET

# 3. Build and start all services
docker compose up --build

# 4. Open the app
open http://localhost:3000

# 5. Demo credentials (seeded automatically)
#    Email:    demo@jobtrackr.com
#    Password: demo1234
```

### Local Development

**Backend:**
```bash
cd backend

# Start only PostgreSQL
docker compose up db -d

# Run the Spring Boot app
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-DSPRING_PROFILES_ACTIVE=local"

# Swagger UI available at:
open http://localhost:8080/swagger-ui/index.html
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

### Running Tests

```bash
cd backend
mvn test
# or with Maven wrapper:
./mvnw test
```

## Project Structure

```
jobtrackr/
├── backend/                        # Spring Boot 3 application
│   ├── src/
│   │   ├── main/java/com/jobtrackr/
│   │   │   ├── config/             # Security, Swagger config
│   │   │   ├── controller/         # REST endpoints
│   │   │   ├── dto/                # Request & Response DTOs
│   │   │   ├── entity/             # JPA entities
│   │   │   ├── exception/          # Global exception handler
│   │   │   ├── repository/         # Spring Data repos
│   │   │   ├── security/           # JWT filter & util
│   │   │   ├── seed/               # Demo data seeder
│   │   │   └── service/            # Business logic
│   │   └── test/                   # JUnit 5 + Mockito tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                       # React 18 + Vite application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # Auth context + provider
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── pages/                  # Route-level page components
│   │   └── services/               # Axios API layer
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/applications` | List applications (paginated, filterable) |
| POST | `/api/applications` | Create application |
| GET | `/api/applications/:id` | Get single application |
| PUT | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |
| PATCH | `/api/applications/:id/status` | Update status only |
| GET | `/api/applications/analytics` | Get analytics data |

Full interactive docs: `http://localhost:8080/swagger-ui/index.html`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://db:5432/jobtrackr` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | *(built-in dev key)* | Base64-encoded JWT signing secret |
| `BACKEND_PORT` | `8080` | Exposed backend port |
| `FRONTEND_PORT` | `3000` | Exposed frontend port |
| `DB_PORT` | `5432` | Exposed PostgreSQL port |

## Screenshots

> Add screenshots here after first run.

## License

MIT
