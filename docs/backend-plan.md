# DentAyos — Backend Migration & Production Architecture Plan

> **Status:** Planning document. Current prototype is client-side only. This document defines the target production architecture and the step-by-step migration path.

---

## 1. Current Prototype Limitations

The live prototype at `vergel1231.github.io/dentayos-website` works as a demo but has critical limitations that **must be resolved before any real clinic goes live with real patient data.**

| Area | Current State | Risk |
|---|---|---|
| **Authentication** | Hardcoded usernames/passwords in `clinic.js`, `patient.js`, `owner.js` | Anyone who views source has all credentials |
| **Authorization** | No server-side enforcement — all role logic runs in the browser | Any user can manipulate JS to access any section |
| **Data storage** | `localStorage` only — browser-scoped, device-specific, clears in incognito | No real persistence; data is not shared across devices or users |
| **Patient records** | Hardcoded in JS arrays | Records reset on page refresh; no real database |
| **Appointment sync** | `localStorage` keys shared in the same browser session only | Does not work across devices or users as intended |
| **Multi-tenancy** | Not enforced — all clinic data is visible to anyone with portal access | Clinic A could theoretically see Clinic B's patients |
| **Data Privacy Act (PH)** | RA 10173 requires proper data handling, consent logging, and breach notification | Non-compliant in current state |

---

## 2. Target Production Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Static — GitHub Pages or Netlify)                    │
│  HTML + CSS + Vanilla JS  →  React + Vite (future)              │
│  clinic.html · patient.html · owner.html · index.html           │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS (all requests)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API  (Node.js + Express on Render or Railway)          │
│  REST API with JWT middleware                                    │
│  Role-based access control (Owner / Staff / Patient)            │
└───────┬────────────────────────┬────────────────────────────────┘
        │                        │
        ▼                        ▼
┌───────────────┐     ┌──────────────────────────────────────┐
│ Firebase Auth │     │ PostgreSQL (Render managed DB)        │
│ Session tokens│     │ clinics · users · patients ·          │
│ OTP / email   │     │ appointments · treatments ·           │
└───────────────┘     │ notifications · audit_logs            │
                      └──────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
         Twilio SMS          Resend Email        PayMongo
         Reminders           Confirmations       Subscriptions
```

### 2.1 Frontend (Static)
- Keep existing HTML/CSS/JS structure for now; swap `fetch` calls from `localStorage` to the API
- Long-term: migrate to React + Vite with proper routing (`/clinic`, `/patient`, `/owner`)
- All sensitive operations move server-side — the browser only handles display and form input

### 2.2 Backend API
**Recommended:** Node.js + Express  
**Alternative:** Python + FastAPI (if preferred for readability)

Hosting: **Render** (free tier supports Node + PostgreSQL add-on) or **Railway**

```
dentayos-api/
├── src/
│   ├── routes/         # auth, clinics, patients, appointments, records, notifications
│   ├── middleware/      # auth.js (JWT verify), rbac.js (role check), rateLimiter.js
│   ├── models/          # Sequelize or Prisma ORM models
│   ├── services/        # twilio.js, resend.js, paymongo.js
│   └── app.js
├── .env                 # secrets — never committed
└── package.json
```

### 2.3 Authentication
**Provider:** Firebase Authentication  
**Strategy:** Email/password login → Firebase issues ID token → backend verifies token on every request

```
Login flow:
1. User submits credentials to Firebase Auth (client-side SDK)
2. Firebase returns a signed ID token (JWT, ~1hr expiry)
3. Client stores token in memory (not localStorage — use httpOnly cookie or in-memory)
4. Every API request includes: Authorization: Bearer <token>
5. Backend middleware calls Firebase Admin SDK to verify token
6. Verified token contains uid, email, role (set via Firebase Custom Claims)
```

**Custom Claims** (set server-side via Firebase Admin SDK):
```json
{
  "role": "staff" | "patient" | "owner",
  "clinicId": "uuid"
}
```

**Session expiry:** 24 hours (Firebase default). Refresh tokens handled by Firebase SDK automatically.

### 2.4 Database
**Engine:** PostgreSQL  
**ORM:** Prisma (recommended for type safety) or Sequelize

See full data model in Section 4.

### 2.5 Authorization / RBAC

| Role | Access |
|---|---|
| `owner` | All clinics, all revenue data, add/remove clinics, view all activity |
| `staff` | Own clinic only — patients, appointments, reminders for their `clinicId` |
| `patient` | Own records only — view own history, book appointments, receive notifications |

Enforced **server-side** in `middleware/rbac.js` — never trust the client for role decisions.

---

## 3. API Surface

Base URL: `https://api.dentayos.com/v1`  
All endpoints require `Authorization: Bearer <firebase_id_token>` except `/auth/*`.

### Auth
```
POST   /auth/login           → Verify Firebase token, return user profile + role
POST   /auth/signup          → Register new patient account (links Firebase UID to DB user)
POST   /auth/logout          → Invalidate session / revoke refresh token
GET    /auth/me              → Return current user profile from token
```

### Clinics
```
GET    /clinics                    → [owner] List all clinics
POST   /clinics                    → [owner] Create new clinic
GET    /clinics/:clinicId          → [owner, staff] Get clinic details
PATCH  /clinics/:clinicId          → [owner] Update clinic info
DELETE /clinics/:clinicId          → [owner] Deactivate clinic
```

### Users / Staff
```
GET    /clinics/:clinicId/staff          → [owner, admin] List staff accounts
POST   /clinics/:clinicId/staff          → [owner, admin] Add staff member
PATCH  /clinics/:clinicId/staff/:userId  → [owner, admin] Update role or status
DELETE /clinics/:clinicId/staff/:userId  → [owner] Remove staff
```

### Patients
```
GET    /clinics/:clinicId/patients             → [staff] List all patients
POST   /clinics/:clinicId/patients             → [staff] Add new patient
GET    /clinics/:clinicId/patients/:patientId  → [staff, patient (own)] Get patient record
PATCH  /clinics/:clinicId/patients/:patientId  → [staff] Update patient record
```

### Appointments
```
GET    /clinics/:clinicId/appointments                    → [staff] List all appointments
POST   /clinics/:clinicId/appointments                    → [patient] Book appointment
GET    /clinics/:clinicId/appointments/:apptId            → [staff, patient (own)]
PATCH  /clinics/:clinicId/appointments/:apptId            → [staff] Confirm / reschedule / decline
DELETE /clinics/:clinicId/appointments/:apptId            → [staff] Cancel
```

### Treatment Records
```
GET    /clinics/:clinicId/patients/:patientId/records          → [staff, patient (own)] List history
POST   /clinics/:clinicId/patients/:patientId/records          → [staff] Add treatment record
PATCH  /clinics/:clinicId/patients/:patientId/records/:id      → [staff] Update record
```

### Notifications / Reminders
```
GET    /patients/:patientId/notifications          → [patient] Get notifications feed
POST   /clinics/:clinicId/reminders                → [staff] Send reminder to patient
PATCH  /patients/:patientId/notifications/:id      → [patient] Mark as read
```

### Revenue (Owner only)
```
GET    /revenue                     → [owner] Platform-wide monthly summary
GET    /revenue/:clinicId           → [owner] Per-clinic revenue breakdown
```

---

## 4. Data Model

### `clinics`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          TEXT NOT NULL
owner_contact TEXT
location      TEXT
plan          TEXT CHECK (plan IN ('Pilot', 'Standard'))
monthly_fee   INTEGER NOT NULL
status        TEXT CHECK (status IN ('active', 'trial', 'suspended')) DEFAULT 'trial'
joined_at     TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `users` (staff + owner accounts)
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
firebase_uid  TEXT UNIQUE NOT NULL        -- links to Firebase Auth
clinic_id     UUID REFERENCES clinics(id) -- NULL for owner role
name          TEXT NOT NULL
email         TEXT UNIQUE NOT NULL
role          TEXT CHECK (role IN ('owner', 'dentist', 'admin', 'receptionist', 'assistant'))
initials      TEXT
is_active     BOOLEAN DEFAULT TRUE
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `patients`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
firebase_uid  TEXT UNIQUE              -- set when patient self-registers
clinic_id     UUID REFERENCES clinics(id) NOT NULL
name          TEXT NOT NULL
age           INTEGER
contact       TEXT
concern       TEXT
dentist       TEXT
blood_type    TEXT
allergies     TEXT
status        TEXT CHECK (status IN ('active', 'pending', 'new')) DEFAULT 'new'
since         DATE DEFAULT CURRENT_DATE
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `appointments`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
clinic_id     UUID REFERENCES clinics(id) NOT NULL
patient_id    UUID REFERENCES patients(id) NOT NULL
concern       TEXT NOT NULL
appt_date     DATE NOT NULL
appt_time     TEXT NOT NULL
status        TEXT CHECK (status IN ('pending', 'confirmed', 'declined', 'rescheduled', 'completed')) DEFAULT 'pending'
booked_by     TEXT CHECK (booked_by IN ('patient', 'staff')) DEFAULT 'patient'
notes         TEXT
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `treatment_records`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
clinic_id     UUID REFERENCES clinics(id) NOT NULL
patient_id    UUID REFERENCES patients(id) NOT NULL
procedure     TEXT NOT NULL
dentist       TEXT NOT NULL
notes         TEXT
visit_date    DATE NOT NULL
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `notifications`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
patient_id    UUID REFERENCES patients(id) NOT NULL
clinic_id     UUID REFERENCES clinics(id) NOT NULL
message       TEXT NOT NULL
is_read       BOOLEAN DEFAULT FALSE
channel       TEXT CHECK (channel IN ('portal', 'sms', 'email')) DEFAULT 'portal'
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `audit_logs`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
actor_id      UUID NOT NULL            -- user who performed the action
clinic_id     UUID REFERENCES clinics(id)
action        TEXT NOT NULL            -- e.g. 'appointment.confirmed', 'patient.created'
target_type   TEXT                     -- 'appointment', 'patient', etc.
target_id     UUID
metadata      JSONB                    -- additional context
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### Relationships Summary
```
clinics       1 ── ∞  users (staff)
clinics       1 ── ∞  patients
clinics       1 ── ∞  appointments
patients      1 ── ∞  appointments
patients      1 ── ∞  treatment_records
patients      1 ── ∞  notifications
clinics       1 ── ∞  audit_logs
```

---

## 5. Security Checklist

### Input Validation
- [ ] All API inputs validated with `zod` or `joi` before hitting the database
- [ ] String fields: `trim()`, max length enforced
- [ ] Phone numbers: PH format regex validated server-side
- [ ] Enum fields (role, status, plan): validated against allowlist
- [ ] UUID params: validated as valid UUID before DB query

### Authentication & Authorization
- [ ] Firebase ID token verified on every protected request (not just login)
- [ ] `clinicId` from token — never trust `clinicId` from request body or params alone
- [ ] Role check middleware runs before route handler, not inside it
- [ ] Patients can only access their own records (check `patient.firebase_uid === token.uid`)
- [ ] Staff can only access patients where `patient.clinic_id === token.clinicId`

### Rate Limiting
- [ ] Global: 100 requests / 15 min per IP (`express-rate-limit`)
- [ ] Auth endpoints: 10 requests / 15 min per IP (stricter)
- [ ] Appointment booking: 5 requests / hour per patient account

### Transport & Storage
- [ ] HTTPS enforced — all HTTP redirects to HTTPS
- [ ] Passwords: Firebase handles hashing (bcrypt) — never store plaintext
- [ ] Database connection over SSL (`?ssl=true` in connection string)
- [ ] `.env` file never committed — use Render/Railway environment variable UI
- [ ] Sensitive fields (blood type, allergies) encrypted at rest using PostgreSQL `pgcrypto` (phase 2)

### Audit & Monitoring
- [ ] All create/update/delete operations write to `audit_logs`
- [ ] Failed login attempts logged (Firebase provides this natively)
- [ ] Render/Railway error logging enabled (connect to Sentry or LogTail)
- [ ] Monthly data access review by owner (RA 10173 compliance)

### Philippine Data Privacy Act (RA 10173)
- [ ] Patient consent recorded at signup (consent timestamp + version stored in `patients` table)
- [ ] Data Subject Access Request (DSAR) endpoint: `GET /patients/:id/export` returns all data
- [ ] Data deletion endpoint: `DELETE /patients/:id` (soft-delete + anonymize)
- [ ] Privacy policy page linked from all portals
- [ ] NPC registration when handling personal data of 1,000+ individuals

---

## 6. Migration Plan

### Phase 0 — Prerequisite (Before any live clinic data)
- [ ] Set up a private repo for `dentayos-api` (separate from the frontend repo)
- [ ] Provision PostgreSQL on Render (free tier: 1GB, sufficient for pilot)
- [ ] Create Firebase project, enable Email/Password auth, generate Admin SDK service account
- [ ] Store all secrets in Render environment variables (never in code)

### Phase 1 — Auth Migration (Week 1–2)
- [ ] Build `/auth/login`, `/auth/signup`, `/auth/me` endpoints
- [ ] Replace hardcoded `staffAccounts` in `clinic.js` with Firebase login + API `/auth/me` call
- [ ] Replace hardcoded `patientAccounts` in `patient.js` with Firebase signup + API call
- [ ] Replace hardcoded `OWNER` in `owner.js` with Firebase login
- [ ] Test: all three portals log in via real Firebase credentials
- [ ] Deploy API to Render; update frontend `fetch` base URL

### Phase 2 — Patient & Appointment Data (Week 2–3)
- [ ] Migrate `patients` array from `clinic.js` to PostgreSQL `patients` table
- [ ] Build CRUD endpoints for `/clinics/:id/patients` and `/clinics/:id/appointments`
- [ ] Replace `localStorage.getItem('dentayos_appointments')` with `POST /appointments`
- [ ] Replace appointment confirmation logic with `PATCH /appointments/:id` (`status: 'confirmed'`)
- [ ] Replace reschedule logic with `PATCH /appointments/:id` + write to `notifications` table
- [ ] Test: book appointment as patient → appears in clinic portal in real-time
- [ ] Keep `localStorage` as a fallback display cache during transition (read-through pattern)

### Phase 3 — Notifications & Reminders (Week 3–4)
- [ ] Build `POST /reminders` endpoint that writes to `notifications` table and triggers Twilio SMS
- [ ] Build `GET /patients/:id/notifications` endpoint
- [ ] Replace localStorage polling in `patient.js` with polling `GET /notifications` every 30s
- [ ] Test: clinic sends reminder → patient portal shows it within 30 seconds
- [ ] Remove all localStorage notification keys

### Phase 4 — Treatment Records (Week 4–5)
- [ ] Build CRUD for `/patients/:id/records`
- [ ] Migrate hardcoded `history` arrays in `patient.js` to `treatment_records` table
- [ ] Test: add treatment note as staff → appears in patient history immediately

### Phase 5 — Owner Portal & Revenue (Week 5–6)
- [ ] Build `/clinics`, `/revenue` endpoints
- [ ] Migrate `clinics` array in `owner.js` to database
- [ ] Build `POST /clinics` to replace Add Clinic modal
- [ ] Build `DELETE /clinics/:id` (soft-delete, set `status: 'suspended'`)
- [ ] Revenue figures pulled from real `appointments` + `clinics.monthly_fee` data
- [ ] Test: add clinic as owner → appears in dashboard immediately

### Phase 6 — Hardening & Go-Live (Week 6–8)
- [ ] Remove all hardcoded credential arrays from JS files
- [ ] Remove all `localStorage` appointment sync code
- [ ] Run through security checklist (Section 5)
- [ ] Add rate limiting middleware
- [ ] Set up audit_logs writes for all mutations
- [ ] Final QA across all three portals with real Firebase accounts
- [ ] Deploy frontend update with correct API base URL
- [ ] Onboard pilot clinic with real staff accounts created via Firebase Admin SDK

### Rollback Strategy
- During phases 1–4, keep the static `localStorage` prototype live at a separate URL (e.g., `vergel1231.github.io/dentayos-website/v1/`)
- New backend-connected version deploys to the main URL
- If a phase fails, revert frontend to previous commit — API changes are additive and backward-compatible

---

## 7. Recommended Tools & Services

| Purpose | Tool | Cost (pilot) |
|---|---|---|
| Backend runtime | Node.js + Express | Free |
| Database | PostgreSQL on Render | Free (1GB) |
| Auth | Firebase Authentication | Free (10k users/month) |
| ORM | Prisma | Free |
| SMS reminders | Twilio | ~₱2.50/SMS |
| Email | Resend | Free (100/day) |
| Payments | PayMongo | 2.5% + ₱15/txn |
| Hosting (API) | Render | Free tier → $7/mo |
| Hosting (Frontend) | GitHub Pages | Free |
| Error monitoring | Sentry | Free (5k errors/mo) |
| Validation | zod | Free |
| Rate limiting | express-rate-limit | Free |

**Estimated monthly cost at pilot scale (1–5 clinics):** ₱500–₱1,200/month including SMS volume.

---

*Document created: March 2026. Update this file as architecture decisions are finalized.*
