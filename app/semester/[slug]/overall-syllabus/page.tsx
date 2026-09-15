import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import Breadcrumbs from "../../../../src/components/Breadcrumbs";
import { getSemester } from "../../../../src/lib/data";
import PdfDocumentViewer from "../../../../src/components/PdfDocumentViewer";

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
      title: "Syllabus Not Found",
      description: "The requested BITM syllabus could not be found.",
    };
  }

  const description = `View the complete ${semester.name} BITM syllabus for Bachelor in Information Technology and Management students.`;

  return {
    title: `${semester.name} Overall Syllabus`,
    description,
    openGraph: {
      title: `${semester.name} Overall Syllabus | easyBITM`,
      description,
    },
  };
}

export default async function OverallSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const semester = await getSemester(slug);

  if (!semester || !semester.overall_syllabus_url) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: semester.name, href: `/semester/${slug}` },
            { label: "Overall syllabus" },
          ]}
        />
        <div className="mt-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {semester.name} overall syllabus
          </h1>
          <a
            href={semester.overall_syllabus_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Open original
          </a>
        </div>
        <div className="mt-4">
          <PdfDocumentViewer
            url={semester.overall_syllabus_url}
            title={`${semester.name} overall syllabus`}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
