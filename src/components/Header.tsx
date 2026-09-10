"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Award, ChevronDown, LogIn, Menu, Moon, Sun, X } from "lucide-react";
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
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 transition-colors hover:border-accent"
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
        className="no-red-hover flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
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

interface UserInfo {
  id: string;
  email: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          const { getUserProfile } = await import("../lib/profiles");
          const profile = await getUserProfile(supabaseUser.id);
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            profile,
          });
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-full bg-surface-2" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-muted hover:border-accent hover:text-foreground transition-colors no-red-hover"
      >
        <LogIn size={14} />
        Sign In
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-foreground transition-colors"
      >
        {user.profile?.avatar_url ? (
          <img
            src={user.profile.avatar_url}
            alt="Avatar"
            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-medium">
            {user.profile?.full_name?.[0] || user.email[0].toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block truncate max-w-[120px]">
          {user.profile?.full_name || user.email.split("@")[0]}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-surface-2 p-2 shadow-xl">
          <div className="flex items-center gap-3 rounded-lg bg-surface p-3 pb-2">
            {user.profile?.avatar_url ? (
              <img
                src={user.profile.avatar_url}
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent text-lg font-medium">
                {user.profile?.full_name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-medium">
                {user.profile?.full_name || "User"}
              </div>
              <div className="text-xs text-muted">{user.email}</div>
            </div>
          </div>

          <div className="my-2 border-t border-border" />

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground"
          >
            <Award size={14} />
            My Progress
          </Link>

          <form
            action="/api/auth/logout"
            method="POST"
            onClick={() => setOpen(false)}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-red transition-colors"
            >
              <LogIn size={14} />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const mobileLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;

    function onOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !mobileNavRef.current?.contains(target) &&
        !mobileMenuButtonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur transition-transform duration-300 ${
        footerVisible ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={(event) => {
            event.preventDefault();
            closeMenu();
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push("/");
            }
          }}
          className="flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="easyBITM"
            width={64}
            height={32}
            priority
            className="navbar-logo-dark hidden h-12 w-auto object-contain [html[data-theme='dark']_&]:block sm:h-20"
          />
          <Image
            src="/logo-light.png"
            alt="easyBITM"
            width={64}
            height={32}
            priority
            className="navbar-logo-light hidden h-12 w-auto object-contain [html[data-theme='light']_&]:block sm:h-20"
          />
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          <ThemeToggle />
          <SemestersMenu />
          <Link
            href="/cmat"
            className="text-sm font-medium text-muted hover:text-foreground no-red-hover"
          >
            CMAT
          </Link>
          <Link
            href="/notices"
            className="text-sm font-medium text-muted hover:text-foreground no-red-hover"
          >
            Notices
          </Link>
          <Link
            href="/support"
            className="text-sm font-medium text-muted hover:text-foreground no-red-hover"
          >
            Support Us
          </Link>

          {/* User auth section */}
          <div className="ml-4 flex items-center gap-2">
            <UserProfile />
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          ref={mobileMenuButtonRef}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-foreground sm:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          ref={mobileNavRef}
          className="absolute left-4 right-4 top-full z-50 mt-2 rounded-xl border border-border bg-background px-4 py-4 shadow-xl sm:hidden"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-sm text-muted">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/#semesters"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Semesters
            </Link>
            <Link href="/cmat" onClick={closeMenu} className={mobileLinkClass}>
              CMAT
            </Link>
            <Link
              href="/notices"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Notices
            </Link>
            <Link href="/support" onClick={closeMenu} className={mobileLinkClass}>
              Support Us
            </Link>
            <div className="mt-2 border-t border-border pt-3">
              <UserProfile />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
