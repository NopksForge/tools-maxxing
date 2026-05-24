"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function ArrowOut() {
  return (
    <svg className="arr" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function PricingBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function LoginClient() {
  const [loading, setLoading] = useState<"github" | "google" | null>(null);

  async function signInWith(provider: "github" | "google") {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
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
          <div className="eyebrow" style={{ marginBottom: 18 }}>Welcome back</div>
          <h1 className="display-h1" style={{ marginBottom: 18 }}>
            Log in to submit, save,
            <br /> and join the catalog.
          </h1>
          <p className="lede" style={{ marginBottom: 32 }}>
            Two providers. No passwords to forget. We don&apos;t sell your data — we don&apos;t
            even know your email if you don&apos;t tell us.
          </p>

          <div className="auth-form">
            <button
              className="oauth-btn"
              onClick={() => signInWith("github")}
              disabled={loading !== null}
            >
              <IconGithub />
              <span>{loading === "github" ? "Redirecting…" : "Continue with GitHub"}</span>
              <ArrowOut />
            </button>

            <button
              className="oauth-btn"
              onClick={() => signInWith("google")}
              disabled={loading !== null}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 0deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)",
                  flexShrink: 0,
                }}
              />
              <span>{loading === "google" ? "Redirecting…" : "Continue with Google"}</span>
              <ArrowOut />
            </button>
          </div>

          <p className="muted" style={{ fontSize: 12, marginTop: 28, maxWidth: 380, lineHeight: 1.6 }}>
            By logging in you accept the community guidelines. We use OAuth — no password storage
            on our side.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/browse" className="muted" style={{ fontSize: 13, cursor: "pointer" }}>
            ← Continue as guest
          </Link>
          <span className="muted" style={{ fontSize: 12 }}>v1.0</span>
        </div>
      </div>

      {/* Right column — navy hero */}
      <div className="auth-right">
        <div className="bg-art" />

        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ color: "var(--teal-3)" }}>Catalog № 001</div>
        </div>

        <div style={{ position: "relative" }}>
          <h2>
            Find the <span className="teal">one tool</span>
            <br />
            you were missing.
          </h2>
          <p style={{ color: "rgba(240, 244, 246, 0.72)", maxWidth: 460, marginTop: 28, fontSize: 18 }}>
            Community-curated with strict pricing badges so you know what you&apos;re getting
            before you click.
          </p>
        </div>

        <div style={{ position: "relative", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PricingBadge label="Open Source" cls="b-open" />
          <PricingBadge label="Freemium" cls="b-freemium" />
          <PricingBadge label="Paid" cls="b-paid" />
          <PricingBadge label="Free" cls="b-free" />
        </div>
      </div>
    </div>
  );
}
