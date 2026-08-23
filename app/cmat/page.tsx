import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export default function CmatPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Home
        </Link>

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

      <Footer />
    </div>
  );
}
