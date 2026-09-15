"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import StudyProgress from "../../src/components/StudyProgress";
import { supabaseAuth } from "../../src/lib/supabaseClient";
import { getUserProfile } from "../../src/lib/profiles";

type AuthMode = "login" | "signup";

interface FormErrors {
  email?: string;
  password?: string;
  full_name?: string;
  general?: string;
}

interface UserSession {
  id: string;
  email: string;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showProgress, setShowProgress] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const { data, error } = await supabaseAuth.getUser();
      if (error) throw error;

      if (data.user) {
        setSession({ id: data.user.id, email: data.user.email ?? "" });
        setProfile(await getUserProfile(data.user.id));
        setShowProgress(true);
      }
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void checkSession());
  }, [checkSession]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup" && !fullName.trim()) {
      newErrors.full_name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { error } = mode === "login"
        ? await supabaseAuth.signIn(email, password)
        : await supabaseAuth.signUp(email, password, {
            full_name: fullName,
          });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      // Redirect immediately after successful auth so the profile page is not shown first.
      router.replace("/");
    } catch (err) {
      console.error("Auth error:", err);
      setErrors({ general: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabaseAuth.signOut();
      if (error) throw error;
      setSession(null);
      setProfile(null);
      setShowProgress(false);
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Redirect to progress view when logged in
  if (showProgress && session) {
    return (
      <div className="flex flex-col flex-1">
        {/* Inline Header for progress view */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex min-w-0 items-center gap-4">
            <span className="max-w-[140px] truncate text-sm text-muted sm:max-w-none">
              {session.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm transition-colors hover:border-red hover:text-red"
            >
              <LogIn size={14} />
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1">
          <StudyProgress
            userId={session.id}
            userEmail={session.email}
            userFullName={profile?.full_name || null}
            avatarUrl={profile?.avatar_url || null}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 px-6 py-3">
        <Link href="/" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="text-sm text-muted">easyBITM</div>
        <div className="h-6 w-6" /> {/* Spacer */}
      </header>

      {/* Auth Form */}
      <main className="flex flex-col items-center justify-center px-6 py-16">
        {/* Logo/Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <User size={32} />
        </div>

        <h1 className="text-3xl font-bold text-center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-2 text-muted text-center">
          {mode === "login"
            ? "Sign in to track your study progress"
            : "Join easyBITM to track your progress"}
        </p>

        {/* Mode Toggle */}
        <div className="mt-8 flex w-full max-w-sm items-center gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-accent text-white"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red/10 border border-red/20 px-4 py-3 text-sm text-red">
            <AlertCircle size={16} />
            {errors.general}
            <button
              onClick={() => setErrors({})}
              className="ml-auto text-red/60 hover:text-red"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full max-w-sm space-y-4"
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.email ? "border-red" : "border-border"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-xs text-red">
                  <AlertCircle size={12} />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <Lock size={14} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.password ? "border-red" : "border-border"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="flex items-center gap-1 text-xs text-red">
                  <AlertCircle size={12} />
                  {errors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </span>
              )}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === "signup" && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full max-w-sm space-y-4"
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.full_name ? "border-red" : "border-border"
                }`}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <div className="flex items-center gap-1 text-xs text-red">
                  <AlertCircle size={12} />
                  {errors.full_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.email ? "border-red" : "border-border"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-xs text-red">
                  <AlertCircle size={12} />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <Lock size={14} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.password ? "border-red" : "border-border"
                }`}
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <div className="flex items-center gap-1 text-xs text-red">
                  <AlertCircle size={12} />
                  {errors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  Create Account
                </span>
              )}
            </button>

            <p className="text-center text-xs text-muted">
              By signing up, you agree to our terms of service
            </p>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-8 text-center text-sm text-muted">
          <Link
            href="/"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
