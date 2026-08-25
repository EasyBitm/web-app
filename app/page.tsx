import Image from "next/image";
import Link from "next/link";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { getSemesters } from "../src/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const semesters = await getSemesters();
  const totalSubjects = semesters.reduce((sum, s) => sum + s.subjects.length, 0);

  const stats = [
    { label: "Semesters Covered", value: `${semesters.length || 8}` },
    { label: "Subjects Listed", value: `${totalSubjects}+` },
    { label: "Cost to Use", value: "Free" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 my-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Your <span className="text-accent">simple</span> guide to
            master every semester exam.
          </h1>
          <p className="max-w-md text-muted">
            Notes, guides, and organized resources so you can
            focus on learning instead of hunting for materials.
          </p>

          <div className="flex flex-wrap gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="text-xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#semesters"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Start Learning
            </a>
            {/* <a
              href="#contact"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              Contribute
            </a> */}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
          <Image
            src="/TU-LOGO.png"
            alt="Tribhuvan University Logo"
            width={220}
            height={220}
            className="h-40 w-40 object-contain sm:h-56 sm:w-56"
            priority
          />
          <p className="text-sm font-semibold leading-snug md:text-lg">
            Bachelor of <span className="text-accent">Information Technology Management</span>
            <br />
            <span className="text-muted">(Tribhuvan University, Nepal)</span>
          </p>
        </div>
      </section>

      <section id="semesters" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Start Learning</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((s) => (
            <Link
              key={s.slug}
              href={`/semester/${s.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted">
                  {s.subjects.length} subjects
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted">
                &rsaquo;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="why" className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Why <span className="text-accent">easy</span>BITM?
          </h2>
          <p className="mt-3 text-muted">
            Everything organized in one place, updated by the community, and
            free to use.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-medium">Organized by Semester</div>
              <p className="mt-2 text-sm text-muted">
                Find exactly what you need without digging through folders.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-medium">Community Driven</div>
              <p className="mt-2 text-sm text-muted">
                Content improves over time with contributions from students.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="font-medium">Always Free</div>
              <p className="mt-2 text-sm text-muted">
                No paywalls, no subscriptions — just resources when you need
                them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">Help us improve</h2>
          <p className="text-muted">
            Found a bug or have a feature request? Let us know and help make
            this platform better.
          </p>
          <a
            href="mailto:easybitm@gmail.com"
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Send Feedback
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
