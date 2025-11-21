-- Core users table linked to Firebase UID
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text,
  role text check (role in ('creator','student')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_users_firebase_uid on users(firebase_uid);

create table if not exists creators (
  id uuid primary key references users(id) on delete cascade,
  display_name text not null,
  bio text,
  stripe_customer_id text,
  current_plan text default 'free' check (current_plan in ('free','pro')),
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key references users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  title text not null,
  description text,
  thumbnail_url text,
  slug text unique not null,
  is_published boolean default false,
  price numeric,
  drip_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_courses_creator on courses(creator_id);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_modules_course on modules(course_id);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  content_type text not null check (content_type in ('video','text','pdf')),
  content_url text,
  content_body text,
  drip_delay_days int,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_lessons_module on lessons(module_id);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);
create index if not exists idx_enrollments_course on enrollments(course_id);
create index if not exists idx_enrollments_student on enrollments(student_id);

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(student_id, lesson_id)
);
create index if not exists idx_progress_student on progress(student_id);
create index if not exists idx_progress_lesson on progress(lesson_id);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_subscriptions_creator on subscriptions(creator_id);
