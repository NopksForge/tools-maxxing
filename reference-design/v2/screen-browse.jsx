// V2 Browse + Search

function HeroGraphic() {
  // Abstract floating UI graphic: stacked card + popover stat + sparkline + dark floater
  return (
    <div className="hero-graphic">
      <div className="hg-bg-blob" />
      <div className="hg-card hg-main">
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>
          Trending today
        </div>
        <div className="hg-row t">
          <div className="ic">C</div>
          <div>
            <div className="name">Claude Code</div>
            <div className="sub">freemium · cloud</div>
          </div>
          <div className="up teal">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M2 6L6 2L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            4,827
          </div>
        </div>
        <div className="hg-row">
          <div className="ic">O</div>
          <div>
            <div className="name">Ollama</div>
            <div className="sub">open source · local</div>
          </div>
          <div className="up">↑ 3,142</div>
        </div>
        <div className="hg-divide" />
        <div className="hg-mini">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "var(--white)", borderRadius: 8, border: "1px solid var(--line)", fontWeight: 600 }}>P</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Perplexity</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>past 7d</div>
          </div>
          <svg className="hg-spark" viewBox="0 0 60 24" preserveAspectRatio="none">
            <polyline points="0,18 8,15 16,16 24,12 32,13 40,8 48,9 60,3" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="hg-card hg-pop">
        <div className="h">Indexed tools</div>
        <div className="stat">
          <div className="n">{(TOOLS.length * 17).toLocaleString()}</div>
          <div className="pct">+12.4%</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>vs. last quarter</div>
        <svg viewBox="0 0 240 60" preserveAspectRatio="none" style={{ width: "100%", height: 36, marginTop: 4 }}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,48 L20,42 L40,44 L60,36 L80,38 L100,28 L120,30 L140,22 L160,16 L180,18 L200,10 L220,12 L240,4 L240,60 L0,60 Z" fill="url(#g)" />
          <path d="M0,48 L20,42 L40,44 L60,36 L80,38 L100,28 L120,30 L140,22 L160,16 L180,18 L200,10 L220,12 L240,4" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="hg-floater">
        <span className="dot" />
        <span><strong>17</strong> new today</span>
      </div>
    </div>
  );
}

function LogoStrip() {
  // Monochrome wordmarks for visual trust
  return (
    <div className="logo-strip">
      <span className="label">Trusted by builders at</span>
      <div className="logos">
        <span style={{ fontWeight: 800 }}>Vercel</span>
        <span style={{ fontFamily: "Georgia, serif" }}>Stripe</span>
        <span className="italic">Modal</span>
        <span style={{ letterSpacing: "0.2em" }}>LINEAR</span>
        <span style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>retool</span>
        <span style={{ textTransform: "lowercase" }}>Anthropic</span>
        <span style={{ fontFamily: "monospace" }}>Replit</span>
      </div>
    </div>
  );
}

function BrowseScreen({ user, filters, setFilters, navigate }) {
  const [sort, setSort] = React.useState("Trending");
  const [layout, setLayout] = React.useState("list");
  const [upvoted, setUpvoted] = React.useState(new Set());
  const [faved, setFaved] = React.useState(new Set());

  const featured = TOOLS.filter(t => t.featured);
  const filtered = applyFilters(TOOLS, filters, "");
  const nonFeatured = filtered.filter(t => !t.featured);

  const toggleUp = (id) => setUpvoted(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const toggleFav = (id) => setFaved(s => {
    const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id);
    window.__showToast?.(ns.has(id) ? "Added to favorites" : "Removed from favorites");
    return ns;
  });

  return (
    <>
      {/* Hero */}
      <section className="page">
        <div className="hero">
          <div>
            <div className="eyebrow">Catalog № 001 · Updated daily</div>
            <h1 className="h-display" style={{ marginTop: 22 }}>
              The catalog of <span className="teal">AI tools</span><br />
              that actually ship.
            </h1>
            <p className="lede">
              A community-curated index of {(TOOLS.length * 17).toLocaleString()} AI tools — repos, hosted products, and local models — sorted by what builders actually run.
            </p>
            <div className="cta-row">
              <button className="btn primary lg" onClick={() => navigate("submit")}>
                Submit a tool <ArrowOut />
              </button>
              <button className="btn secondary lg" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>
                Browse catalog
              </button>
            </div>
            <div className="trust">
              <span><span className="stars">★★★★★</span> <strong>4.8</strong> from 2,431 contributors</span>
              <span>·</span>
              <span><strong>17</strong> new tools today</span>
            </div>
          </div>
          <HeroGraphic />
        </div>

        <LogoStrip />

        {/* Stat row */}
        <div className="stat-row">
          <div className="stat-item">
            <div className="eyebrow">Indexed</div>
            <span className="mega-num n">{(TOOLS.length * 17).toLocaleString()}</span>
            <div className="desc">Hand-reviewed tools across 40+ tags.</div>
          </div>
          <div className="stat-item">
            <div className="eyebrow">Contributors</div>
            <span className="mega-num n">2,431</span>
            <div className="desc">Active members submitting and reviewing.</div>
          </div>
          <div className="stat-item">
            <div className="eyebrow">Reviews</div>
            <span className="mega-num n">14k+</span>
            <div className="desc">From people who actually use the tools.</div>
          </div>
          <div className="stat-item">
            <div className="eyebrow">Open source</div>
            <span className="mega-num n">38%</span>
            <div className="desc">Of catalog tools are open or self-hostable.</div>
          </div>
        </div>
      </section>

      {/* Featured strip */}
      <section className="section" id="catalog">
        <div className="page">
          <div className="section-head">
            <div>
              <div className="eyebrow">Featured this week</div>
              <h2 className="h-1">Pinned by the editors.</h2>
            </div>
            <div className="meta">Rotates weekly. Submit your tool for a chance to land here.</div>
          </div>
          <div className="feed">
            {featured.map(t => (
              <ToolCard key={t.id} tool={t} featured
                onClick={() => navigate("detail", { id: t.id })}
                onUpvote={() => toggleUp(t.id)} onFav={() => toggleFav(t.id)}
                upvoted={upvoted.has(t.id)} faved={faved.has(t.id)}
                asGuest={!user}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Navy "How it works" anchor section */}
      <section className="section-anchor on-navy">
        <div className="page">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
            <div className="eyebrow no-rule">How it works</div>
            <h2 className="h-1" style={{ marginTop: 18 }}>One catalog. Built by the people who use it.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { n: "01", h: "Drop a link.", p: "Paste any URL and we'll pull the metadata, dedupe against the catalog, and queue it for community review." },
              { n: "02", h: "Vote with your stack.", p: "Upvote the tools that earned a place in your workflow. Build private or shareable collections of what's actually working." },
              { n: "03", h: "Trust the badges.", p: "Every tool wears strict pricing, deployment, and access labels. No marketing fluff — just what you need to decide if it's for you." },
            ].map(s => (
              <div key={s.n} style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 24 }}>
                <div className="mono" style={{ fontSize: 13, color: "var(--teal-3)", marginBottom: 32, fontWeight: 600 }}>{s.n}</div>
                <h3 className="h-3" style={{ color: "white", marginBottom: 12 }}>{s.h}</h3>
                <p style={{ color: "rgba(240, 244, 246, 0.72)", fontSize: 14, lineHeight: 1.6 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog list */}
      <section className="section">
        <div className="page">
          <div className="section-head">
            <div>
              <div className="eyebrow gray">Full catalog</div>
              <h2 className="h-1">Every tool, sorted by what runs.</h2>
            </div>
            <div className="meta">
              Showing {filtered.length} of {TOOLS.length} — refine with filters or paste a query into search.
            </div>
          </div>
          <div className="grid-browse">
            <div className="grid-browse-rail">
              <FilterRail filters={filters} setFilters={setFilters} />
            </div>
            <div>
              <AppliedChips filters={filters} setFilters={setFilters} />
              <SortBar sort={sort} setSort={setSort} count={nonFeatured.length} layout={layout} setLayout={setLayout} />
              {nonFeatured.length === 0 ? (
                <EmptyState
                  title="No tools match those filters."
                  body="Try loosening a filter, or be the first to add a tool that fits."
                  action={
                    <div className="row" style={{ gap: 10, marginTop: 6 }}>
                      <button className="btn secondary" onClick={() => setFilters({ pricing: [], deployment: [], access: [], tags: [] })}>Clear filters</button>
                      <button className="btn primary" onClick={() => navigate("submit")}>Submit a tool <ArrowOut /></button>
                    </div>
                  }
                />
              ) : layout === "list" ? (
                <div className="feed">
                  {nonFeatured.map(t => (
                    <ToolCard key={t.id} tool={t}
                      onClick={() => navigate("detail", { id: t.id })}
                      onUpvote={() => toggleUp(t.id)} onFav={() => toggleFav(t.id)}
                      upvoted={upvoted.has(t.id)} faved={faved.has(t.id)}
                      asGuest={!user}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                  {nonFeatured.map(t => (
                    <ToolCard key={t.id} tool={t} compact
                      onClick={() => navigate("detail", { id: t.id })}
                      onUpvote={() => toggleUp(t.id)} onFav={() => toggleFav(t.id)}
                      upvoted={upvoted.has(t.id)} faved={faved.has(t.id)}
                      asGuest={!user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA (also navy anchor — second one for spec) */}
      <section className="section-anchor on-navy">
        <div className="page" style={{ textAlign: "center" }}>
          <div className="eyebrow no-rule">Contribute</div>
          <h2 className="h-1" style={{ marginTop: 18, maxWidth: 16 + "ch", margin: "18px auto 24px" }}>
            Add the tool that<br />no one's added yet.
          </h2>
          <p className="lede" style={{ margin: "0 auto 32px", color: "rgba(240, 244, 246, 0.78)" }}>
            The catalog is only as good as the people building it. Submitting takes one paste.
          </p>
          <div className="row" style={{ justifyContent: "center", gap: 10 }}>
            <button className="btn primary lg" onClick={() => navigate("fastdrop")}>
              Try Fast Drop <ArrowOut />
            </button>
            <button className="btn secondary lg" onClick={() => navigate("submit")}>
              Full submission
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function SearchScreen({ user, filters, setFilters, navigate, query, setQuery }) {
  const [sort, setSort] = React.useState("Top");
  const [layout, setLayout] = React.useState("list");
  const filtered = applyFilters(TOOLS, filters, query);

  return (
    <>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="page">
          <div className="crumb">
            <span className="l" onClick={() => navigate("browse")}>Catalog</span>
            <span>/</span>
            <span>Search</span>
          </div>
          <div className="eyebrow">Search results</div>
          <h1 className="h-1" style={{ marginTop: 14 }}>
            {query ? <>"<span style={{ color: "var(--teal)" }}>{query}</span>"</> : "Search the catalog"}
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            <strong>{filtered.length}</strong> {filtered.length === 1 ? "match" : "matches"} · searched name, tags, and description.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="grid-browse">
            <div className="grid-browse-rail">
              <FilterRail filters={filters} setFilters={setFilters} />
            </div>
            <div>
              <AppliedChips filters={filters} setFilters={setFilters} q={query} setQ={setQuery} />
              <SortBar sort={sort} setSort={setSort} count={filtered.length} layout={layout} setLayout={setLayout} />
              {filtered.length === 0 ? (
                <EmptyState
                  title="Nothing found."
                  body={`No tools match "${query}" with those filters. Try a broader query, drop a filter, or submit the missing tool yourself.`}
                  action={
                    <div className="row" style={{ gap: 10, marginTop: 6 }}>
                      <button className="btn secondary" onClick={() => { setQuery(""); setFilters({ pricing: [], deployment: [], access: [], tags: [] }); }}>Reset search</button>
                      <button className="btn primary" onClick={() => navigate("submit")}><IconPlus size={13} sw={2} /> Submit it</button>
                    </div>
                  }
                />
              ) : (
                <div className="feed">
                  {filtered.map(t => (
                    <ToolCard key={t.id} tool={t}
                      onClick={() => navigate("detail", { id: t.id })}
                      asGuest={!user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { BrowseScreen, SearchScreen, HeroGraphic, LogoStrip });
