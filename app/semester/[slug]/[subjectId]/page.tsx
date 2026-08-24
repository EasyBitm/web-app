import Image from "next/image";
import { notFound } from "next/navigation";
import { FileText, ListChecks, Video, ImageIcon } from "lucide-react";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import Breadcrumbs from "../../../../src/components/Breadcrumbs";
import {
  getSemester,
  getSubject,
  type Resource,
  type ResourceKind,
} from "../../../../src/lib/data";

export const dynamic = "force-dynamic";

const kindMeta: Record<ResourceKind, { label: string; icon: typeof FileText }> = {
  notes: { label: "Notes", icon: FileText },
  syllabus: { label: "Syllabus", icon: ListChecks },
  video: { label: "Videos", icon: Video },
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

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string; subjectId: string }>;
}) {
  const { slug, subjectId } = await params;
  const [subject, semester] = await Promise.all([
    getSubject(subjectId),
    getSemester(slug),
  ]);

  if (!subject) {
    notFound();
  }

  const groups = (Object.keys(kindMeta) as ResourceKind[])
    .map((kind) => ({
      kind,
      items: subject.resources.filter((r) => r.kind === kind),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: semester?.name ?? slug, href: `/semester/${slug}` },
            { label: subject.name },
          ]}
        />

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {subject.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {subject.code} · {subject.chapters} chapters
        </p>

        {subject.lessons.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              <ListChecks size={16} />
              Course Outline
            </div>
            <ol className="mt-3 flex flex-col gap-2">
              {subject.lessons.map((lesson, i) => (
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
          </div>
        )}

        <div className="mt-10 flex flex-col gap-8">
          {groups.length === 0 && (
            <div className="text-sm text-muted">
              No resources added for this subject yet.
            </div>
          )}
          {groups.map(({ kind, items }) => {
            const Icon = kindMeta[kind].icon;
            return (
              <div key={kind}>
                <div className="flex items-center gap-2 text-sm font-medium text-muted">
                  <Icon size={16} />
                  {kindMeta[kind].label}
                </div>

                {kind === "question_paper" ? (
                  <div className="mt-3 flex flex-col gap-6">
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
                ) : kind === "notes" ? (
                  <div className="mt-3 flex flex-col gap-4">
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
                  <div className="mt-3 flex flex-col gap-2">
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
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
