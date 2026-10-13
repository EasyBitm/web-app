-- Remove the per-bucket file size cap on "resources" so large PDFs (e.g. overall notes)
-- are only limited by the project's global upload limit (Storage → Settings in the dashboard).
update storage.buckets
set file_size_limit = null
where id = 'resources';
