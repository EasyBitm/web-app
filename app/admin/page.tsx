"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createSemester,
  deleteSemester,
  getSemesters,
  type Semester,
} from "../lib/data";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getSemesters();
    setSemesters(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await createSemester({
      slug: slugify(name),
      name: name.trim(),
      sort_order: semesters.length + 1,
    });
    setName("");
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this semester and all its subjects?")) return;
    await deleteSemester(id);
    load();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Manage semesters and subjects shown on the site.
      </p>

      <form onSubmit={handleAdd} className="mt-8 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New semester name (e.g. 9th Semester)"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          Add Semester
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-2">
        {loading && <div className="text-sm text-muted">Loading…</div>}
        {!loading && semesters.length === 0 && (
          <div className="text-sm text-muted">No semesters yet.</div>
        )}
        {semesters.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-muted">
                /{s.slug} · {s.subjects.length} subjects
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/${s.slug}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                Manage
              </Link>
              <button
                onClick={() => handleDelete(s.id)}
                aria-label="Delete semester"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
