"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";

const semesters = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
];

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : true;
    setIsDark(dark);
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute(
      "data-theme",
      next ? "dark" : "light",
    );
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          isDark === false ? "bg-surface-2" : ""
        }`}
      >
        <Sun size={14} />
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          isDark ? "bg-surface-2" : ""
        }`}
      >
        <Moon size={14} />
      </span>
    </button>
  );
}

function SemestersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
      >
        Semesters
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-3 grid w-72 -translate-x-1/2 grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-2 shadow-xl">
          {semesters.map((s) => (
            <a
              key={s}
              href="#semesters"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-center text-sm text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {s}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
            b
          </span>
          <span className="text-lg font-semibold">
            bitm<span className="text-accent">app</span>
          </span>
        </div>
        <nav className="hidden items-center gap-8 sm:flex">
          <ThemeToggle />
          <SemestersMenu />
          <a
            href="#notices"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Notices
          </a>
          <a
            href="#why"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Why Us
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
