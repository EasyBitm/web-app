"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, ListChecks, Video, ImageIcon, Play, type LucideIcon } from "lucide-react";
import type { Lesson, Resource, ResourceKind } from "../lib/data";

type TabKind = ResourceKind | "lessons";

const tabOrder: TabKind[] = ["lessons", "video", "notes", "syllabus", "question_paper"];

const kindMeta: Record<TabKind, { label: string; icon: LucideIcon }> = {
  lessons: { label: "Lessons", icon: ListChecks },
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

function getYoutubeThumbnail(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
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
  lessons = [],
}: {
  groups: { kind: ResourceKind; items: Resource[] }[];
  lessons?: Lesson[];
}) {
  const availableKinds = tabOrder.filter((kind) =>
    kind === "lessons"
      ? lessons.length > 0
      : groups.some((g) => g.kind === kind),
  );
  const [active, setActive] = useState<TabKind | null>(
    availableKinds[0] ?? null,
  );

  const items = groups.find((g) => g.kind === active)?.items ?? [];

  const syllabusItems = groups.find((g) => g.kind === "syllabus")?.items ?? [];
  const [syllabusId, setSyllabusId] = useState<string | null>(null);
  const activeSyllabus =
    syllabusItems.find((item) => item.id === syllabusId) ?? syllabusItems[0];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-12 lg:fixed lg:left-8 lg:top-1/2 lg:mt-0 lg:z-10 lg:flex-col lg:items-start lg:gap-8 lg:-translate-y-1/2">
        {tabOrder.map((kind) => {
          const { label, icon: Icon } = kindMeta[kind];
          const isAvailable = availableKinds.includes(kind);
          const isActive = kind === active;
          return (
            <button
              key={kind}
              type="button"
              disabled={!isAvailable}
              onClick={() => setActive(kind)}
              className={`flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : isAvailable
                    ? "border-transparent text-muted hover:text-foreground"
                    : "border-transparent text-muted/40 cursor-not-allowed"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {availableKinds.length === 0 ? (
          <div className="text-sm text-muted">
            No resources added for this subject yet.
          </div>
        ) : active === "lessons" ? (
          <ol className="flex flex-col gap-2">
            {lessons.map((lesson, i) => (
              <li
                key={lesson.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <span>
                  <span className="text-muted">{i + 1}. </span>
                  {lesson.title}
                </span>
                {lesson.hours != null && (
                  <span className="shrink-0 text-xs text-muted">
                    {lesson.hours} LHs
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : active === "question_paper" ? (
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
        ) : active === "video" ? (
          <div className="flex flex-col gap-6">
            {groupByLesson(items).map(({ lesson, items: lessonItems }) => (
              <div key={lesson}>
                <div className="text-xs font-medium text-muted">
                  {lesson ? `Lesson ${lesson}` : "Lesson unspecified"}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {lessonItems.map((item) => {
                    const thumbnail = getYoutubeThumbnail(item.url);
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-hidden rounded-xl border border-border bg-surface"
                      >
                        <div className="relative aspect-video w-full bg-surface-2">
                          {thumbnail ? (
                            <Image
                              src={thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Video size={24} className="text-muted" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play size={28} className="fill-white text-white" />
                          </div>
                        </div>
                        <div className="px-3 py-2 text-sm font-medium">
                          {item.title}
                        </div>
                      </a>
                    );
                  })}
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
        ) : active === "syllabus" ? (
          activeSyllabus ? (
            <div className="flex flex-col gap-3">
              {/* {syllabusItems.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {syllabusItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSyllabusId(item.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        item.id === activeSyllabus.id
                          ? "bg-accent text-white"
                          : "bg-surface text-muted hover:text-foreground"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )} */}
              {/* <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {activeSyllabus.title}
                </span>
                <a
                  href={activeSyllabus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-foreground"
                >
                  Open in new tab
                </a>
              </div> */}
              <iframe
                src={`${activeSyllabus.url}#toolbar=1`}
                title={activeSyllabus.title}
                className="h-[75vh] w-full rounded-xl border border-border bg-surface"
              />
            </div>
          ) : (
            <div className="text-sm text-muted">
              No syllabus added for this subject yet.
            </div>
          )
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
