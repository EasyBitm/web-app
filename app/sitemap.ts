import type { MetadataRoute } from "next";
import { getSemesters } from "../src/lib/data";

export const dynamic = "force-dynamic";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://easybitm.vercel.app"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const semesters = await getSemesters();

  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/cmat`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/notices`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  for (const semester of semesters) {
    const semesterPath = `/semester/${encodeURIComponent(semester.slug)}`;

    urls.push({
      url: `${siteUrl}${semesterPath}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    if (semester.overall_syllabus_url) {
      urls.push({
        url: `${siteUrl}${semesterPath}/overall-syllabus`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const subject of semester.subjects) {
      urls.push({
        url: `${siteUrl}${semesterPath}/${encodeURIComponent(subject.id)}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return urls;
}
