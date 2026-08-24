import { GraduationCap } from "lucide-react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import Breadcrumbs from "../../src/components/Breadcrumbs";

export default function CmatPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
        <div className="absolute left-6 top-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "CMAT" }]} />
        </div>

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
