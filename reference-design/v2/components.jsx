// V2 shared components — SaaS aesthetic

const PRICING_CLASS = {
  "Open Source": "b-open",
  "Freemium": "b-freemium",
  "Paid": "b-paid",
  "Free": "b-free",
};

function Badge({ kind, children, className = "" }) {
  return (
    <span className={`badge ${kind} ${className}`}>
      <span className="dot" />{children}
    </span>
  );
}

function PricingBadge({ value }) {
  const cls = PRICING_CLASS[value] || "b-free";
  return <Badge kind={cls}>{value}</Badge>;
}

function DeployBadge({ value }) {
  return <span className="badge deploy">{value}</span>;
}

function FlagBadge({ children }) {
  return <span className="badge flag">{children}</span>;
}

function TealBadge({ children }) {
  return <span className="badge teal">{children}</span>;
}

function Tag({ children, onClick }) {
  return <span className="tag" onClick={onClick}>{children}</span>;
}

function ArrowOut({ size = 12 }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToolCard({ tool, compact, featured, onClick, onUpvote, onFav, upvoted, faved, asGuest }) {
  const handleUp = (e) => {
    e.stopPropagation();
    if (asGuest) { window.__showToast?.("Log in to upvote"); return; }
    onUpvote?.();
  };
  const handleFav = (e) => {
    e.stopPropagation();
    if (asGuest) { window.__showToast?.("Log in to save"); return; }
    onFav?.();
  };
  return (
    <div className={`card tool-card ${compact ? "compact" : ""} ${featured ? "featured" : ""}`} onClick={onClick}>
      <div className="logo">{tool.initial}</div>
      <div className="body">
        <div className="title-row">
          <span className="name">{tool.name}</span>
          {featured && <span className="featured-tag">Featured</span>}
        </div>
        <div className="desc">{tool.desc}</div>
        <div className="badges-row">
          <PricingBadge value={tool.pricing} />
          <DeployBadge value={tool.deployment} />
          {tool.byok && <FlagBadge>BYOK</FlagBadge>}
          {tool.api && <FlagBadge>API</FlagBadge>}
        </div>
        <div className="row" style={{ gap: 14, marginTop: 4, flexWrap: "wrap" }}>
          <div className="tags">
            {tool.tags.slice(0, 4).map(t => <Tag key={t}>{t}</Tag>)}
          </div>
          {!compact && (
            <div className="meta">
              <span>by @{tool.addedBy}</span>
              <span className="sep" />
              <span>{tool.addedAt}</span>
              <span className="sep" />
              <span>{tool.reviews} reviews</span>
            </div>
          )}
        </div>
      </div>
      <div className="actions">
        <button className={`upvote ${upvoted ? "on" : ""}`} onClick={handleUp}>
          <IconArrowUp size={14} sw={2.2} />
          <span className="count">{(tool.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
        </button>
        <button className={`fav-btn ${faved ? "on" : ""}`} onClick={handleFav}>
          <IconBookmark size={14} fill={faved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function FilterCheckbox({ label, count, on, onClick }) {
  return (
    <div className={`filter-opt ${on ? "on" : ""}`} onClick={onClick}>
      <span className="checkbox" />
      <span className="label">{label}</span>
      {count != null && <span className="num">{count}</span>}
    </div>
  );
}

function FilterRail({ filters, setFilters }) {
  const toggle = (group, value) => {
    setFilters(f => {
      const set = new Set(f[group]);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...f, [group]: [...set] };
    });
  };
  const count = (group, val) => TOOLS.filter(t => {
    if (group === "pricing") return t.pricing === val;
    if (group === "deployment") return t.deployment === val;
    if (group === "access" && val === "BYOK") return t.byok;
    if (group === "access" && val === "API Available") return t.api;
    return false;
  }).length;

  return (
    <div className="filter-rail">
      <div className="filter-group">
        <div className="filter-title">Pricing</div>
        {PRICING.map(p => (
          <FilterCheckbox key={p} label={p} count={count("pricing", p)}
            on={filters.pricing.includes(p)} onClick={() => toggle("pricing", p)} />
        ))}
      </div>
      <div className="filter-group">
        <div className="filter-title">Deployment</div>
        {DEPLOYMENT.map(p => (
          <FilterCheckbox key={p} label={p} count={count("deployment", p)}
            on={filters.deployment.includes(p)} onClick={() => toggle("deployment", p)} />
        ))}
      </div>
      <div className="filter-group">
        <div className="filter-title">Access</div>
        {ACCESS.map(p => (
          <FilterCheckbox key={p} label={p} count={count("access", p)}
            on={filters.access.includes(p)} onClick={() => toggle("access", p)} />
        ))}
      </div>
      <div className="filter-group">
        <div className="filter-title">Popular Tags</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {POPULAR_TAGS.map(t => {
            const on = filters.tags.includes(t);
            return (
              <span key={t} onClick={() => toggle("tags", t)}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  background: on ? "var(--teal-soft)" : "var(--gray-50)",
                  color: on ? "var(--teal-2)" : "var(--text-2)",
                  border: "1px solid " + (on ? "transparent" : "var(--line)"),
                  fontWeight: on ? 500 : 400,
                }}>#{t}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty">
      <div className="icon">{icon || <IconSparkle size={22} />}</div>
      <div className="h">{title}</div>
      {body && <div className="p">{body}</div>}
      {action}
    </div>
  );
}

function SortBar({ sort, setSort, count, layout, setLayout }) {
  return (
    <div className="sort-bar">
      <div className="sort-tabs">
        {["Newest", "Top", "Trending"].map(s => (
          <div key={s} className={`sort-tab ${sort === s ? "active" : ""}`} onClick={() => setSort(s)}>
            {s === "Trending" && <IconFire size={13} />}
            {s}
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 16 }}>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          <span className="num" style={{ fontWeight: 600, color: "var(--text)" }}>{count}</span> tools
        </span>
        <div className="layout-toggle">
          <button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")}><IconList size={14} /></button>
          <button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")}><IconGrid size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function applyFilters(tools, filters, q) {
  return tools.filter(t => {
    if (filters.pricing.length && !filters.pricing.includes(t.pricing)) return false;
    if (filters.deployment.length && !filters.deployment.includes(t.deployment)) return false;
    if (filters.access.includes("BYOK") && !t.byok) return false;
    if (filters.access.includes("API Available") && !t.api) return false;
    if (filters.tags.length && !filters.tags.some(tag => t.tags.includes(tag))) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!t.name.toLowerCase().includes(s)
        && !t.desc.toLowerCase().includes(s)
        && !t.tags.some(tag => tag.includes(s))) return false;
    }
    return true;
  });
}

function AppliedChips({ filters, setFilters, q, setQ }) {
  const remove = (group, value) => setFilters(f => ({ ...f, [group]: f[group].filter(v => v !== value) }));
  const items = [];
  filters.pricing.forEach(p => items.push({ k: "pricing", v: p }));
  filters.deployment.forEach(p => items.push({ k: "deployment", v: p }));
  filters.access.forEach(p => items.push({ k: "access", v: p }));
  filters.tags.forEach(p => items.push({ k: "tags", v: "#" + p }));
  if (items.length === 0 && !q) return null;
  return (
    <div className="chips" style={{ marginBottom: 18 }}>
      {q && (
        <span className="chip">
          "{q}"
          <span className="x" onClick={() => setQ("")}><IconX size={11} /></span>
        </span>
      )}
      {items.map(({ k, v }, i) => (
        <span key={i} className="chip">
          {v}
          <span className="x" onClick={() => remove(k, v.replace(/^#/, ""))}><IconX size={11} /></span>
        </span>
      ))}
      <span className="chip clear" onClick={() => {
        setFilters({ pricing: [], deployment: [], access: [], tags: [] });
        setQ?.("");
      }}>Clear all</span>
    </div>
  );
}

Object.assign(window, {
  Badge, PricingBadge, DeployBadge, FlagBadge, TealBadge, Tag, ArrowOut,
  ToolCard, FilterRail, FilterCheckbox,
  EmptyState, SortBar, AppliedChips, applyFilters, PRICING_CLASS,
});
