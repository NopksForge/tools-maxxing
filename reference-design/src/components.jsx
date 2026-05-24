// Shared components: Badge, ToolCard, FilterRail, EmptyState, Skeleton

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

function Tag({ children, onClick }) {
  return <span className="tag" onClick={onClick}>{children}</span>;
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
    <div
      className={`card tool-card ${compact ? "compact" : ""} ${featured ? "featured" : ""}`}
      onClick={onClick}
    >
      {featured && <div className="featured-flag">Featured</div>}
      <div className="logo">{tool.initial}</div>
      <div className="body">
        <div className="title-row">
          <div className="name">{tool.name}</div>
          <PricingBadge value={tool.pricing} />
          <DeployBadge value={tool.deployment} />
          {tool.byok && <FlagBadge>BYOK</FlagBadge>}
          {tool.api && <FlagBadge>API</FlagBadge>}
        </div>
        <div className="desc">{tool.desc}</div>
        <div className="tags">
          {tool.tags.slice(0, 4).map(t => <Tag key={t}>{t}</Tag>)}
        </div>
        <div className="meta">
          <span>added by @{tool.addedBy}</span>
          <span>·</span>
          <span>{tool.addedAt}</span>
          {!compact && <>
            <span>·</span>
            <span>{tool.reviews} reviews</span>
            <span>·</span>
            <span>{tool.comments} comments</span>
          </>}
        </div>
      </div>
      <div className="actions">
        <button className={`upvote ${upvoted ? "on" : ""}`} onClick={handleUp}>
          <IconArrowUp size={14} sw={2} />
          <span className="count num">{(tool.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
        </button>
        <button className={`fav-btn ${faved ? "on" : ""}`} onClick={handleFav} title="Save to favorites">
          <IconBookmark size={14} fill={faved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function ToolCardSkeleton() {
  return (
    <div className="card tool-card">
      <div className="skel" style={{ width: 56, height: 56 }} />
      <div className="body">
        <div className="skel" style={{ width: 180, height: 20, marginBottom: 8 }} />
        <div className="skel" style={{ width: "92%", height: 12, marginBottom: 4 }} />
        <div className="skel" style={{ width: "78%", height: 12 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <div className="skel" style={{ width: 60, height: 14 }} />
          <div className="skel" style={{ width: 50, height: 14 }} />
        </div>
      </div>
      <div className="skel" style={{ width: 64, height: 56 }} />
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

function FilterRail({ filters, setFilters, tools = TOOLS }) {
  const toggle = (group, value) => {
    setFilters(f => {
      const set = new Set(f[group]);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...f, [group]: [...set] };
    });
  };
  const count = (group, val) => tools.filter(t => {
    if (group === "pricing") return t.pricing === val;
    if (group === "deployment") return t.deployment === val;
    if (group === "access" && val === "BYOK") return t.byok;
    if (group === "access" && val === "API Available") return t.api;
    return false;
  }).length;

  return (
    <div className="filter-rail">
      <div className="filter-group">
        <div className="filter-title">
          <span>Pricing</span>
          <span className="count num">{PRICING.length}</span>
        </div>
        {PRICING.map(p => (
          <FilterCheckbox key={p} label={p} count={count("pricing", p)}
            on={filters.pricing.includes(p)} onClick={() => toggle("pricing", p)} />
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-title">
          <span>Deployment</span>
          <span className="count num">{DEPLOYMENT.length}</span>
        </div>
        {DEPLOYMENT.map(p => (
          <FilterCheckbox key={p} label={p} count={count("deployment", p)}
            on={filters.deployment.includes(p)} onClick={() => toggle("deployment", p)} />
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-title">
          <span>Access</span>
          <span className="count num">{ACCESS.length}</span>
        </div>
        {ACCESS.map(p => (
          <FilterCheckbox key={p} label={p} count={count("access", p)}
            on={filters.access.includes(p)} onClick={() => toggle("access", p)} />
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-title">
          <span>Tags</span>
          <span className="count num">{POPULAR_TAGS.length}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {POPULAR_TAGS.map(t => (
            <span key={t}
              className={`tag ${filters.tags.includes(t) ? "" : ""}`}
              onClick={() => toggle("tags", t)}
              style={filters.tags.includes(t) ? { color: "var(--ink)", background: "var(--paper-2)", borderRadius: 2 } : {}}
            >{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty">
      <div className="icon">{icon || <IconSparkle size={24} />}</div>
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
            {s === "Trending" && <IconFire size={11} style={{ verticalAlign: -1, marginRight: 4 }} />}
            {s}
          </div>
        ))}
      </div>
      <div className="row">
        <span className="mono" style={{ fontSize: 11, color: "var(--mute)", marginRight: 12 }}>
          {count} tools
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
    <div className="chips" style={{ marginBottom: 14 }}>
      {q && (
        <span className="chip">
          q: "{q}"
          <span className="x" onClick={() => setQ("")}><IconX size={10} /></span>
        </span>
      )}
      {items.map(({ k, v }, i) => (
        <span key={i} className="chip">
          {v}
          <span className="x" onClick={() => remove(k, v.replace(/^#/, ""))}><IconX size={10} /></span>
        </span>
      ))}
      {(items.length > 0 || q) && (
        <span
          className="chip"
          style={{ background: "transparent", color: "var(--mute)", border: "1px dashed var(--line)" }}
          onClick={() => { setFilters({ pricing: [], deployment: [], access: [], tags: [] }); setQ?.(""); }}
        >
          clear all
        </span>
      )}
    </div>
  );
}

Object.assign(window, {
  Badge, PricingBadge, DeployBadge, FlagBadge, Tag,
  ToolCard, ToolCardSkeleton,
  FilterRail, FilterCheckbox,
  EmptyState, SortBar, AppliedChips, applyFilters,
  PRICING_CLASS,
});
