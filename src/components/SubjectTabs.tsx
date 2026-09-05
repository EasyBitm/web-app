"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  ListChecks,
  Video,
  ImageIcon,
  Play,
  X,
  Pause,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { Lesson, Resource, ResourceKind } from "../lib/data";

type TabKind = ResourceKind | "lessons";

const tabOrder: TabKind[] = ["lessons", "notes", "syllabus", "question_paper"];

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

function getVideoEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`
    : url;
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
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Resource | null>(null);
  const videoFrameRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoOverlayTimeoutRef = useRef<number | null>(null);
  const pdfModalRef = useRef<HTMLDivElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoVolume, setVideoVolume] = useState(100);
  const [showVideoShield, setShowVideoShield] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);

  function showVideoShieldFor(duration: number) {
    if (videoOverlayTimeoutRef.current) {
      window.clearTimeout(videoOverlayTimeoutRef.current);
    }
    setShowVideoShield(true);
    videoOverlayTimeoutRef.current = window.setTimeout(
      () => setShowVideoShield(false),
      duration,
    );
  }

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === videoContainerRef.current);
      setIsPdfFullscreen(document.fullscreenElement === pdfModalRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!selectedPdf) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedPdf(null);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedPdf]);

  useEffect(() => {
    if (!selectedVideo && !selectedPdf) return;

    function handleFullscreenShortcut(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "f") return;

      event.preventDefault();
      const fullscreenTarget = selectedVideo
        ? videoContainerRef.current
        : pdfModalRef.current;

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        fullscreenTarget?.requestFullscreen();
      }
    }

    window.addEventListener("keydown", handleFullscreenShortcut);
    return () => window.removeEventListener("keydown", handleFullscreenShortcut);
  }, [selectedVideo, selectedPdf]);

  function sendVideoCommand(func: string, args: unknown[] = []) {
    videoFrameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }

  const items = groups.find((g) => g.kind === active)?.items ?? [];
  const videoItems = groups.find((g) => g.kind === "video")?.items ?? [];

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
                onMouseEnter={() => setHoveredLessonId(lesson.id)}
                onMouseLeave={() => setHoveredLessonId(null)}
                className="rounded-xl border border-border bg-surface text-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedLessonId(
                      expandedLessonId === lesson.id ? null : lesson.id,
                    )
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={expandedLessonId === lesson.id}
                >
                  <span>
                    <span className="text-muted">{i + 1}. </span>
                    {lesson.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {lesson.hours != null && (
                      <span className="text-xs text-muted">
                        {lesson.hours} LHs
                      </span>
                    )}
                    <span className="text-lg text-muted">
                      {expandedLessonId === lesson.id ? "−" : "+"}
                    </span>
                  </span>
                </button>

                {(expandedLessonId === lesson.id || hoveredLessonId === lesson.id) && (
                  <div className="border-t border-border px-4 py-4">
                    {videoItems.filter((item) => (item.lesson ?? 0) === i + 1)
                      .length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {videoItems
                          .filter((item) => (item.lesson ?? 0) === i + 1)
                          .map((item) => {
                            const thumbnail = getYoutubeThumbnail(item.url);
                            return (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setSelectedVideo(item);
                                  setIsVideoPlaying(true);
                                  setVideoVolume(100);
                                  showVideoShieldFor(8000);
                                }}
                                className="group overflow-hidden rounded-xl border border-border bg-surface-2"
                              >
                                <div className="relative aspect-video w-full bg-surface">
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
                    ) : (
                      <p className="text-sm text-muted">
                        No videos added for this lesson yet.
                      </p>
                    )}
                  </div>
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
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedPdf(item);
                      }}
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

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedVideo.title}
            className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              aria-label="Close video"
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X size={20} />
            </button>
            <div
              ref={videoContainerRef}
              className="relative aspect-video w-full bg-black"
            >
              <iframe
                ref={videoFrameRef}
                src={getVideoEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                tabIndex={-1}
                className="pointer-events-none h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
              {showVideoShield && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-20 items-center gap-2 bg-black/60 px-5 backdrop-blur-sm"
                  >
                    <Image
                      src="/logo.png"
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      unoptimized
                    />
                    <span className="text-lg font-semibold tracking-tight text-white">
                      easy<span className="text-accent">BITM</span>
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-black/60 backdrop-blur-sm"
                  />
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-white fullscreen:gap-2 fullscreen:px-2 fullscreen:pb-1 fullscreen:pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const command = isVideoPlaying ? "pauseVideo" : "playVideo";
                    sendVideoCommand(command);
                    setIsVideoPlaying(!isVideoPlaying);
                    showVideoShieldFor(6000);
                  }}
                  aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 fullscreen:h-7 fullscreen:w-7"
                >
                  {isVideoPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <Volume2 size={17} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={videoVolume}
                  onChange={(event) => {
                    const volume = Number(event.target.value);
                    setVideoVolume(volume);
                    sendVideoCommand("setVolume", [volume]);
                  }}
                  aria-label="Video volume"
                  className="h-1 w-24 accent-white fullscreen:w-16"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      videoContainerRef.current?.requestFullscreen();
                    }
                  }}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen video"}
                  className="ml-auto rounded-full px-3 py-2 text-xs font-medium transition-colors hover:bg-white/20 fullscreen:px-2 fullscreen:py-1"
                >
                  {isFullscreen ? "Exit full screen" : "Full screen"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="text-sm font-medium">{selectedVideo.title}</div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
              >
                Close video
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPdf && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${
            isPdfFullscreen ? "p-0" : "p-4"
          }`}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedPdf.title}
            ref={pdfModalRef}
            className={`relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl ${
              isPdfFullscreen
                ? "flex h-screen max-w-none flex-col rounded-none border-0"
                : ""
            }`}
          >
            <iframe
              src={`${selectedPdf.url}#toolbar=1`}
              title={selectedPdf.title}
              className={`w-full bg-surface ${
                isPdfFullscreen ? "min-h-0 flex-1" : "h-[75vh]"
              }`}
            />
            <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
              <div className="truncate text-sm font-medium">{selectedPdf.title}</div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      pdfModalRef.current?.requestFullscreen();
                    }
                  }}
                  aria-label={isPdfFullscreen ? "Exit PDF fullscreen" : "Fullscreen PDF"}
                  className="rounded-full border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-2"
                >
                  {isPdfFullscreen ? "Exit full screen" : "Full screen"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPdf(null)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
                >
                  Close PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
