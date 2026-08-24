"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createResource,
  deleteResource,
  getSubject,
  updateResource,
  type ResourceKind,
  type SubjectWithResources,
} from "../../../../src/lib/data";

const kinds: ResourceKind[] = ["notes", "syllabus", "video", "other"];

export default function AdminSubjectPage({
  params,
}: {
  params: Promise<{ slug: string; subjectId: string }>;
}) {
  const { slug, subjectId } = use(params);
  const [subject, setSubject] = useState<SubjectWithResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<ResourceKind>("notes");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getSubject(subjectId);
    setSubject(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !title.trim() || !url.trim()) return;
    setSaving(true);
    await createResource({
      subject_id: subject.id,
      kind,
      title: title.trim(),
      url: url.trim(),
      sort_order: subject.resources.length + 1,
    });
    setTitle("");
    setUrl("");
    setKind("notes");
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(id);
    load();
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="text-sm text-muted">Subject not found.</p>
        <Link
          href={`/admin/${slug}`}
          className="mt-4 inline-block text-sm text-accent"
        >
          Back to Semester
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Link
        href={`/admin/${slug}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {slug}
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {subject.name}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {subject.code} · Manage notes, syllabus, videos, and other links.
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-8 grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-5"
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ResourceKind)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Chapter 1 Notes)"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50 sm:col-span-5"
        >
          Add Resource
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-2">
        {subject.resources.length === 0 && (
          <div className="text-sm text-muted">No resources yet.</div>
        )}
        {subject.resources.map((resource) => (
          <div
            key={resource.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <select
                defaultValue={resource.kind}
                onChange={(e) =>
                  updateResource(resource.id, {
                    kind: e.target.value as ResourceKind,
                  }).then(load)
                }
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs sm:w-28"
              >
                {kinds.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input
                defaultValue={resource.title}
                onBlur={(e) => {
                  if (e.target.value !== resource.title)
                    updateResource(resource.id, {
                      title: e.target.value,
                    }).then(load);
                }}
                className="rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-medium outline-none focus:border-border focus:bg-background sm:w-56"
              />
              <input
                defaultValue={resource.url}
                onBlur={(e) => {
                  if (e.target.value !== resource.url)
                    updateResource(resource.id, {
                      url: e.target.value,
                    }).then(load);
                }}
                className="flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-muted outline-none focus:border-border focus:bg-background"
              />
            </div>
            <button
              onClick={() => handleDelete(resource.id)}
              aria-label="Delete resource"
              className="flex h-8 w-8 items-center justify-center self-end rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 sm:self-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
