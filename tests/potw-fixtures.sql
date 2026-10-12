-- Synthetic users and photos. Run only inside a transaction that is rolled back.
insert into auth.users(id,email,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000001','potw-fixture-a@ds.study.iitm.ac.in',clock_timestamp()),
 ('10000000-0000-4000-8000-000000000002','potw-fixture-b@ds.study.iitm.ac.in',clock_timestamp()),
 ('10000000-0000-4000-8000-000000000003','potw-fixture-a-alias@ds.study.iitm.ac.in',clock_timestamp()),
 ('10000000-0000-4000-8000-000000000004','potw-fixture-unapproved@ds.study.iitm.ac.in',clock_timestamp());
insert into auth.identities(user_id,provider_id,identity_data,provider) select id,id::text,jsonb_build_object('sub',id::text,'email',email),'google' from auth.users where id in ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
insert into public.potw_students(id,student_id,display_name) values
 ('20000000-0000-4000-8000-000000000001','fixture-a','Fixture A'),('20000000-0000-4000-8000-000000000002','fixture-b','Fixture B');
insert into public.potw_student_emails(email,student_id) values
 ('potw-fixture-a@ds.study.iitm.ac.in','20000000-0000-4000-8000-000000000001'),('potw-fixture-a-alias@ds.study.iitm.ac.in','20000000-0000-4000-8000-000000000001'),('potw-fixture-b@ds.study.iitm.ac.in','20000000-0000-4000-8000-000000000002');
insert into public.potw_competitions(id,theme,description,rules,status,submissions_open_at,submissions_close_at,voting_open_at,voting_close_at,published_at,shortlist_confirmed_at,locked_at) values
 ('30000000-0000-4000-8000-000000000001','Fixture voting','Test only','Test only','voting_open',clock_timestamp()-interval '3 days',clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day',clock_timestamp()+interval '1 day',clock_timestamp()-interval '3 days',clock_timestamp()-interval '1 day',clock_timestamp()-interval '1 day'),
 ('30000000-0000-4000-8000-000000000002','Fixture uploads','Test only','Test only','submissions_open',clock_timestamp()-interval '1 day',clock_timestamp()+interval '1 day',clock_timestamp()+interval '2 days',clock_timestamp()+interval '3 days',clock_timestamp(),null,null);
insert into public.potw_submissions(id,competition_id,student_id,created_by,title,review) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Photo A','shortlisted'),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Photo B','shortlisted');
