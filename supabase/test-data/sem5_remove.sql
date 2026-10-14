-- Removes the 5th-semester test data created by sem5_seed.sql.
-- Only subjects with a code starting with 'TEST-' in the 'fifth' semester are deleted;
-- their lessons and resources go with them (on delete cascade).
-- The semester row itself and any real subjects are left untouched.

delete from public.subjects
where code like 'TEST-%'
  and semester_id = (select id from public.semesters where slug = 'fifth')
returning code, name;
