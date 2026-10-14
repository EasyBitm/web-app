"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (source: { url: string; withCredentials?: boolean }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getViewport: (options: { scale: number }) => { width: number; height: number };
            render: (options: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
            }) => { promise: Promise<void> };
          }>;
        }>;
      };
    };
  }
}

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);

  return new Promise<NonNullable<Window["pdfjsLib"]>>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PDFJS_URL}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => window.pdfjsLib && resolve(window.pdfjsLib));
      existingScript.addEventListener("error", () => reject(new Error("Could not load PDF.js")));
      return;
    }

    const script = document.createElement("script");
    script.src = PDFJS_URL;
    script.async = true;
    script.onload = () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error("PDF.js did not load"));
    script.onerror = () => reject(new Error("Could not load PDF.js"));
    document.head.appendChild(script);
  });
}

export default function PdfDocumentViewer({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // "loading" until the first page is drawn; later pages keep rendering underneath.
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      setStatus("loading");
      setProgress(null);
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled || !containerRef.current) return;

        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise;
        const container = containerRef.current;
        container.replaceChildren();

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "block h-auto w-full";
          canvas.setAttribute("aria-label", `${title}, page ${pageNumber}`);

          const pageShell = document.createElement("div");
          pageShell.className = "overflow-hidden rounded-xl border border-border bg-white shadow-sm";
          pageShell.appendChild(canvas);
          container.appendChild(pageShell);

          await page.render({ canvasContext: context, viewport }).promise;
          if (cancelled) return;
          setStatus("ready");
          setProgress({ done: pageNumber, total: pdf.numPages });
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    renderPdf();
    return () => {
      cancelled = true;
    };
  }, [title, url]);

  return (
    <div aria-label={title}>
      {status === "loading" && (
        <div className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-muted">
          Loading document…
        </div>
      )}
      {status === "error" && (
        <div className="rounded-xl bg-surface px-6 py-12 text-center text-sm text-muted">
          This document could not be displayed right now. Please try again or open the original.
        </div>
      )}
      <div ref={containerRef} className="flex flex-col gap-5" />
      {status === "ready" && progress && progress.done < progress.total && (
        <div className="mt-5 text-center text-sm text-muted">
          Loading page {progress.done + 1} of {progress.total}…
        </div>
      )}
      {status === "ready" && progress?.done === progress?.total && (
        <span className="sr-only">Document loaded</span>
      )}
    </div>
  );
}
