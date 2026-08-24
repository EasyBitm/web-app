import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ListChecks, Video, Link as LinkIcon } from "lucide-react";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { getSubject, type ResourceKind } from "../../../src/lib/data";

export const dynamic = "force-dynamic";

const kindMeta: Record<ResourceKind, { label: string; icon: typeof FileText }> = {
  notes: { label: "Notes", icon: FileText },
  syllabus: { label: "Syllabus", icon: ListChecks },
  video: { label: "Videos", icon: Video },
  other: { label: "Other", icon: LinkIcon },
};

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);

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
        <Link
          href={`/semester/${subject.semester_slug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {subject.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {subject.code} · {subject.chapters} chapters
        </p>

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
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
