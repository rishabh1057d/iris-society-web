-- Keep the normalized, roster-only email constraint while supporting all BS programs.
alter table public.potw_student_emails
  drop constraint potw_student_emails_email_check,
  add constraint potw_student_emails_email_check
    check (email = lower(btrim(email)) and email ~ '@(ds|es|ae|mg)\.study\.iitm\.ac\.in$');
