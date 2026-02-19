# 🧑‍💼 JobBoard API

A full-featured, production-ready job board REST API built with **NestJS**, **TypeORM**, and **PostgreSQL**. Supports job seekers, employers, and admins with role-based access, file uploads, pagination, rate limiting, and more.

---

## 🚀 Features

- **Authentication & Authorization** — JWT-based auth with role-based access control (Job Seeker, Employer, Admin)
- **Job Management** — Full CRUD for job postings with status/review workflows and employer-specific controls
- **Application System** — Job seekers can apply, track, and withdraw applications; employers can review and manage them
- **Company Profiles** — Employers can create and manage company pages with logo uploads
- **Admin Panel** — Admins can manage users, jobs, companies, and applications including banning, verifying, and moderation
- **File Uploads** — Avatar, resume, and company logo uploads via **Cloudinary**
- **Advanced Pagination & Filtering** — Powered by `nestjs-paginate` with sort, search, and filter support on all major resources
- **Rate Limiting** — Global throttling via `@nestjs/throttler` with per-route overrides
- **Email Verification** — Email change flow with tokenized verification links
- **API Documentation** — Auto-generated Swagger/OpenAPI docs at `/api/docs`
- **Security** — Helmet middleware, CORS configuration, input validation with `class-validator`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Database | PostgreSQL + TypeORM |
| Auth | JWT (Passport) |
| File Storage | Cloudinary |
| Pagination | nestjs-paginate |
| Validation | class-validator / class-transformer |
| Rate Limiting | @nestjs/throttler |
| API Docs | Swagger / OpenAPI |
| Security | Helmet, CORS |

---

## 📁 Project Structure

```
src/
├── auth/               # Registration, login, JWT strategy, email verification
├── users/              # User profile management (avatar, resume, email change)
├── jobs/               # Job CRUD, status & review workflow
├── companies/          # Company profiles with logo uploads
├── applications/       # Application lifecycle for seekers & employers
├── admin/              # Admin-only services for users, jobs, companies, applications
├── cloudinary/         # File upload abstraction
└── common/             # Guards, decorators, filters, enums, interfaces
```

---

## 🔐 Roles & Access

| Role | Capabilities |
|---|---|
| **Job Seeker** | Browse jobs & companies, apply, track/withdraw applications, manage profile |
| **Employer** | Post/manage jobs, manage company profile, review applications & add notes |
| **Admin** | Full access — verify companies, moderate jobs, manage users & applications |

---

## 📡 API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/verify-email` | Verify email token |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update profile (avatar/resume upload) |
| DELETE | `/users/me` | Delete account |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | List all published jobs (paginated) |
| GET | `/jobs/:id` | Get a single job |
| POST | `/jobs` | Create a job (Employer) |
| PUT | `/jobs/:id` | Update a job (Employer) |
| DELETE | `/jobs/:id` | Delete a job (Employer) |
| PATCH | `/jobs/:id/status` | Publish/draft a job (Employer) |
| PATCH | `/jobs/:id/close` | Close/reopen a job (Employer) |
| GET | `/jobs/my-posting` | Get employer's own jobs |
| GET | `/jobs/company/:companyId` | Get jobs by company |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/jobs/:jobId/applications` | Submit an application (resume upload) |
| GET | `/jobs/:jobId/applications` | Get applications for a job (Employer) |
| GET | `/jobs/:jobId/applications/stats` | Application stats for a job (Employer) |
| PATCH | `/jobs/:jobId/applications/:id/status` | Update application status (Employer) |
| PATCH | `/jobs/:jobId/applications/:id/note` | Add employer note (Employer) |
| GET | `/applications` | Get current user's applications |
| PATCH | `/applications/:id/withdraw` | Withdraw an application |

### Companies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/companies` | List verified companies (paginated) |
| GET | `/companies/:id` | Get company by ID |
| GET | `/companies/slug/:slug` | Get company by slug |
| POST | `/companies` | Create a company (Employer) |
| PUT | `/companies/:id` | Update a company (Employer) |
| DELETE | `/companies/:id` | Delete a company (Employer) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| PATCH | `/admin/users/:id/active` | Activate/deactivate user |
| PATCH | `/admin/users/:id/role` | Change user role |
| GET | `/admin/jobs` | List all jobs |
| PATCH | `/admin/jobs/:id/approve` | Approve a job |
| PATCH | `/admin/jobs/:id/reject` | Reject a job |
| PATCH | `/admin/jobs/:id/takedown` | Take down a live job |
| GET | `/admin/companies` | List all companies |
| PATCH | `/admin/companies/:id/verify` | Verify a company |
| PATCH | `/admin/companies/:id/ban` | Ban/unban a company |
| GET | `/admin/applications` | List all applications |
| PATCH | `/admin/applications/:id/status` | Update application status |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js >= 18
- PostgreSQL
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jobboard-api.git
cd jobboard-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=jobboard
DB_SSL=false

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 4. Run the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 5. View API docs
Navigate to [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔄 Job Review Workflow

Jobs go through a review lifecycle before appearing publicly:

```
DRAFT → PUBLISHED → [Admin Review] → APPROVED (visible) / REJECTED / TAKEN_DOWN
```

Employers control `status` (draft/published) while admins control `reviewStatus` (pending/approved/rejected/taken_down).

---

## 📬 Application Status Flow

```
PENDING → REVIEWED → ACCEPTED
                   → REJECTED
       → WITHDRAWN (by applicant, any time before finalization)
```

---

## 📄 License

MIT
