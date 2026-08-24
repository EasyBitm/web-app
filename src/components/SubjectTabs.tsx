"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, ListChecks, Video, ImageIcon, type LucideIcon } from "lucide-react";
import type { Resource, ResourceKind } from "../lib/data";

const tabOrder: ResourceKind[] = ["video", "notes", "syllabus", "question_paper"];

const kindMeta: Record<ResourceKind, { label: string; icon: LucideIcon }> = {
  video: { label: "Videos", icon: Video },
  notes: { label: "Notes", icon: FileText },
  syllabus: { label: "Syllabus", icon: ListChecks },
  question_paper: { label: "Question Papers", icon: ImageIcon },
};

function groupByYear(items: Resource[]) {
  const years = Array.from(new Set(items.map((r) => r.year ?? 0))).sort(
    (a, b) => b - a,
  );
  return years.map((year) => ({
    year,
    items: items.filter((r) => (r.year ?? 0) === year),
  }));
}

function groupByLesson(items: Resource[]) {
  const lessons = Array.from(new Set(items.map((r) => r.lesson ?? 0))).sort(
    (a, b) => a - b,
  );
  return lessons.map((lesson) => ({
    lesson,
    items: items.filter((r) => (r.lesson ?? 0) === lesson),
  }));
}

export default function SubjectTabs({
  groups,
}: {
  groups: { kind: ResourceKind; items: Resource[] }[];
}) {
  const availableKinds = tabOrder.filter((kind) =>
    groups.some((g) => g.kind === kind),
  );
  const [active, setActive] = useState<ResourceKind | null>(
    availableKinds[0] ?? null,
  );

  if (availableKinds.length === 0) {
    return (
      <div className="mt-10 text-sm text-muted">
        No resources added for this subject yet.
      </div>
    );
  }

  const items = groups.find((g) => g.kind === active)?.items ?? [];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-8">
        {availableKinds.map((kind) => {
          const { label, icon: Icon } = kindMeta[kind];
          const isActive = kind === active;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setActive(kind)}
              className={`flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {active === "question_paper" ? (
          <div className="flex flex-col gap-6">
            {groupByYear(items).map(({ year, items: yearItems }) => (
              <div key={year}>
                <div className="text-xs font-medium text-muted">
                  {year || "Year unspecified"}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {yearItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-xl border border-border bg-surface"
                    >
                      <div className="relative aspect-3/4 w-full bg-surface-2">
                        <Image
                          src={item.url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                      <div className="px-2 py-1.5 text-xs font-medium">
                        {item.title}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : active === "notes" ? (
          <div className="flex flex-col gap-4">
            {groupByLesson(items).map(({ lesson, items: lessonItems }) => (
              <div key={lesson}>
                <div className="text-xs font-medium text-muted">
                  {lesson ? `Lesson ${lesson}` : "Lesson unspecified"}
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {lessonItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                {item.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
