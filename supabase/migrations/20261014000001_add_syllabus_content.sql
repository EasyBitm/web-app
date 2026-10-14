-- Formatted syllabus extracted from the uploaded syllabus PDF (via Gemini in the admin app).
-- When set, the site shows this instead of embedding the PDF. Shape:
-- {
--   "credit_hours": number | null,
--   "lecture_hours": number | null,
--   "description": string | null,
--   "objectives": string[],
--   "units": [{ "title": string, "hours": number | null, "topics": string[] }],
--   "references": string[],
--   "source_url": string | null
-- }
-- Writes are covered by the existing admin-only update policy on subjects.
alter table public.subjects
add column if not exists syllabus_content jsonb;
