import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "../../../../../src/components/Header";
import Footer from "../../../../../src/components/Footer";
import Breadcrumbs from "../../../../../src/components/Breadcrumbs";
import { getSemester, getSubject } from "../../../../../src/lib/data";
import PdfDocumentViewer from "../../../../../src/components/PdfDocumentViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; subjectId: string }> }): Promise<Metadata> {
  const { subjectId } = await params;
  const subject = await getSubject(subjectId);
  if (!subject) return { title: "Notes Not Found", description: "The requested subject notes could not be found." };
  return { title: `${subject.name} Overall Notes`, description: `View the complete overall notes for ${subject.name}.` };
}

export default async function SubjectOverallNotesPage({ params }: { params: Promise<{ slug: string; subjectId: string }> }) {
  const { slug, subjectId } = await params;
  const [subject, semester] = await Promise.all([getSubject(subjectId), getSemester(slug)]);
  if (!subject?.overall_notes_url) notFound();
  return <div className="flex flex-1 flex-col"><Header /><section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: semester?.name ?? slug, href: `/semester/${slug}` }, { label: subject.name, href: `/semester/${slug}/${subject.id}` }, { label: "Overall notes" }]} /><div className="mt-6 flex items-center justify-between gap-4"><h1 className="text-2xl font-bold tracking-tight">{subject.name} overall notes</h1><a href={subject.overall_notes_url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2">Open original</a></div><div className="mt-4"><PdfDocumentViewer url={subject.overall_notes_url} title={`${subject.name} overall notes`} /></div></section><Footer /></div>;
}
