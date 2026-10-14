import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Header from "../../src/components/Header";

export const metadata: Metadata = {
  title: "CMAT Preparation",
  description:
    "Explore CMAT preparation resources and study guides for the Common Management Admission Test.",
  openGraph: {
    title: "CMAT Preparation | easyBITM",
    description:
      "CMAT preparation resources and study guides for aspiring BITM students.",
  },
};

export default function CmatPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header breadcrumbs={[{ label: "Home", href: "/" }, { label: "CMAT" }]} />

      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
            <GraduationCap size={28} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">CMAT Preparation</h1>
          <p className="max-w-md text-muted">
            Resources and guides for the Common Management Admission Test
            (CMAT) are on the way. Check back soon.
          </p>
        </div>
      </section>
    </div>
  );
}
