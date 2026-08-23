"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  createSubject,
  deleteSubject,
  getSemester,
  updateSemester,
  updateSubject,
  type Difficulty,
  type Semester,
} from "../../../src/lib/data";

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function AdminSemesterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [chapters, setChapters] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getSemester(slug);
    setSemester(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!semester || !name.trim() || !code.trim()) return;
    setSaving(true);
    await createSubject({
      semester_id: semester.id,
      name: name.trim(),
      code: code.trim(),
      chapters,
      difficulty,
      sort_order: semester.subjects.length + 1,
    });
    setName("");
    setCode("");
    setChapters(1);
    setDifficulty("Medium");
    setSaving(false);
    load();
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm("Delete this subject?")) return;
    await deleteSubject(id);
    load();
  }

  async function handleRenameSemester(newName: string) {
    if (!semester || !newName.trim() || newName === semester.name) return;
    await updateSemester(semester.id, { name: newName.trim() });
    load();
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!semester) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="text-sm text-muted">Semester not found.</p>
        <Link href="/admin" className="mt-4 inline-block text-sm text-accent">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Admin
      </Link>

      <input
        defaultValue={semester.name}
        onBlur={(e) => handleRenameSemester(e.target.value)}
        className="mt-6 w-full rounded-lg border border-transparent bg-transparent text-3xl font-bold tracking-tight outline-none focus:border-border focus:bg-surface focus:px-2 focus:py-1"
      />
      <p className="mt-1 text-sm text-muted">/{semester.slug}</p>

      <form
        onSubmit={handleAddSubject}
        className="mt-8 grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-5"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="number"
          min={1}
          value={chapters}
          onChange={(e) => setChapters(Number(e.target.value))}
          placeholder="Chapters"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50 sm:col-span-5"
        >
          Add Subject
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-2">
        {semester.subjects.length === 0 && (
          <div className="text-sm text-muted">No subjects yet.</div>
        )}
        {semester.subjects.map((subject) => (
          <div
            key={subject.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input
                defaultValue={subject.name}
                onBlur={(e) => {
                  if (e.target.value !== subject.name)
                    updateSubject(subject.id, { name: e.target.value }).then(
                      load,
                    );
                }}
                className="rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-medium outline-none focus:border-border focus:bg-background sm:w-48"
              />
              <input
                defaultValue={subject.code}
                onBlur={(e) => {
                  if (e.target.value !== subject.code)
                    updateSubject(subject.id, { code: e.target.value }).then(
                      load,
                    );
                }}
                className="rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-muted outline-none focus:border-border focus:bg-background sm:w-24"
              />
              <input
                type="number"
                min={1}
                defaultValue={subject.chapters}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val !== subject.chapters)
                    updateSubject(subject.id, { chapters: val }).then(load);
                }}
                className="rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-muted outline-none focus:border-border focus:bg-background sm:w-20"
              />
              <select
                defaultValue={subject.difficulty}
                onChange={(e) =>
                  updateSubject(subject.id, {
                    difficulty: e.target.value as Difficulty,
                  }).then(load)
                }
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs sm:w-28"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleDeleteSubject(subject.id)}
              aria-label="Delete subject"
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
