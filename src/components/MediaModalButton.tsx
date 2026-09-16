"use client";

import { useEffect, useState } from "react";
import { FileText, Play, type LucideIcon } from "lucide-react";
import VideoModal from "./VideoModal";
import PdfModal from "./PdfModal";

export default function MediaModalButton({
  url,
  title,
  label,
  kind,
  className,
}: {
  url: string;
  title: string;
  label: string;
  kind: "video" | "pdf";
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const Icon: LucideIcon = kind === "video" ? Play : FileText;

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Icon size={14} className={kind === "video" ? "fill-current" : undefined} />
        {label}
      </button>

      {open && kind === "video" ? (
        <VideoModal url={url} title={title} onClose={() => setOpen(false)} />
      ) : open ? (
        <PdfModal url={url} title={title} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
