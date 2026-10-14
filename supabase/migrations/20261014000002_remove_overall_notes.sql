-- Overall notes are replaced by the "handwritten_notes" resource (one per subject).
-- Keep any overall notes PDF that was already uploaded by turning it into the subject's
-- handwritten notes, but only where the subject doesn't have handwritten notes yet.
insert into public.resources (subject_id, kind, title, url, sort_order)
select s.id, 'handwritten_notes', 'Handwritten Notes', s.overall_notes_url,
  coalesce((select max(r.sort_order) from public.resources r where r.subject_id = s.id), 0) + 1
from public.subjects s
where s.overall_notes_url is not null
  and btrim(s.overall_notes_url) <> ''
  and not exists (
    select 1 from public.resources r
    where r.subject_id = s.id and r.kind = 'handwritten_notes'
  );

alter table public.subjects drop column if exists overall_notes_url;
