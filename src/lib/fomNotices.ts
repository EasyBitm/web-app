const SOURCE_URL = "https://fomecd.edu.np/";
const CATEGORY_SEARCH_URL = "https://fomecd.edu.np/searchCategoryResult";
const REQUEST_HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; easyBITM)" };

// The categories offered by the FoM notice board's search dropdown.
export const NOTICE_CATEGORIES = ["Result", "Schedule", "Exam Center", "Form", "Project"] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number] | "General";

// Category searches return ~2MB in total, so they are re-run at most this
// often, or immediately when a BITM notice appears that they haven't seen yet.
const CATEGORY_REFRESH_MS = 5 * 60_000;

export type FomLink = {
  name: string;
  url: string;
};

export type FomNotice = {
  date: string;
  title: string;
  category: NoticeCategory;
  attachments: FomLink[];
};

export type FomNoticesResult = {
  notices: FomNotice[];
  forms: FomLink[];
  fetchedAt: Date;
  sourceUrl: string;
  error?: string;
};

type CategorySnapshot = {
  fetchedAt: number;
  notices: FomNotice[];
  // BITM notices that were on the home page when this snapshot was taken.
  homeKeys: Set<string>;
};

// Each notice on the source pages looks like:
// <div class="card-body"> <small class="text-muted">2026-09-24</small> Title
//   <ul class='list-style'><li><a href="/noticeattachments/x.pdf">x.pdf</a></li></ul> ...
// </div> <div class="card-footer ...">
const NOTICE_PATTERN =
  /<div class="card-body">\s*<small class="text-muted">([^<]*)<\/small>([\s\S]*?)<div class="card-footer/g;
const LINK_PATTERN = /<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g;
const TOKEN_PATTERN = /name="_token" value="([^"]+)"/;
const SIDEBAR_START = "<div class='col-md-4'>";
const MENTIONS_BITM = /\bBITM\b/i;

let categorySnapshot: CategorySnapshot | null = null;
let categoryRequest: Promise<CategorySnapshot> | null = null;

function decodeEntities(text: string) {
  return text
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLinks(html: string): FomLink[] {
  return [...html.matchAll(LINK_PATTERN)].map(([, href, name]) => ({
    name: decodeEntities(name).replace(/\.pdf$/i, ""),
    url: new URL(decodeEntities(href), SOURCE_URL).toString(),
  }));
}

function splitPage(html: string) {
  const sidebarAt = html.indexOf(SIDEBAR_START);
  return sidebarAt === -1
    ? { noticesHtml: html, sidebarHtml: "" }
    : { noticesHtml: html.slice(0, sidebarAt), sidebarHtml: html.slice(sidebarAt) };
}

function parseBitmNotices(noticesHtml: string, category: NoticeCategory): FomNotice[] {
  const notices: FomNotice[] = [];

  for (const [, date, body] of noticesHtml.matchAll(NOTICE_PATTERN)) {
    const title = decodeEntities(body.split("<ul")[0].replace(/<[^>]+>/g, ""));
    const attachments = parseLinks(body);

    const isBitm =
      MENTIONS_BITM.test(title) || attachments.some((a) => MENTIONS_BITM.test(a.name));
    if (!isBitm) continue;

    notices.push({ date: decodeEntities(date), title, category, attachments });
  }

  return notices;
}

const noticeKey = (notice: FomNotice) => `${notice.date}|${notice.title}`;

// The search form is a Laravel POST, so it needs the session cookie and CSRF
// token handed out with the home page.
async function fetchCategorySnapshot(
  cookie: string,
  token: string,
  homeKeys: Set<string>,
): Promise<CategorySnapshot> {
  const results = await Promise.allSettled(
    NOTICE_CATEGORIES.map(async (category) => {
      const res = await fetch(CATEGORY_SEARCH_URL, {
        method: "POST",
        cache: "no-store",
        headers: { ...REQUEST_HEADERS, Cookie: cookie },
        body: new URLSearchParams({ _token: token, category, submitcat: "Search" }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`${category} search responded with ${res.status}`);
      return parseBitmNotices(splitPage(await res.text()).noticesHtml, category);
    }),
  );

  if (results.some((r) => r.status === "rejected")) {
    // Keep the previous snapshot rather than dropping a category's notices.
    throw new Error("One or more category searches failed");
  }

  return {
    fetchedAt: Date.now(),
    notices: results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    homeKeys,
  };
}

async function getCategorySnapshot(cookie: string, token: string, homeKeys: Set<string>) {
  const snapshot = categorySnapshot;
  const isFresh =
    snapshot &&
    Date.now() - snapshot.fetchedAt < CATEGORY_REFRESH_MS &&
    [...homeKeys].every((key) => snapshot.homeKeys.has(key));

  if (isFresh) return snapshot;

  categoryRequest ??= fetchCategorySnapshot(cookie, token, homeKeys)
    .then((fresh) => (categorySnapshot = fresh))
    .finally(() => (categoryRequest = null));

  return categoryRequest.catch(() => snapshot);
}

// Fetches the FoM home page on every call (no caching) and keeps only
// notices and forms that mention BITM. Categories and older notices come from
// the site's category search.
export async function getBitmNotices(): Promise<FomNoticesResult> {
  const fetchedAt = new Date();

  try {
    const res = await fetch(SOURCE_URL, {
      cache: "no-store",
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`FoM site responded with ${res.status}`);
    }

    const html = await res.text();
    const { noticesHtml, sidebarHtml } = splitPage(html);
    const homeNotices = parseBitmNotices(noticesHtml, "General");
    const forms = parseLinks(sidebarHtml).filter((form) => MENTIONS_BITM.test(form.name));

    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    const token = html.match(TOKEN_PATTERN)?.[1];
    const snapshot = token
      ? await getCategorySnapshot(cookie, token, new Set(homeNotices.map(noticeKey)))
      : categorySnapshot;

    // Category results tag each notice; home-page notices missing from every
    // category stay "General".
    const byKey = new Map<string, FomNotice>();
    for (const notice of [...(snapshot?.notices ?? []), ...homeNotices]) {
      const key = noticeKey(notice);
      if (!byKey.has(key)) byKey.set(key, notice);
    }

    const notices = [...byKey.values()].sort((a, b) => b.date.localeCompare(a.date));

    return { notices, forms, fetchedAt, sourceUrl: SOURCE_URL };
  } catch (err) {
    return {
      notices: [],
      forms: [],
      fetchedAt,
      sourceUrl: SOURCE_URL,
      error: err instanceof Error ? err.message : "Could not reach the FoM site",
    };
  }
}
