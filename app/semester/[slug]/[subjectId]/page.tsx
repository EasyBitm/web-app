import { notFound } from "next/navigation";
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

      <section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4">
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
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
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

        <SubjectTabs groups={groups} lessons={subject.lessons} />
      </section>

      <Footer />
    </div>
  );
}
