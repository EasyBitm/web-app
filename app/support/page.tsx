import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Bug, Heart, Mail, Share2 } from "lucide-react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "Support Us",
  description:
    "Help easyBITM stay free and useful for BITM students by sharing resources, feedback, and ideas.",
};

const waysToHelp = [
  {
    icon: BookOpen,
    title: "Share useful resources",
    description:
      "Have clear notes, question papers, study guides, or a helpful video? Share them so more students can learn from them.",
  },
  {
    icon: Bug,
    title: "Report a problem",
    description:
      "Found a broken link, outdated information, or something that could work better? Every report helps us improve.",
  },
  {
    icon: Share2,
    title: "Spread the word",
    description:
      "Tell your classmates about easyBITM. The more students who use it, the more useful this community becomes.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center lg:px-10 lg:py-28">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Heart size={30} fill="currentColor" aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Built by students, for students
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Help keep easyBITM free and useful.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            easyBITM grows through the time, ideas, and resources shared by the
            BITM community. You can help make studying a little easier for
            someone else.
          </p>
          <a
            href="mailto:easybitm@gmail.com"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover-primary"
          >
            <Mail size={16} aria-hidden="true" />
            Get in touch
          </a>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-2">
                Ways to contribute
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Small contributions make a big difference.
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                You do not need to be a developer or spend money to support
                easyBITM. Choose whatever feels easy and meaningful to you.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {waysToHelp.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent-2/70"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-2/10 text-accent-2">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <div>
              <h2 className="text-2xl font-semibold">Have an idea?</h2>
              <p className="mt-2 text-muted">
                We would love to hear how easyBITM can serve students better.
              </p>
            </div>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-full border border-accent-2/60 bg-accent-2/10 px-5 py-3 text-sm font-medium text-accent-2 transition-colors hover:bg-accent-2 hover:text-white"
            >
              Send feedback
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
