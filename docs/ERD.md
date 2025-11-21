# Course Creator SaaS ERD

Textual ERD description (Phase 0):

- **users** (id PK, firebase_uid unique, email, role, timestamps)
  - One-to-one with **creators** and **students** (depending on role).
- **creators** (id PK/FK → users.id, display_name, bio, stripe_customer_id, current_plan, subscription metadata, timestamps)
  - One-to-many **courses**.
- **students** (id PK/FK → users.id, display_name, timestamps)
  - Many-to-many **courses** through **enrollments**.
- **courses** (id PK, creator_id FK → creators.id, title, description, thumbnail_url, slug unique, is_published, price, drip_enabled, timestamps)
  - One-to-many **modules**.
- **modules** (id PK, course_id FK → courses.id, title, order_index, timestamps)
  - One-to-many **lessons**.
- **lessons** (id PK, module_id FK → modules.id, title, content_type, content_url/content_body, drip_delay_days, order_index, timestamps)
  - Completed by students tracked via **progress**.
- **enrollments** (id PK, course_id FK → courses.id, student_id FK → students.id, created_at, unique(course_id, student_id))
- **progress** (id PK, student_id FK → students.id, lesson_id FK → lessons.id, completed_at, unique(student_id, lesson_id))
- **subscriptions** (id PK, creator_id FK → creators.id, stripe_customer_id, stripe_subscription_id, status, current_period_end, timestamps)

Indexes: firebase_uid on users; creator_id on courses; course_id on modules; module_id on lessons; course_id + student_id unique on enrollments; student_id + lesson_id unique on progress; creator_id on subscriptions.

## Planned API endpoints (Phase 0)
- /api/me
- /api/auth/sync
- /api/profile/creator
- /api/profile/student
- /api/courses, /api/courses/[id]
- /api/courses/[id]/modules
- /api/modules/[id]/lessons
- /api/enrollments
- /api/progress
- /api/analytics/*
- /api/billing/create-checkout-session
- /api/webhooks/stripe
