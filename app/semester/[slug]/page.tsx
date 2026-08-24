import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Layers } from "lucide-react";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import Breadcrumbs from "../../../src/components/Breadcrumbs";
import { getSemester, getSemesters, type Difficulty } from "../../../src/lib/data";

export const dynamic = "force-dynamic";

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-accent/15 text-accent",
  Medium: "bg-amber-500/15 text-amber-500",
  Hard: "bg-red-500/15 text-red-500",
};

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [semester, semesters] = await Promise.all([
    getSemester(slug),
    getSemesters(),
  ]);

  if (!semester) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: semester.name },
          ]}
        />

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {semester.name}
        </h1>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <Layers size={14} />
          {semester.subjects.length} subjects
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semester.subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5"
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
                <Link
                  href={`/semester/${slug}/${subject.id}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface-2"
                >
                  Learn
                </Link>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyStyles[subject.difficulty]}`}
                >
                  {subject.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
