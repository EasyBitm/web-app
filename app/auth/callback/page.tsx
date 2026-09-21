"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../../src/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let mounted = true;

    async function confirm() {
      // Supabase's client picks up the token from the URL hash automatically
      // (detectSessionInUrl), but we still need to wait for that to resolve.
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setStatus("error");
        setMessage("This verification link is invalid or has expired.");
        return;
      }

      setStatus("success");
      setMessage("Email verified! Redirecting...");
      setTimeout(() => {
        if (mounted) router.replace("/profile");
      }, 1500);
    }

    void confirm();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      {status === "pending" && (
        <Loader2 size={32} className="animate-spin text-accent" />
      )}
      {status === "success" && (
        <CheckCircle2 size={32} className="text-accent" />
      )}
      {status === "error" && <AlertCircle size={32} className="text-red" />}

      <p className="mt-4 text-sm text-muted">{message}</p>

      {status === "error" && (
        <a
          href="/profile"
          className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover-primary"
        >
          Back to sign in
        </a>
      )}
    </div>
  );
}
