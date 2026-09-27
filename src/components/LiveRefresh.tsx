"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-runs the page's server fetches on an interval while the tab is visible,
// and immediately when the user comes back to the tab.
export default function LiveRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const timer = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
