-- POTW is accessed through authenticated server APIs, never directly by browsers.
create table public.potw_students (
  id uuid primary key default gen_random_uuid(), student_id text not null unique,
  display_name text not null, active boolean not null default true,
  approved_by uuid references auth.users(id), approved_at timestamptz not null default clock_timestamp(),
  check (student_id = lower(btrim(student_id)) and length(student_id) between 1 and 80)
);
create table public.potw_student_emails (
  email text primary key, student_id uuid not null references public.potw_students(id),
  check (email = lower(btrim(email)) and email ~ '@(ds|es)\.study\.iitm\.ac\.in$')
);
create index potw_student_emails_student on public.potw_student_emails(student_id);
create table public.potw_student_accounts (
  user_id uuid primary key references auth.users(id), student_id uuid not null references public.potw_students(id),
  linked_at timestamptz not null default clock_timestamp()
);
create index potw_student_accounts_student on public.potw_student_accounts(student_id);
create table public.potw_competitions (
  id uuid primary key default gen_random_uuid(), theme text not null, description text not null, rules text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','submissions_open','review','voting_open','voting_closed','completed','archived')),
  submissions_open_at timestamptz not null, submissions_close_at timestamptz not null,
  voting_open_at timestamptz not null, voting_close_at timestamptz not null,
  featured boolean not null default false, published_at timestamptz, shortlist_confirmed_at timestamptz,
  locked_at timestamptz, voting_skipped boolean not null default false, banner_version_id uuid,
  created_by uuid references auth.users(id), created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  check (submissions_open_at < submissions_close_at and submissions_close_at <= voting_open_at and voting_open_at < voting_close_at),
  check (length(theme) between 1 and 160 and length(description) between 1 and 5000 and length(rules) between 1 and 5000)
);
create unique index potw_one_featured on public.potw_competitions(featured) where featured and published_at is not null;
create index potw_competitions_due on public.potw_competitions(status,voting_close_at);
create table public.potw_submissions (
  id uuid primary key default gen_random_uuid(), competition_id uuid not null references public.potw_competitions(id),
  student_id uuid not null references public.potw_students(id), created_by uuid not null references auth.users(id),
  title text not null, caption text not null default '', state text not null default 'ready' check (state in ('ready','withdrawn')),
  review text not null default 'pending' check (review in ('pending','shortlisted','rejected')),
  rejection_reason text, current_version_id uuid,
  created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
  unique(competition_id,student_id), unique(competition_id,id),
  check (length(title) between 1 and 120 and length(caption) <= 2000)
);
create index potw_submissions_student on public.potw_submissions(student_id,created_at desc);
create index potw_submissions_review on public.potw_submissions(competition_id,review,state);
create table public.potw_photo_versions (
  id uuid primary key, competition_id uuid not null references public.potw_competitions(id),
  submission_id uuid references public.potw_submissions(id), created_by uuid not null references auth.users(id),
  original_key text not null unique, display_key text not null unique, thumbnail_key text not null unique,
  bytes bigint not null check (bytes > 0), width integer not null check (width > 0), height integer not null check (height > 0),
  sha256 text not null, ai_evidence jsonb not null default '[]',
  created_at timestamptz not null default clock_timestamp(), purge_started_at timestamptz, purged_at timestamptz,
  unique(submission_id,id), unique(competition_id,id),
  foreign key (competition_id,submission_id) references public.potw_submissions(competition_id,id)
);
alter table public.potw_submissions add constraint potw_current_photo_fk foreign key(id,current_version_id) references public.potw_photo_versions(submission_id,id);
alter table public.potw_competitions add constraint potw_banner_fk foreign key(id,banner_version_id) references public.potw_photo_versions(competition_id,id);
create index potw_versions_retention on public.potw_photo_versions(purged_at,created_at);
create table public.potw_upload_sessions (
  id uuid primary key default gen_random_uuid(), competition_id uuid not null references public.potw_competitions(id),
  student_id uuid references public.potw_students(id), actor_id uuid not null references auth.users(id),
  purpose text not null check (purpose in ('submission','banner')), staging_key text not null unique,
  content_type text not null check (content_type in ('image/jpeg','image/png','image/webp')),
  declared_bytes bigint not null check (declared_bytes between 1 and 5242880), reserved_bytes bigint not null,
  title text not null, caption text not null default '', expected_version_id uuid,
  expires_at timestamptz not null, status text not null default 'pending' check(status in ('pending','processing','complete','failed','expired')),
  lease_id uuid, lease_until timestamptz, processing_versions uuid[] not null default '{}', version_id uuid references public.potw_photo_versions(id),
  cleanup_at timestamptz, created_at timestamptz not null default clock_timestamp(),
  check ((purpose='submission' and student_id is not null) or (purpose='banner' and student_id is null))
);
create unique index potw_pending_student on public.potw_upload_sessions(student_id) where student_id is not null and status in ('pending','processing');
create unique index potw_pending_banner on public.potw_upload_sessions(actor_id) where purpose='banner' and status in ('pending','processing');
create index potw_uploads_expiry on public.potw_upload_sessions(expires_at,status);
create index potw_uploads_daily on public.potw_upload_sessions(student_id,created_at);
create table public.potw_votes (
  id uuid primary key default gen_random_uuid(), competition_id uuid not null references public.potw_competitions(id),
  student_id uuid not null references public.potw_students(id), submission_id uuid not null,
  actor_id uuid not null references auth.users(id), created_at timestamptz not null default clock_timestamp(),
  unique(competition_id,student_id), foreign key(competition_id,submission_id) references public.potw_submissions(competition_id,id)
);
create index potw_votes_submission on public.potw_votes(competition_id,submission_id);
create table public.potw_results (
  competition_id uuid primary key references public.potw_competitions(id), winner_submission_id uuid,
  outcome text not null check(outcome in ('winner','tie_break','no_votes','no_award','sole_finalist')),
  reason text, tally jsonb not null, finalized_by uuid references auth.users(id),
  finalized_at timestamptz not null default clock_timestamp(),
  foreign key(competition_id,winner_submission_id) references public.potw_submissions(competition_id,id),
  check ((outcome='no_award') = (winner_submission_id is null))
);
create table public.potw_audit_log (
  id bigint generated always as identity primary key, competition_id uuid references public.potw_competitions(id),
  actor_id uuid references auth.users(id), action text not null, details jsonb not null default '{}',
  created_at timestamptz not null default clock_timestamp()
);
create index potw_audit_competition on public.potw_audit_log(competition_id,created_at desc);
create table public.potw_legacy_archive (source_id text primary key, entry jsonb not null, source_hash text not null);
create table public.potw_rate_limits (key text primary key, window_start timestamptz not null, count integer not null check(count>0));

do $$ declare t text; begin
  foreach t in array array['potw_students','potw_student_emails','potw_student_accounts','potw_competitions','potw_submissions','potw_photo_versions','potw_upload_sessions','potw_votes','potw_results','potw_audit_log','potw_legacy_archive','potw_rate_limits'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant select, insert, update, delete on public.%I to service_role',t);
  end loop;
end $$;
grant usage, select on sequence public.potw_audit_log_id_seq to service_role;
revoke update, delete on public.potw_votes, public.potw_results, public.potw_audit_log from service_role;

create function public.potw_immutable() returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception 'POTW record is immutable' using errcode='P0001'; end $$;
create trigger potw_votes_immutable before update or delete on public.potw_votes for each row execute function public.potw_immutable();
create trigger potw_results_immutable before update or delete on public.potw_results for each row execute function public.potw_immutable();
create trigger potw_audit_immutable before update or delete on public.potw_audit_log for each row execute function public.potw_immutable();
revoke all on function public.potw_immutable() from public,anon,authenticated;
