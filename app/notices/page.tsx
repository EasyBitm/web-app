import { Bell, ExternalLink, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import Breadcrumbs from "../../src/components/Breadcrumbs";
import LiveRefresh from "../../src/components/LiveRefresh";
import {
  getBitmNotices,
  NOTICE_CATEGORIES,
  type FomLink,
  type NoticeCategory,
} from "../../src/lib/fomNotices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BITM Notices and Announcements",
  description:
    "Stay up to date with BITM announcements, exam information, deadlines, and important student updates.",
  openGraph: {
    title: "BITM Notices and Announcements | easyBITM",
    description:
      "Important announcements, exam information, deadlines, and updates for BITM students.",
  },
};

// The source dates are plain YYYY-MM-DD strings; show them as "24 Sep 2026".
function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PdfLink({ link }: { link: FomLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <FileText size={16} className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate">{link.name}</span>
      <ExternalLink
        size={14}
        className="shrink-0 text-muted transition-colors group-hover:text-accent"
      />
    </a>
  );
}

function FilterChip({
  label,
  count,
  category,
  active,
}: {
  label: string;
  count: number;
  category?: NoticeCategory;
  active: boolean;
}) {
  return (
    <Link
      href={category ? { pathname: "/notices", query: { category } } : "/notices"}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-border hover:border-accent hover:text-accent"
      }`}
    >
      {label} <span className={active ? undefined : "text-muted"}>{count}</span>
    </Link>
  );
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ notices, forms, fetchedAt, sourceUrl, error }, { category: categoryParam }] =
    await Promise.all([getBitmNotices(), searchParams]);

  const hasGeneral = notices.some((notice) => notice.category === "General");
  const categories: NoticeCategory[] = hasGeneral
    ? [...NOTICE_CATEGORIES, "General"]
    : [...NOTICE_CATEGORIES];
  const activeCategory = categories.find((c) => c === categoryParam);
  const visibleNotices = activeCategory
    ? notices.filter((notice) => notice.category === activeCategory)
    : notices;

  const checkedAt = fetchedAt.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <LiveRefresh />

      <section className="mx-auto min-h-screen w-full max-w-5xl px-6 py-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Notices" }]} />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>

          <div className="flex items-center gap-2 text-sm text-muted">
            <span
              className={`h-2 w-2 rounded-full ${error ? "bg-red" : "animate-pulse bg-accent"}`}
            />
            {error ? "FoM site unreachable" : "Live"} · checked {checkedAt}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted">
          BITM notices pulled directly from the{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Faculty of Management notice board
          </a>
          .
        </p>

        {!error && (
          <nav aria-label="Notice categories" className="mt-6 flex flex-wrap gap-2">
            <FilterChip label="All" count={notices.length} active={!activeCategory} />
            {categories.map((category) => (
              <FilterChip
                key={category}
                label={category}
                category={category}
                count={notices.filter((notice) => notice.category === category).length}
                active={category === activeCategory}
              />
            ))}
          </nav>
        )}

        {visibleNotices.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-4">
            {visibleNotices.map((notice) => (
              <li
                key={`${notice.date}-${notice.title}`}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
                  <time dateTime={notice.date}>{formatDate(notice.date)}</time>
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5">
                    {notice.category}
                  </span>
                </div>
                <h2 className="mt-2 font-medium leading-snug">{notice.title}</h2>

                {notice.attachments.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {notice.attachments.map((link) => (
                      <PdfLink key={link.url} link={link} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Bell size={28} />
            </span>
            <p className="max-w-md text-muted">
              {error
                ? "Couldn't reach the FoM notice board right now. This page will retry automatically."
                : activeCategory
                  ? `No BITM notices under ${activeCategory} right now.`
                  : "No BITM notices on the FoM notice board at the moment."}
            </p>
          </div>
        )}

        {forms.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight">Forms</h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {forms.map((link) => (
                <PdfLink key={link.url} link={link} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
