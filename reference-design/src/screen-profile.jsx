// Profile + Collections screens.

function ProfileScreen({ user, navigate, profileUser, isOwn }) {
  const p = profileUser || user || { name: "Ellie Reuter-Klein", handle: "ellie.rk", initial: "E", bio: "Engineer, late-night tool-tester. I run a lot of local models and inflict opinions about them on the catalog.", joined: "Joined Jan 2025", rep: 1284, submitted: 11, collections: 4 };
  const [tab, setTab] = React.useState("submitted");

  const submittedTools = TOOLS.filter(t => t.addedBy === p.handle);
  const showTools = submittedTools.length ? submittedTools : TOOLS.slice(0, 4);
  const publicColls = COLLECTIONS.filter(c => isOwn || c.isPublic);

  return (
    <section className="page">
      <div className="profile-header">
        <div className="avatar lg">{p.initial}</div>
        <div>
          <h1 className="profile-name">{p.name}</h1>
          <div className="profile-handle">@{p.handle}</div>
          <div className="profile-bio">{p.bio}</div>
          <div className="profile-meta">
            <div><span className="v">{p.joined || "Joined Jan 2025"}</span></div>
            <div><span className="v">{p.rep || 1284}</span> reputation</div>
            <div><span className="v">{showTools.length}</span> tools submitted</div>
            <div><span className="v">{publicColls.length}</span> collections</div>
          </div>
        </div>
        <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
          {isOwn ? (
            <>
              <button className="btn" onClick={() => navigate("settings")}><IconEdit size={12} /> Edit profile</button>
              <button className="btn ghost"><IconShare size={12} /> Share profile</button>
            </>
          ) : (
            <>
              <button className="btn primary"><IconPlus size={12} /> Follow</button>
              <button className="btn ghost"><IconShare size={12} /> Share</button>
            </>
          )}
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === "submitted" ? "active" : ""}`} onClick={() => setTab("submitted")}>
          Submitted<span className="num">{showTools.length}</span>
        </div>
        <div className={`tab ${tab === "collections" ? "active" : ""}`} onClick={() => setTab("collections")}>
          Collections<span className="num">{publicColls.length}</span>
        </div>
        {isOwn && (
          <div className={`tab ${tab === "activity" ? "active" : ""}`} onClick={() => setTab("activity")}>
            Activity
          </div>
        )}
      </div>

      {tab === "submitted" && (
        <div className="feed">
          {showTools.length === 0 ? (
            <EmptyState title="No submissions yet" body={isOwn ? "Add your first tool to the catalog." : "This user hasn't submitted any tools."}
              action={isOwn && <button className="btn primary" onClick={() => navigate("submit")}><IconPlus size={12} /> Submit a tool</button>} />
          ) : showTools.map(t => (
            <ToolCard key={t.id} tool={t} onClick={() => navigate("detail", { id: t.id })} asGuest={!user} />
          ))}
        </div>
      )}

      {tab === "collections" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {publicColls.map(c => (
            <div key={c.id} className="coll-card" onClick={() => navigate("collection", { id: c.id })}>
              <div className="title">
                <span className="name">{c.name}</span>
                {!c.isPublic && <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}><IconLock size={10} /></span>}
              </div>
              {c.desc && <div className="desc">{c.desc}</div>}
              <div className="coll-thumbs">
                {c.items.slice(0, 4).map(id => {
                  const t = TOOLS.find(x => x.id === id);
                  return <div key={id} className="coll-thumb">{t?.initial || "?"}</div>;
                })}
                {Array.from({ length: Math.max(0, 4 - c.items.length) }).map((_, i) => (
                  <div key={i} className="coll-thumb" style={{ background: "transparent", color: "var(--mute-2)" }}>·</div>
                ))}
              </div>
              <div className="meta">
                <span>{c.count} tools</span>
                <span>·</span>
                <span>{c.isPublic ? "public" : "private"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="col" style={{ gap: 0 }}>
          {[
            { what: "Upvoted Cursor", when: "2h ago" },
            { what: "Reviewed Ollama (★★★★★)", when: "yesterday" },
            { what: "Created collection 'My local stack'", when: "3 days ago" },
            { what: "Submitted Claude Code to the catalog", when: "2 weeks ago" },
            { what: "Added Llamafile to My local stack", when: "3 weeks ago" },
          ].map((a, i) => (
            <div key={i} className="row" style={{ justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line-2)" }}>
              <span>{a.what}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{a.when}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CollectionsListScreen({ user, navigate }) {
  const [creating, setCreating] = React.useState(false);
  if (!user) return <LoginWall navigate={navigate} reason="manage collections" />;

  return (
    <section className="page">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--ink)", paddingBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Collections / yours</div>
          <h1 className="display-i" style={{ fontSize: 56, lineHeight: 0.95 }}>My collections</h1>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>
          <IconPlus size={12} /> New collection
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 32 }}>
        {COLLECTIONS.map(c => (
          <div key={c.id} className="coll-card" onClick={() => navigate("collection", { id: c.id })}>
            <div className="title">
              <span className="name">{c.name}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
                {c.isPublic ? "PUBLIC" : <><IconLock size={10} /> PRIVATE</>}
              </span>
            </div>
            {c.desc && <div className="desc">{c.desc}</div>}
            <div className="coll-thumbs">
              {c.items.slice(0, 4).map(id => {
                const t = TOOLS.find(x => x.id === id);
                return <div key={id} className="coll-thumb">{t?.initial || "?"}</div>;
              })}
              {Array.from({ length: Math.max(0, 4 - c.items.length) }).map((_, i) => (
                <div key={i} className="coll-thumb" style={{ background: "transparent", color: "var(--mute-2)" }}>·</div>
              ))}
            </div>
            <div className="meta">
              <span>{c.count} tools</span><span>·</span><span>updated 2d ago</span>
            </div>
          </div>
        ))}
        <div className="coll-card" style={{ borderStyle: "dashed", display: "grid", placeItems: "center", minHeight: 240, color: "var(--mute)" }} onClick={() => setCreating(true)}>
          <div style={{ textAlign: "center" }}>
            <IconPlus size={24} />
            <div className="mono" style={{ fontSize: 11, marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>New collection</div>
          </div>
        </div>
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="t">New collection</div>
              <span className="x" onClick={() => setCreating(false)}><IconX size={16} /></span>
            </div>
            <div className="modal-body">
              <div className="field"><div className="label">Name</div><input className="input" placeholder="e.g. Daily-driver agents" autoFocus /></div>
              <div className="field" style={{ marginTop: 14 }}><div className="label">Description</div><textarea className="textarea" placeholder="Optional — what's the thread connecting these tools?" /></div>
              <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                <div className="toggle-row"><div className="toggle on" /><span>Public</span></div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn ghost" onClick={() => setCreating(false)}>Cancel</button>
                  <button className="btn primary" onClick={() => { setCreating(false); window.__showToast?.("Collection created"); }}>Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CollectionDetailScreen({ id, user, navigate }) {
  const c = COLLECTIONS.find(x => x.id === id) || COLLECTIONS[0];
  const isOwner = !!user;
  const items = c.items.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  const showEmpty = items.length === 0;

  return (
    <section className="page">
      <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginBottom: 18 }}>
        <span onClick={() => navigate("collections-mine")} style={{ cursor: "pointer" }}>← Collections</span>
      </div>

      <div className="row" style={{ alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid var(--ink)", paddingBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {c.isPublic ? "Public collection" : "Private collection"} · by @ellie.rk
          </div>
          <h1 className="display-i" style={{ fontSize: 64, lineHeight: 0.95, marginBottom: 12 }}>{c.name}</h1>
          {c.desc && <div style={{ color: "var(--ink-2)", maxWidth: 600, fontSize: 16 }}>{c.desc}</div>}
        </div>
        <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
          <button className="btn"><IconShare size={12} /> Share</button>
          {isOwner ? (
            <button className="btn ghost"><IconEdit size={12} /> Edit</button>
          ) : (
            <button className="btn primary"><IconBookmark size={12} /> Save</button>
          )}
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 22, marginBottom: 14 }}>
        <span className="eyebrow">{items.length} tools · {isOwner ? "drag to reorder" : "shareable"}</span>
        {isOwner && <button className="btn sm"><IconPlus size={11} /> Add tool</button>}
      </div>

      {showEmpty ? (
        <EmptyState
          title="An empty shelf."
          body="No tools here yet. Browse the catalog and add the ones worth keeping together."
          action={<button className="btn primary" onClick={() => navigate("browse")}>Browse the catalog <IconArrowRight size={12} /></button>}
        />
      ) : (
        <div className="feed">
          {items.map((t, i) => (
            <div key={t.id} style={{ position: "relative" }}>
              <span className="mono" style={{ position: "absolute", left: -28, top: 20, fontSize: 11, color: "var(--mute)" }}>{String(i + 1).padStart(2, "0")}</span>
              <ToolCard tool={t} onClick={() => navigate("detail", { id: t.id })} asGuest={!user} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

Object.assign(window, { ProfileScreen, CollectionsListScreen, CollectionDetailScreen });
