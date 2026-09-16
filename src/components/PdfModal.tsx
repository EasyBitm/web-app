"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, X } from "lucide-react";

export default function PdfModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
    }

    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === modalRef.current);
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  });

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await modalRef.current?.requestFullscreen();
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${
        isFullscreen ? "p-0" : "p-4"
      }`}
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl ${
          isFullscreen ? "h-screen max-w-none rounded-none border-0" : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit PDF fullscreen" : "Fullscreen PDF"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface-2"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe
          src={`${url}#toolbar=1`}
          title={title}
          className={`w-full bg-surface ${isFullscreen ? "min-h-0 flex-1" : "h-[75vh]"}`}
        />
      </div>
    </div>
  );
}
