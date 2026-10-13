-- Allow "handwritten_notes" as a resource kind (shown as its own tab next to Notes).
alter table public.resources drop constraint if exists resources_kind_check;

alter table public.resources
add constraint resources_kind_check
check (kind in ('notes', 'handwritten_notes', 'syllabus', 'video', 'question_paper'));
