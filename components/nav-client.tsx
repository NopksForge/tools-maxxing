"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 2h8v11L7 9.5 3 13V2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowOut() {
  return (
    <svg className="arr" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface NavClientProps {
  profile: Profile | null;
}

// Static nav shell used as the Suspense fallback in the app layout.
// Must not use any hooks (no usePathname, useRouter, etc.) so it can be
// statically prerendered as the Suspense boundary shell for [slug] and other
// dynamic routes when cacheComponents is enabled.
export function NavSkeleton() {
  return (
    <nav className="nav">
      <a href="/browse" className="nav-logo">
        <div className="logo-mark">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="logo-word">Toolsmaxxing</span>
      </a>

      <div className="nav-search">
        <span className="ic">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input placeholder="Search tools, tags, or paste a URL…" readOnly />
        <span className="kbd">⌘K</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
        <div className="nav-links">
          <a href="/browse" className="nav-link">Browse</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/login" className="btn ghost" style={{ padding: "6px 12px" }}>Log in</a>
          <a href="/login" className="btn primary" style={{ padding: "6px 14px" }}>Get started</a>
        </div>
      </div>
    </nav>
  );
}

export function NavClient({ profile }: NavClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const initial = profile?.username
    ? profile.username[0].toUpperCase()
    : profile?.avatar_url
    ? "?"
    : "?";

  return (
    <nav className="nav">
      <Link href="/browse" className="nav-logo">
        <div className="logo-mark">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="logo-word">Toolsmaxxing</span>
      </Link>

      <div className="nav-search">
        <span className="ic">
          <IconSearch />
        </span>
        <input
          placeholder="Search tools, tags, or paste a URL…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        <span className="kbd">⌘K</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
        <div className="nav-links">
          <Link href="/browse" className={`nav-link ${pathname === "/browse" || pathname === "/" ? "active" : ""}`}>
            Browse
          </Link>
          {profile && (
            <Link href="/collections" className={`nav-link ${pathname.startsWith("/collections") ? "active" : ""}`}>
              Collections
            </Link>
          )}
          {profile && (
            <Link href="/submit" className={`nav-link ${pathname === "/submit" ? "active" : ""}`}>
              Submit
            </Link>
          )}
        </div>

        {profile ? (
          <div style={{ position: "relative" }} ref={menuRef}>
            <div
              className="avatar"
              onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
              title={profile.username ?? "Profile"}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username ?? ""} />
              ) : (
                initial
              )}
            </div>

            {showMenu && (
              <div className="avatar-menu" onClick={(e) => e.stopPropagation()}>
                <div className="head">
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 15 }}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <div className="name">{profile.username ?? "—"}</div>
                    <div className="handle">@{profile.username ?? "—"}</div>
                  </div>
                </div>

                <Link href="/profile" onClick={() => setShowMenu(false)}>
                  <IconUser /> Profile
                </Link>
                <Link href="/collections" onClick={() => setShowMenu(false)}>
                  <IconBookmark /> My collections
                </Link>
                <Link href="/settings" onClick={() => setShowMenu(false)}>
                  <IconCog /> Settings
                </Link>

                <div className="sep" />

                <a className="danger" onClick={handleSignOut}>
                  <IconLogout /> Log out
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" className="btn ghost" style={{ padding: "6px 12px" }}>
              Log in
            </Link>
            <Link href="/login" className="btn primary" style={{ padding: "6px 14px" }}>
              Get started <ArrowOut />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
