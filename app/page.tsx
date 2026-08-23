import Header from "./components/Header";

const stats = [
  { label: "Active Learners", value: "400+" },
  { label: "Community Members", value: "300+" },
  { label: "Monthly Views", value: "80K" },
];

const semesters = [
  { name: "First Semester", subjects: 5 },
  { name: "Second Semester", subjects: 5 },
  { name: "Third Semester", subjects: 5 },
  { name: "Fourth Semester", subjects: 5 },
  { name: "Fifth Semester", subjects: 7 },
  { name: "Sixth Semester", subjects: 5 },
  { name: "Seventh Semester", subjects: 4 },
  { name: "Eighth Semester", subjects: 1 },
];

const footerLinks = {
  Explore: ["Semesters", "Notices", "Why Us"],
  Company: ["About", "Team", "Feedback"],
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Your <span className="text-accent">simple</span> guide to
            mastering every semester
          </h1>
          <p className="max-w-md text-muted">
            Notes, guides, and resources organized by semester so you can
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
            <a
              href="#contact"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              Contribute
            </a>
          </div>
        </div>

        <div className="relative mx-auto grid h-72 w-full max-w-sm grid-cols-2 gap-4 sm:h-96">
          <div className="col-span-2 rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Fifth Semester</div>
            <div className="mt-1 font-medium">Compiler Design</div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-surface-2">
              <div className="h-1.5 w-2/3 rounded-full bg-accent" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-accent/10 p-5">
            <div className="text-2xl font-semibold text-accent">12</div>
            <div className="mt-1 text-xs text-muted">Notes Available</div>
          </div>
          <div className="rounded-2xl border border-border bg-accent-2/10 p-5">
            <div className="text-2xl font-semibold text-accent-2">6</div>
            <div className="mt-1 text-xs text-muted">Guides Uploaded</div>
          </div>
        </div>
      </section>

      <section id="semesters" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Start Learning</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((s) => (
            <a
              key={s.name}
              href="#"
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted">
                  {s.subjects} subjects
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted">
                &rsaquo;
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="why" className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Why <span className="text-accent">bitm</span>app?
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
            href="mailto:info@example.com"
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Send Feedback
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
                b
              </span>
              <span className="font-semibold">bitmapp</span>
            </div>
            <p className="text-sm text-muted">
              An attempt to make studying easier for everyone.
            </p>
          </div>

          <div className="flex gap-16">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <div className="text-sm font-semibold">{title}</div>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-foreground">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center">
            <span>
              © {new Date().getFullYear()} bitmapp. All rights reserved.
            </span>
            <a
              href="mailto:info@example.com"
              className="hover:text-foreground"
            >
              info@example.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
