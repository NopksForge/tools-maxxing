// Tool detail page.

function DetailScreen({ id, user, navigate }) {
  const tool = TOOLS.find(t => t.id === id) || TOOLS[0];
  const [upvoted, setUpvoted] = React.useState(false);
  const [faved, setFaved] = React.useState(false);
  const [tab, setTab] = React.useState("about");
  const [showAddCol, setShowAddCol] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  const guestLock = (fn) => () => {
    if (!user) { window.__showToast?.("Log in to engage"); return; }
    fn();
  };

  return (
    <section className="page">
      <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginBottom: 18 }}>
        <span onClick={() => navigate("browse")} style={{ cursor: "pointer" }}>← Catalog</span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>{tool.name}</span>
        {tool.featured && <FlagBadge style={{ marginLeft: 12 }}>Featured</FlagBadge>}
      </div>

      <div className="detail-header">
        <div className="detail-logo">{tool.initial}</div>
        <div>
          <h1 className="detail-title">{tool.name}</h1>
          <div className="detail-subtitle">{tool.desc}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <PricingBadge value={tool.pricing} />
            <DeployBadge value={tool.deployment} />
            {tool.byok && <FlagBadge>BYOK</FlagBadge>}
            {tool.api && <FlagBadge>API Available</FlagBadge>}
            {tool.tags.map(t => <Tag key={t}>{t}</Tag>)}
          </div>
        </div>
        <div className="detail-actions">
          <div className="row" style={{ gap: 6 }}>
            <button className={`upvote ${upvoted ? "on" : ""}`} onClick={guestLock(() => setUpvoted(v => !v))}>
              <IconArrowUp size={14} sw={2} />
              <span className="count num">{(tool.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
            </button>
            <button className={`fav-btn ${faved ? "on" : ""}`} onClick={guestLock(() => setFaved(v => !v))}
              style={{ padding: "12px 10px" }}>
              <IconBookmark size={16} fill={faved ? "currentColor" : "none"} />
            </button>
          </div>
          <button className="btn" onClick={guestLock(() => setShowAddCol(true))}>
            <IconPlus size={12} /> Add to collection
          </button>
          <button className="btn ghost" onClick={guestLock(() => setShowEdit(true))}>
            <IconEdit size={12} /> Suggest an edit
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="tabs">
            {["about", "media", "reviews", "comments"].map(t => (
              <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
                {t === "reviews" && <span className="num">{tool.reviews}</span>}
                {t === "comments" && <span className="num">{tool.comments}</span>}
                {t === "media" && <span className="num">6</span>}
              </div>
            ))}
          </div>

          {tab === "about" && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Overview</div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 680, marginTop: 0 }}>
                {tool.desc} It works equally well for one-off questions and for long-running, multi-step tasks where you want an AI collaborator that holds its place across a session.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 680 }}>
                Most users come to {tool.name} for {tool.tags.slice(0, 2).join(" and ")} — the community's most common use cases below are unedited from member reviews.
              </p>

              <div className="sec">
                <span className="label">Media</span><span className="rule" />
                <span className="num">preview</span>
              </div>
              <div className="gallery">
                <div className="media">[ screenshot — terminal ]</div>
                <div className="media">[ screenshot — diff view ]</div>
                <div className="media">
                  [ demo video ]
                  <div className="play"><div className="dot">▶</div></div>
                </div>
              </div>

              <div className="sec">
                <span className="label">From reviews</span><span className="rule" />
                <span className="num">{REVIEWS.length}</span>
              </div>
              {REVIEWS.slice(0, 2).map((r, i) => (
                <ReviewItem key={i} r={r} />
              ))}
              <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setTab("reviews")}>
                See all {tool.reviews} reviews <IconArrowRight size={12} />
              </button>
            </div>
          )}

          {tab === "media" && (
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
                <span className="eyebrow">6 media items · contributed by 4 users</span>
                {user && <button className="btn sm"><IconUpload size={11} /> Add media</button>}
              </div>
              <div className="gallery" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="media" style={{ aspectRatio: "16/10" }}>
                    [ {i % 3 === 0 ? "video" : "screenshot"} — {i + 1} ]
                    {i % 3 === 0 && <div className="play"><div className="dot">▶</div></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div className="display-i" style={{ fontSize: 36, color: "var(--ink)" }}>4.6</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
                    {REVIEWS.length} reviews · ★★★★★ 9, ★★★★ 4, ★★★ 1
                  </div>
                </div>
                <button className="btn primary" onClick={guestLock(() => window.__showToast?.("Review composer opened"))}>
                  <IconEdit size={12} /> Write a review
                </button>
              </div>
              {!user && (
                <div className="warn-inline" style={{ marginBottom: 14 }}>
                  <IconLock size={14} />
                  <div><strong>Log in</strong> to write a review or rate this tool.</div>
                </div>
              )}
              {REVIEWS.map((r, i) => <ReviewItem key={i} r={r} />)}
            </div>
          )}

          {tab === "comments" && (
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
                <span className="eyebrow">{tool.comments} comments · threaded</span>
              </div>
              {user ? (
                <div style={{ marginBottom: 18 }}>
                  <textarea className="textarea" placeholder="Add a comment…" />
                  <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
                    <button className="btn primary">Post comment</button>
                  </div>
                </div>
              ) : (
                <div className="warn-inline" style={{ marginBottom: 14 }}>
                  <IconLock size={14} />
                  <div><strong>Log in</strong> to join the discussion.</div>
                </div>
              )}
              {COMMENTS.map(c => (
                <div key={c.id} className="comment">
                  <div className="comment-head">
                    <span className="name">@{c.author}</span>
                    <span className="meta">{c.date}</span>
                  </div>
                  <div className="comment-body">{c.body}</div>
                  {c.replies && c.replies.map((r, i) => (
                    <div key={i} className="comment-reply">
                      <div className="comment-head">
                        <span className="name">@{r.author}</span>
                        <span className="meta">{r.date}</span>
                      </div>
                      <div className="comment-body">{r.body}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="col" style={{ gap: 18 }}>
          <div className="aside-card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Links</div>
            <a className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-2)" }}>
              <span className="row" style={{ gap: 8 }}><IconGlobe size={14} /> Homepage</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{tool.homepage} <IconExternal size={10} /></span>
            </a>
            {tool.repo && (
              <a className="row" style={{ justifyContent: "space-between", padding: "8px 0" }}>
                <span className="row" style={{ gap: 8 }}><IconGithub size={14} /> Repository</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{tool.repo.replace("github.com/", "")} <IconExternal size={10} /></span>
              </a>
            )}
          </div>

          <div className="aside-card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Specs</div>
            <div className="kv-row"><span className="k">Pricing</span><span className="v"><PricingBadge value={tool.pricing} /></span></div>
            <div className="kv-row"><span className="k">Deployment</span><span className="v"><DeployBadge value={tool.deployment} /></span></div>
            <div className="kv-row"><span className="k">BYOK</span><span className="v">{tool.byok ? "Supported" : "—"}</span></div>
            <div className="kv-row"><span className="k">API</span><span className="v">{tool.api ? "Available" : "—"}</span></div>
            <div className="kv-row" style={{ borderBottom: 0 }}><span className="k">Added</span><span className="v">{tool.addedAt} by <span className="mono" style={{ fontSize: 11 }}>@{tool.addedBy}</span></span></div>
          </div>

          <div className="aside-card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {tool.tags.map(t => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>

          <div className="aside-card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Also try</div>
            <div className="col" style={{ gap: 10 }}>
              {TOOLS.filter(t => t.id !== tool.id && t.tags.some(x => tool.tags.includes(x))).slice(0, 3).map(t => (
                <div key={t.id} style={{ cursor: "pointer" }} onClick={() => navigate("detail", { id: t.id })}>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 3, background: "var(--paper-2)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontStyle: "italic" }}>{t.initial}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>↑ {t.upvotes.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {showAddCol && (
        <AddToCollectionModal onClose={() => setShowAddCol(false)} toolName={tool.name} />
      )}
      {showEdit && (
        <SuggestEditModal onClose={() => setShowEdit(false)} tool={tool} />
      )}
    </section>
  );
}

function ReviewItem({ r }) {
  return (
    <div className="review">
      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{r.avatar}</div>
      <div>
        <div className="author">
          <span className="name">@{r.author}</span>
          <span className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ opacity: i < r.rating ? 1 : 0.2 }}>★</span>
            ))}
          </span>
          <span className="date">{r.date}</span>
        </div>
        <div className="body">{r.body}</div>
      </div>
    </div>
  );
}

function AddToCollectionModal({ onClose, toolName }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="t">Add to collection</div>
          <span className="x" onClick={onClose}><IconX size={16} /></span>
        </div>
        <div className="modal-body">
          <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginBottom: 14 }}>
            Adding <span style={{ color: "var(--ink)" }}>{toolName}</span> to:
          </div>
          <div className="col" style={{ gap: 6 }}>
            {COLLECTIONS.map(c => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 3, cursor: "pointer" }}
                onClick={() => { window.__showToast?.(`Added to ${c.name}`); onClose(); }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{c.count} tools · {c.isPublic ? "public" : "private"}</div>
                </div>
                <IconPlus size={14} />
              </div>
            ))}
          </div>
          <div className="hr-ink" style={{ background: "var(--line)", margin: "16px 0" }} />
          <button className="btn primary" style={{ width: "100%", justifyContent: "center" }}>
            <IconPlus size={12} /> Create new collection
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestEditModal({ onClose, tool }) {
  const [desc, setDesc] = React.useState(tool.desc);
  const changed = desc !== tool.desc;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="t">Suggest an edit</div>
          <span className="x" onClick={onClose}><IconX size={16} /></span>
        </div>
        <div className="modal-body">
          <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginBottom: 14 }}>
            Propose a change to <span style={{ color: "var(--ink)" }}>{tool.name}</span>. The submitter reviews and approves.
          </div>
          <div className="field">
            <div className="label">Description</div>
            <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="hint">{desc.length} characters · diff will be shown to the reviewer.</div>
          </div>
          {changed && (
            <div className="warn-inline" style={{ marginTop: 12 }}>
              <IconEdit size={14} />
              <div>You're proposing changes. The current owner @{tool.addedBy} will be notified.</div>
            </div>
          )}
          <div className="row" style={{ marginTop: 18, gap: 8, justifyContent: "flex-end" }}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={!changed} onClick={() => { window.__showToast?.("Edit submitted for review"); onClose(); }}>
              Submit edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen, ReviewItem, AddToCollectionModal, SuggestEditModal });
