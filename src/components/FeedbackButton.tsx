"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { FEEDBACK_TYPES, MAX_FEEDBACK_LENGTH, type FeedbackType } from "../lib/feedback";

type Status = "idle" | "sending" | "sent" | "error";

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<FeedbackType>("Bug");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: form.get("message"),
          email: form.get("email"),
          website: form.get("website"),
          page: window.location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Couldn't send your feedback. Please try again");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setError("You seem to be offline. Please try again");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-left text-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback"
          className="absolute right-4 top-4 flex cursor-pointer h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <X size={18} />
        </button>

        {status === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 size={44} className="text-accent" aria-hidden="true" />
            <h2 id="feedback-title" className="mt-4 text-xl font-semibold">
              Thanks for your feedback!
            </h2>
            <p className="mt-2 text-sm text-muted">
              It went straight to the easyBITM team.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 cursor-pointer rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover-primary"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="feedback-title" className="text-xl font-semibold">
              Send feedback
            </h2>
            <p className="mt-1 text-sm text-muted">
              Found a bug, missing a resource, or have an idea? Tell us.
            </p>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium">What is it about?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map((option) => (
                  <label
                    key={option}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                      type === option
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border text-muted hover:border-accent hover:text-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option}
                      checked={type === option}
                      onChange={() => setType(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 block text-sm font-medium" htmlFor="feedback-message">
              Your feedback
            </label>
            <textarea
              id="feedback-message"
              name="message"
              required
              autoFocus
              rows={5}
              maxLength={MAX_FEEDBACK_LENGTH}
              placeholder="What's on your mind?"
              className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
            />

            <label className="mt-4 block text-sm font-medium" htmlFor="feedback-email">
              Your email
            </label>
            <input
              id="feedback-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
            />

            {/* Honeypot: hidden from people, often filled in by spam bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {status === "error" && (
              <p role="alert" className="mt-4 text-sm text-red">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover-primary disabled:cursor-wait disabled:opacity-70"
              >
                <Send size={16} aria-hidden="true" />
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// A button that opens the feedback form in a popup. Pass the same className
// the old mailto link used so it keeps its look.
export default function FeedbackButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`cursor-pointer ${className ?? ""}`}>
        {children}
      </button>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}
