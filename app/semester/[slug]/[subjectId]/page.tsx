import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import Breadcrumbs from "../../../../src/components/Breadcrumbs";
import SubjectTabs from "../../../../src/components/SubjectTabs";
import MediaModalButton from "../../../../src/components/MediaModalButton";
import {
  getSemester,
  getSubject,
  type Difficulty,
  type ResourceKind,
} from "../../../../src/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subjectId: string }>;
}): Promise<Metadata> {
  const { slug, subjectId } = await params;
  const [subject, semester] = await Promise.all([
    getSubject(subjectId),
    getSemester(slug),
  ]);

  if (!subject) {
    return {
      title: "Subject Not Found",
      description: "The requested BITM subject could not be found.",
    };
  }

  const semesterName = semester?.name ?? "BITM";
  const description = `${subject.name} (${subject.code}) notes, lessons, syllabus, videos, and question papers for ${semesterName}.`;

  return {
    title: `${subject.name} Notes and Resources`,
    description,
    openGraph: {
      title: `${subject.name} Notes and Resources | easyBITM`,
      description,
    },
  };
}

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-accent/15 text-accent",
  Medium: "bg-accent-2/15 text-accent-2",
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
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
          <div className="flex flex-wrap gap-2">
          {subject.overall_notes_url && <a href={`/semester/${slug}/${subject.id}/overall-notes`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2 hover:text-accent">View overall notes</a>}
          {subject.oneshot_video_url && (
            <MediaModalButton
              url={subject.oneshot_video_url}
              title={`${subject.name} one-shot video`}
              label="Watch one-shot video"
              kind="video"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            />
          )}
          </div>
        </div>
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

        <SubjectTabs
          groups={groups}
          lessons={subject.lessons}
          subject={subject}
        />
      </section>

      <Footer />
    </div>
  );
}
