import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Layers } from "lucide-react";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import Breadcrumbs from "../../../src/components/Breadcrumbs";
import { getSemester, type Difficulty } from "../../../src/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const semester = await getSemester(slug);

  if (!semester) {
    return {
      title: "Semester Not Found",
      description: "The requested BITM semester could not be found.",
    };
  }

  const description = `${semester.name} BITM notes, subjects, syllabus, videos, and question papers for Bachelor in Information Technology and Management students.`;

  return {
    title: `${semester.name} Resources`,
    description,
    openGraph: {
      title: `${semester.name} Resources | easyBITM`,
      description,
    },
  };
}

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-accent/15 text-accent",
  Medium: "bg-accent-2/15 text-accent-2",
  Hard: "bg-red-500/15 text-red-500",
};

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const semester = await getSemester(slug);

  if (!semester) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: semester.name },
          ]}
        />

        
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {semester.name}
        </h1>
          {semester.overall_syllabus_url && <Link href={`/semester/${slug}/overall-syllabus`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2 hover:text-accent">View overall syllabus</Link>}
          
      </div>
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Layers size={14} />
            {semester.subjects.length} subjects
          </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semester.subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/semester/${slug}/${subject.id}`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <div className="font-medium leading-tight">
                      {subject.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {subject.code}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted">
                  {subject.chapters} chapters
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors group-hover:border-accent group-hover:text-accent">
                  Learn
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyStyles[subject.difficulty]}`}
                >
                  {subject.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
