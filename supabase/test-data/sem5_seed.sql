-- Test data for the 5th semester (slug 'fifth').
-- Run in the Supabase SQL editor. Remove it again with sem5_remove.sql.
--
-- Every test subject has a code starting with 'TEST-' — that is the only thing the
-- remove script matches on, so real 5th-semester subjects are never touched.
-- Lessons and resources hang off those subjects and are deleted with them (on delete cascade).
-- Re-running this file replaces the previous test data instead of duplicating it.
--
-- Sample PDFs come from the pdf.js repo on raw.githubusercontent.com because it sends
-- CORS headers, which the site's in-page PDF viewer needs.

begin;

do $$
begin
  if not exists (select 1 from public.semesters where slug = 'fifth') then
    raise exception 'Semester with slug "fifth" not found — create it in the admin first.';
  end if;
end $$;

-- Start clean so the script can be re-run.
delete from public.subjects
where code like 'TEST-%'
  and semester_id = (select id from public.semesters where slug = 'fifth');

-- Subjects (sort_order 101+ so they appear after any real subjects).
insert into public.subjects
  (semester_id, name, code, chapters, difficulty, sort_order, oneshot_video_url)
select
  (select id from public.semesters where slug = 'fifth'),
  v.name, v.code, v.chapters, v.difficulty, v.sort_order, v.oneshot_video_url
from (values
  ('[TEST] Artificial Intelligence', 'TEST-501', 5, 'Medium', 101,
    'https://www.youtube.com/watch?v=aircAruvnKk'),
  ('[TEST] Compiler Design', 'TEST-502', 4, 'Hard', 102,
    'https://www.youtube.com/watch?v=IHZwWFHWa-w'),
  ('[TEST] System Analysis & Design', 'TEST-503', 4, 'Easy', 103,
    null)
) as v(name, code, chapters, difficulty, sort_order, oneshot_video_url);

-- Course outline (lessons).
insert into public.lessons (subject_id, title, hours, sort_order)
select s.id, v.title, v.hours, v.sort_order
from (values
  ('TEST-501', 'Unit 1: Introduction to AI', 4, 1),
  ('TEST-501', 'Unit 2: Intelligent Agents', 5, 2),
  ('TEST-501', 'Unit 3: Search Techniques', 8, 3),
  ('TEST-501', 'Unit 4: Knowledge Representation', 7, 4),
  ('TEST-501', 'Unit 5: Machine Learning Basics', 8, 5),
  ('TEST-502', 'Unit 1: Introduction to Compilers', 3, 1),
  ('TEST-502', 'Unit 2: Lexical Analysis', 6, 2),
  ('TEST-502', 'Unit 3: Syntax Analysis', 10, 3),
  ('TEST-502', 'Unit 4: Code Generation', 8, 4),
  ('TEST-503', 'Unit 1: System Concepts', 4, 1),
  ('TEST-503', 'Unit 2: Requirement Analysis', 6, 2),
  ('TEST-503', 'Unit 3: System Design', 8, 3),
  ('TEST-503', 'Unit 4: Implementation & Maintenance', 5, 4)
) as v(code, title, hours, sort_order)
join public.subjects s on s.code = v.code;

-- Notes: one PDF per lesson.
insert into public.resources (subject_id, kind, title, url, lesson, sort_order)
select l.subject_id, 'notes', 'Lesson ' || l.sort_order || ' Notes',
  'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
  l.sort_order, l.sort_order
from public.lessons l
join public.subjects s on s.id = l.subject_id
where s.code like 'TEST-%';

-- Videos: lessons 1 and 2 of each subject.
insert into public.resources (subject_id, kind, title, url, lesson, sort_order)
select l.subject_id, 'video', 'Lesson ' || l.sort_order || ' Video',
  case l.sort_order
    when 1 then 'https://www.youtube.com/watch?v=aircAruvnKk'
    else 'https://www.youtube.com/watch?v=IHZwWFHWa-w'
  end,
  l.sort_order, 100 + l.sort_order
from public.lessons l
join public.subjects s on s.id = l.subject_id
where s.code like 'TEST-%' and l.sort_order <= 2;

-- Handwritten notes (one per subject), syllabus, and question papers grouped by year.
insert into public.resources (subject_id, kind, title, url, year, sort_order)
select s.id, v.kind, v.title, v.url, v.year, v.sort_order
from public.subjects s
cross join (values
  ('handwritten_notes', 'Handwritten Notes (All Units)',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf', null::int, 201),
  ('syllabus', 'Official Syllabus',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', null, 301),
  ('question_paper', 'Board Exam 2025',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', 2025, 401),
  ('question_paper', 'Board Exam 2024 (Regular)',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', 2024, 402),
  ('question_paper', 'Board Exam 2024 (Back)',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', 2024, 403),
  ('question_paper', 'Board Exam 2023',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', 2023, 404),
  ('question_paper', 'Model Question',
    'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf', null, 405)
) as v(kind, title, url, year, sort_order)
where s.code like 'TEST-%';

commit;

-- Quick check of what was created.
select s.code, s.name,
  (select count(*) from public.lessons l where l.subject_id = s.id) as lessons,
  (select count(*) from public.resources r where r.subject_id = s.id) as resources
from public.subjects s
where s.code like 'TEST-%'
order by s.sort_order;
