import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import Breadcrumbs from "../../src/components/Breadcrumbs";
import { getCourseStructure } from "../../src/lib/data";
import PdfDocumentViewer from "../../src/components/PdfDocumentViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const courseStructure = await getCourseStructure();

  if (!courseStructure) {
    return {
      title: "Course Structure Not Found",
      description: "The BITM course structure could not be found.",
    };
  }

  const description =
    "View the complete Bachelor in Information Technology and Management (BITM) course structure.";

  return {
    title: "BITM Course Structure",
    description,
    openGraph: {
      title: "BITM Course Structure | easyBITM",
      description,
    },
  };
}

export default async function CourseStructurePage() {
  const courseStructure = await getCourseStructure();

  if (!courseStructure || !courseStructure.course_structure_url) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Course structure" },
          ]}
        />

        <div className="mt-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            BITM course structure
          </h1>

          <a
            href={courseStructure.course_structure_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Open original
          </a>
        </div>

        <div className="mt-4">
          <PdfDocumentViewer
            url={courseStructure.course_structure_url}
            title="BITM course structure"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
