import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import Breadcrumbs from "../../../../src/components/Breadcrumbs";
import SubjectTabs from "../../../../src/components/SubjectTabs";
import {
  getSemester,
  getSubject,
  type Difficulty,
  type ResourceKind,
} from "../../../../src/lib/data";

export const dynamic = "force-dynamic";

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-accent/15 text-accent",
  Medium: "bg-amber-500/15 text-amber-500",
  Hard: "bg-red-500/15 text-red-500",
};

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

  const groups = (
    ["notes", "syllabus", "video", "question_paper"] as ResourceKind[]
  )
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

        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted">
          {subject.code}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {subject.name}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyStyles[subject.difficulty]}`}
          >
            {subject.difficulty}
          </span>
          <span className="text-sm text-muted">
            {subject.chapters} chapters
          </span>
        </div>

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

        <SubjectTabs groups={groups} />
      </section>

      <Footer />
    </div>
  );
}
