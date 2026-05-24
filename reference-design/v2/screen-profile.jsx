// V2 Profile + Collections

function ProfileScreen({ user, navigate, profileUser, isOwn }) {
  const p = profileUser || user || { name: "Ellie Reuter-Klein", handle: "ellie.rk", initial: "E" };
  const [tab, setTab] = React.useState("submitted");

  const submittedTools = TOOLS.filter(t => t.addedBy === p.handle);
  const showTools = submittedTools.length ? submittedTools : TOOLS.slice(0, 4);
  const publicColls = COLLECTIONS.filter(c => isOwn || c.isPublic);

  return (
    <section className="section" style={{ paddingTop: 56 }}>
      <div className="page">
        <div className="profile-header">
          <div className="avatar lg">{p.initial}</div>
          <div>
            <div className="row" style={{ alignItems: "baseline", gap: 14 }}>
              <div className="profile-name">{p.name}</div>
              <div className="profile-handle">@{p.handle}</div>
            </div>
            <div className="profile-bio">Engineer, late-night tool-tester. I run a lot of local models and inflict opinions about them on the catalog.</div>
            <div className="profile-meta">
              <div><span className="v">Joined Jan 2025</span></div>
              <div><span className="v">1,284</span> reputation</div>
              <div><span className="v">{showTools.length}</span> tools submitted</div>
              <div><span className="v">{publicColls.length}</span> collections</div>
            </div>
          </div>
          <div className="col" style={{ gap: 10, alignItems: "flex-end" }}>
            {isOwn ? (
              <>
                <button className="btn secondary" onClick={() => navigate("settings")}><IconEdit size={13} sw={1.8} /> Edit profile</button>
                <button className="btn ghost"><IconShare size={13} sw={1.8} /> Share</button>
              </>
            ) : (
              <>
                <button className="btn primary"><IconPlus size={13} sw={2} /> Follow</button>
                <button className="btn ghost"><IconShare size={13} sw={1.8} /> Share</button>
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
              <EmptyState title="No submissions yet." body={isOwn ? "Add your first tool to the catalog." : "This user hasn't submitted any tools."}
                action={isOwn && <button className="btn primary" onClick={() => navigate("submit")}><IconPlus size={13} sw={2} /> Submit a tool</button>} />
            ) : showTools.map(t => (
              <ToolCard key={t.id} tool={t} onClick={() => navigate("detail", { id: t.id })} asGuest={false} />
            ))}
          </div>
        )}

        {tab === "collections" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {publicColls.map(c => (
              <div key={c.id} className="coll-card" onClick={() => navigate("collection", { id: c.id })}>
                <div className="title">
                  <span className="name">{c.name}</span>
                  {!c.isPublic && <span className="lock"><IconLock size={11} sw={1.8} /> PRIVATE</span>}
                </div>
                <div className="desc">{c.desc || "—"}</div>
                <div className="coll-thumbs">
                  {c.items.slice(0, 4).map(id => {
                    const t = TOOLS.find(x => x.id === id);
                    return <div key={id} className="coll-thumb">{t?.initial || "?"}</div>;
                  })}
                  {Array.from({ length: Math.max(0, 4 - c.items.length) }).map((_, i) => (
                    <div key={i} className="coll-thumb" style={{ opacity: 0.4 }}>·</div>
                  ))}
                </div>
                <div className="meta">
                  <span>{c.count} tools</span>
                  <span>·</span>
                  <span>updated 2d ago</span>
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
              <div key={i} className="row" style={{ justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{a.what}</span>
                <span className="muted" style={{ fontSize: 13 }}>{a.when}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionsListScreen({ user, navigate }) {
  const [creating, setCreating] = React.useState(false);
  if (!user) return <LoginWall navigate={navigate} reason="manage collections" />;

  return (
    <section className="section" style={{ paddingTop: 56 }}>
      <div className="page">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="eyebrow">Collections · yours</div>
            <h1 className="h-1" style={{ marginTop: 14 }}>My collections</h1>
          </div>
          <button className="btn primary" onClick={() => setCreating(true)}>
            <IconPlus size={13} sw={2} /> New collection
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginTop: 40 }}>
          {COLLECTIONS.map(c => (
            <div key={c.id} className="coll-card" onClick={() => navigate("collection", { id: c.id })}>
              <div className="title">
                <span className="name">{c.name}</span>
                <span className="lock">{c.isPublic ? "PUBLIC" : <><IconLock size={11} sw={1.8} /> PRIVATE</>}</span>
              </div>
              <div className="desc">{c.desc || "—"}</div>
              <div className="coll-thumbs">
                {c.items.slice(0, 4).map(id => {
                  const t = TOOLS.find(x => x.id === id);
                  return <div key={id} className="coll-thumb">{t?.initial || "?"}</div>;
                })}
                {Array.from({ length: Math.max(0, 4 - c.items.length) }).map((_, i) => (
                  <div key={i} className="coll-thumb" style={{ opacity: 0.4 }}>·</div>
                ))}
              </div>
              <div className="meta"><span>{c.count} tools</span><span>·</span><span>updated 2d ago</span></div>
            </div>
          ))}
          <div className="coll-card" style={{ borderStyle: "dashed", display: "grid", placeItems: "center", minHeight: 260, color: "var(--text-2)" }} onClick={() => setCreating(true)}>
            <div style={{ textAlign: "center" }}>
              <IconPlus size={28} sw={1.5} />
              <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>New collection</div>
            </div>
          </div>
        </div>

        {creating && (
          <div className="modal-overlay" onClick={() => setCreating(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="t">New collection</div>
                <span className="x" onClick={() => setCreating(false)}><IconX size={16} sw={1.8} /></span>
              </div>
              <div className="modal-body">
                <div className="field"><div className="label">Name</div><input className="input" placeholder="e.g. Daily-driver agents" autoFocus /></div>
                <div className="field" style={{ marginTop: 16 }}><div className="label">Description</div><textarea className="textarea" placeholder="Optional — what's the thread connecting these tools?" /></div>
                <div className="row" style={{ marginTop: 18, justifyContent: "space-between" }}>
                  <div className="toggle-row"><div className="toggle on" /><span>Public</span></div>
                  <div className="row" style={{ gap: 10 }}>
                    <button className="btn ghost" onClick={() => setCreating(false)}>Cancel</button>
                    <button className="btn primary" onClick={() => { setCreating(false); window.__showToast?.("Collection created"); }}>Create</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionDetailScreen({ id, user, navigate }) {
  const c = COLLECTIONS.find(x => x.id === id) || COLLECTIONS[0];
  const isOwner = !!user;
  const items = c.items.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);

  return (
    <section className="section" style={{ paddingTop: 56 }}>
      <div className="page">
        <div className="crumb">
          <span className="l" onClick={() => navigate("collections-mine")}>Collections</span>
          <span>/</span>
          <span>{c.name}</span>
        </div>

        <div className="row" style={{ alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 32, borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="eyebrow">{c.isPublic ? "Public collection" : "Private collection"} · by @ellie.rk</div>
            <h1 className="h-1" style={{ marginTop: 14, marginBottom: 14 }}>{c.name}</h1>
            {c.desc && <p className="lede">{c.desc}</p>}
          </div>
          <div className="col" style={{ gap: 10, alignItems: "flex-end" }}>
            <button className="btn secondary"><IconShare size={13} sw={1.8} /> Share</button>
            {isOwner ? (
              <button className="btn ghost"><IconEdit size={13} sw={1.8} /> Edit</button>
            ) : (
              <button className="btn primary"><IconBookmark size={13} sw={1.8} /> Save</button>
            )}
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", margin: "32px 0 18px" }}>
          <span className="muted" style={{ fontSize: 13 }}>{items.length} tools · {isOwner ? "drag to reorder" : "shareable link"}</span>
          {isOwner && <button className="btn secondary sm"><IconPlus size={12} sw={2} /> Add tool</button>}
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="An empty shelf."
            body="No tools here yet. Browse the catalog and add the ones worth keeping together."
            action={<button className="btn primary" onClick={() => navigate("browse")}>Browse the catalog <ArrowOut /></button>}
          />
        ) : (
          <div className="feed">
            {items.map((t, i) => (
              <div key={t.id} style={{ position: "relative" }}>
                <span className="muted" style={{ position: "absolute", left: -32, top: 28, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                <ToolCard tool={t} onClick={() => navigate("detail", { id: t.id })} asGuest={!user} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { ProfileScreen, CollectionsListScreen, CollectionDetailScreen });
