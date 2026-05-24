import Link from "next/link";

export const metadata = {
  title: "Browse — Toolsmaxxing",
  description: "Discover community-curated AI tools",
};

function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function BrowsePage() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="eyebrow">Catalog № 001</div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "12px 0 8px",
          }}
        >
          Browse AI Tools
        </h1>
        <p className="lede">
          Community-curated tools with strict pricing badges. No hype, just signal.
        </p>
      </div>

      {/* Coming soon placeholder */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          background: "var(--bg-2)",
          borderRadius: "var(--r-xl)",
          border: "1px dashed var(--line-strong)",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--r-lg)",
            background: "var(--teal-soft)",
            display: "grid",
            placeItems: "center",
            color: "var(--teal)",
          }}
        >
          <IconSearch />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
            Catalog coming in Phase 1
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0, maxWidth: 400 }}>
            The auth shell is live. Submit, browse, search, and social features arrive next.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/login" className="btn primary">
            Get started
          </Link>
          <a
            href="https://github.com"
            className="btn secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
