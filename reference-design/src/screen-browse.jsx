// Browse + Search screens.

function BrowseScreen({ user, filters, setFilters, navigate, query, onSearch }) {
  const [sort, setSort] = React.useState("Trending");
  const [layout, setLayout] = React.useState("list");
  const [upvoted, setUpvoted] = React.useState(new Set());
  const [faved, setFaved] = React.useState(new Set());

  const featured = TOOLS.filter(t => t.featured);
  const filtered = applyFilters(TOOLS, filters, "");
  const nonFeatured = filtered.filter(t => !t.featured);

  const toggleUp = (id) => setUpvoted(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const toggleFav = (id) => setFaved(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); window.__showToast?.(ns.has(id) ? "Added to favorites" : "Removed from favorites"); return ns; });

  return (
    <>
      <section className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="hero">
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Catalog № 001 / updated {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
            <h1>
              The catalog of<br/>
              tools <em>you</em> use<br/>
              to think faster.
            </h1>
            <div className="lede">
              A community-curated index of AI tools — repos, hosted products, and local models — sorted by what people actually run.
            </div>
          </div>
          <div className="stats">
            <div><span className="n">{TOOLS.length * 17}</span>tools indexed</div>
            <div><span className="n">2,431</span>contributors</div>
            <div><span className="n">17</span>added today</div>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="sec">
          <span className="label">Featured</span>
          <span className="rule" />
          <span className="num">{featured.length} pinned</span>
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

        <div className="sec">
          <span className="label">All tools</span>
          <span className="rule" />
          <span className="num">{filtered.length} of {TOOLS.length}</span>
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
                title="Nothing matches those filters"
                body="Try loosening a filter, or be the first to add a tool that fits."
                action={
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn" onClick={() => setFilters({ pricing: [], deployment: [], access: [], tags: [] })}>Clear filters</button>
                    <button className="btn primary" onClick={() => navigate("submit")}>Submit a tool</button>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
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
      </section>
    </>
  );
}

function SearchScreen({ user, filters, setFilters, navigate, query, setQuery }) {
  const [sort, setSort] = React.useState("Top");
  const [layout, setLayout] = React.useState("list");
  const filtered = applyFilters(TOOLS, filters, query);

  return (
    <section className="page">
      <div style={{ paddingBottom: 28, borderBottom: "1px solid var(--ink)" }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Search results</div>
        <h1 className="display-i" style={{ fontSize: 64, lineHeight: 0.95, marginBottom: 12 }}>
          {query ? <>"{query}"</> : "Search the catalog"}
        </h1>
        <div className="mono" style={{ color: "var(--mute)", fontSize: 12 }}>
          {filtered.length} {filtered.length === 1 ? "match" : "matches"} · searched name, tags, description
        </div>
      </div>

      <div className="grid-browse" style={{ marginTop: 32 }}>
        <div className="grid-browse-rail">
          <FilterRail filters={filters} setFilters={setFilters} />
        </div>
        <div>
          <AppliedChips filters={filters} setFilters={setFilters} q={query} setQ={setQuery} />
          <SortBar sort={sort} setSort={setSort} count={filtered.length} layout={layout} setLayout={setLayout} />
          {filtered.length === 0 ? (
            <EmptyState
              title="Nothing found"
              body={`No tools match "${query}" with those filters. Try a broader query, drop a filter, or submit the missing tool yourself.`}
              action={
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" onClick={() => { setQuery(""); setFilters({ pricing: [], deployment: [], access: [], tags: [] }); }}>Reset search</button>
                  <button className="btn primary" onClick={() => navigate("submit")}><IconPlus size={12} /> Submit it</button>
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
    </section>
  );
}

Object.assign(window, { BrowseScreen, SearchScreen });
