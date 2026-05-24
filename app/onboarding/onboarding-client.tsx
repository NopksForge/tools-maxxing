"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function ArrowOut() {
  return (
    <svg className="arr" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface OnboardingClientProps {
  userId: string;
}

export function OnboardingClient({ userId }: OnboardingClientProps) {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sanitize(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  }

  async function handleSubmit() {
    if (handle.length < 2) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ username: handle })
      .eq("id", userId);

    if (dbError) {
      if (dbError.code === "23505") {
        setError("That handle is already taken — try another.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    toast.success("Handle saved! Welcome to the catalog.");
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      {/* Left column */}
      <div className="auth-left">
        <Link href="/browse" className="nav-logo">
          <div className="logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-word">Toolsmaxxing</span>
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Welcome — one quick thing</div>
          <h1 className="display-h1" style={{ marginBottom: 18 }}>
            Pick a handle.
          </h1>
          <p className="lede" style={{ marginBottom: 28 }}>
            It&apos;s what you&apos;ll be known by in the catalog — on submissions, reviews, and
            collections. Lowercase, no spaces.
          </p>

          <div className="auth-form">
            <div className="combo-input">
              <input
                value={handle}
                onChange={(e) => {
                  setHandle(sanitize(e.target.value));
                  setError(null);
                }}
                placeholder="your-handle"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                maxLength={30}
              />
              <button
                className="btn primary"
                disabled={handle.length < 2 || loading}
                onClick={handleSubmit}
              >
                {loading ? "Saving…" : <>Take me in <ArrowOut /></>}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{error}</p>
            )}

            <p className="hint">
              Profile URL will be{" "}
              <strong className="mono">
                toolsmaxxing.dev/@{handle || "—"}
              </strong>
              . You can change this later in settings.
            </p>
          </div>
        </div>

        <p className="muted" style={{ fontSize: 12 }}>
          № 001 — by the community, for the community.
        </p>
      </div>

      {/* Right column */}
      <div className="auth-right">
        <div className="bg-art" />

        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ color: "var(--teal-3)" }}>What you unlock</div>
        </div>

        <div style={{ position: "relative" }}>
          <h2>
            Submit tools.<br />
            Save favorites.<br />
            Build <span className="teal">collections</span>.<br />
            Review &amp; comment.
          </h2>
          <p style={{ color: "rgba(240, 244, 246, 0.7)", maxWidth: 420, marginTop: 28, fontSize: 16 }}>
            Earn reputation. Unlock the triage queue. Help the catalog stay real.
          </p>
        </div>

        <div className="muted" style={{ position: "relative", color: "rgba(240, 244, 246, 0.5)", fontSize: 12 }}>
          Toolsmaxxing v1.0
        </div>
      </div>
    </div>
  );
}
