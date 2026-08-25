"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type SemesterLink = { slug: string; name: string };

let semestersCache: SemesterLink[] | null = null;
let semestersFetchPromise: Promise<SemesterLink[]> | null = null;

function fetchSemesters(): Promise<SemesterLink[]> {
  if (semestersCache) return Promise.resolve(semestersCache);
  if (!semestersFetchPromise) {
    semestersFetchPromise = Promise.resolve(
      supabase
        .from("semesters")
        .select("slug, name")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    ).then(({ data }) => {
      semestersCache = data ?? [];
      return semestersCache!;
    });
  }
  return semestersFetchPromise;
}

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("theme");
  return stored ? stored === "dark" : true;
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      suppressHydrationWarning
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      <span
        suppressHydrationWarning
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          !isDark ? "bg-surface-2" : ""
        }`}
      >
        <Sun size={14} />
      </span>
      <span
        suppressHydrationWarning
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
  const [semesters, setSemesters] = useState<SemesterLink[]>([]);
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

  useEffect(() => {
    fetchSemesters().then(setSemesters);
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
            <Link
              key={s.slug}
              href={`/semester/${s.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-center text-sm text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {s.name}
            </Link>
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
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="easyBITM"
            width={64}
            height={32}
            priority
            className="hidden [html[data-theme='dark']_&]:block"
          />
          <Image
            src="/logo-light.png"
            alt="easyBITM"
            width={64}
            height={32}
            priority
            className="hidden [html[data-theme='light']_&]:block"
          />
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          <ThemeToggle />
          <SemestersMenu />
          <Link
            href="/cmat"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            CMAT
          </Link>
          <Link
            href="/notices"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Notices
          </Link>
          <a
            href="#"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Support Us
          </a>
          {/* <a
            href="#contact"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Contact
          </a> */}
        </nav>
      </div>
    </header>
  );
}
