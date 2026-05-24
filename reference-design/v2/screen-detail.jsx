// V2 detail screen

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
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="page">
        <div className="crumb">
          <span className="l" onClick={() => navigate("browse")}>Catalog</span>
          <span>/</span>
          <span>{tool.name}</span>
        </div>

        <div className="detail-header">
          <div className="detail-logo">{tool.initial}</div>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <PricingBadge value={tool.pricing} />
              <DeployBadge value={tool.deployment} />
              {tool.byok && <FlagBadge>BYOK</FlagBadge>}
              {tool.api && <FlagBadge>API Available</FlagBadge>}
              {tool.featured && <TealBadge>Featured</TealBadge>}
            </div>
            <h1 className="detail-title">{tool.name}</h1>
            <p className="detail-subtitle">{tool.desc}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              {tool.tags.map(t => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
          <div className="detail-actions">
            <div className="row" style={{ gap: 6 }}>
              <button className={`upvote ${upvoted ? "on" : ""}`} onClick={guestLock(() => setUpvoted(v => !v))} style={{ padding: "12px 18px" }}>
                <IconArrowUp size={14} sw={2.2} />
                <span className="count">{(tool.upvotes + (upvoted ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button className={`fav-btn ${faved ? "on" : ""}`} onClick={guestLock(() => setFaved(v => !v))} style={{ padding: "12px 12px" }}>
                <IconBookmark size={16} fill={faved ? "currentColor" : "none"} />
              </button>
            </div>
            <button className="btn primary" onClick={() => window.open("#", "_blank")}>
              Visit homepage <ArrowOut />
            </button>
            <button className="btn secondary" onClick={guestLock(() => setShowAddCol(true))}>
              <IconPlus size={13} sw={2} /> Add to collection
            </button>
            <button className="btn ghost" onClick={guestLock(() => setShowEdit(true))}>
              <IconEdit size={13} sw={1.8} /> Suggest an edit
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <div className="tabs">
              {[["about", null], ["media", 6], ["reviews", tool.reviews], ["comments", tool.comments]].map(([t, n]) => (
                <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {n != null && <span className="num">{n}</span>}
                </div>
              ))}
            </div>

            {tab === "about" && (
              <div>
                <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--text)", maxWidth: "62ch" }}>
                  {tool.desc} It works equally well for one-off questions and for long-running, multi-step tasks where you want an AI collaborator that holds its place across a session.
                </p>
                <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--text-2)", maxWidth: "62ch", marginTop: 18 }}>
                  Most users come to {tool.name} for {tool.tags.slice(0, 2).join(" and ")} — see the most common use cases in unedited member reviews below.
                </p>

                <div style={{ marginTop: 48 }}>
                  <div className="eyebrow gray" style={{ marginBottom: 14 }}>Media · preview</div>
                  <div className="gallery">
                    <div className="media">screenshot · terminal</div>
                    <div className="media">screenshot · diff view</div>
                    <div className="media">
                      demo · 2:14
                      <div className="play"><div className="dot">▶</div></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 48 }}>
                  <div className="eyebrow gray" style={{ marginBottom: 14 }}>From reviews</div>
                  {REVIEWS.slice(0, 2).map((r, i) => <ReviewItem key={i} r={r} />)}
                  <button className="btn ghost" style={{ marginTop: 18 }} onClick={() => setTab("reviews")}>
                    See all {tool.reviews} reviews <ArrowOut />
                  </button>
                </div>
              </div>
            )}

            {tab === "media" && (
              <div>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
                  <span className="muted" style={{ fontSize: 13 }}>6 media items · contributed by 4 members</span>
                  {user && <button className="btn secondary sm"><IconUpload size={12} sw={1.8} /> Add media</button>}
                </div>
                <div className="gallery">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="media" style={{ aspectRatio: "16 / 10" }}>
                      {i % 3 === 0 ? "video" : "screenshot"} · {i + 1}
                      {i % 3 === 0 && <div className="play"><div className="dot">▶</div></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "reviews" && (
              <div>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 28, alignItems: "flex-start" }}>
                  <div>
                    <div className="mega-num n" style={{ fontSize: 64, lineHeight: 1 }}>4.6</div>
                    <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                      {tool.reviews} reviews · <span style={{ color: "var(--teal)" }}>★★★★★</span> 9 · ★★★★ 4 · ★★★ 1
                    </div>
                  </div>
                  <button className="btn primary" onClick={guestLock(() => window.__showToast?.("Review composer opened"))}>
                    <IconEdit size={13} sw={1.8} /> Write a review
                  </button>
                </div>
                {!user && (
                  <div className="info-inline" style={{ marginBottom: 18 }}>
                    <IconLock size={14} sw={1.8} />
                    <div><strong>Log in</strong> to rate this tool or write a review.</div>
                  </div>
                )}
                {REVIEWS.map((r, i) => <ReviewItem key={i} r={r} />)}
              </div>
            )}

            {tab === "comments" && (
              <div>
                {user ? (
                  <div style={{ marginBottom: 24 }}>
                    <textarea className="textarea" placeholder="Add a comment…" />
                    <div className="row" style={{ justifyContent: "flex-end", marginTop: 10 }}>
                      <button className="btn primary">Post comment</button>
                    </div>
                  </div>
                ) : (
                  <div className="info-inline" style={{ marginBottom: 18 }}>
                    <IconLock size={14} sw={1.8} />
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

          <aside className="col" style={{ gap: 20 }}>
            <div className="aside-card">
              <div className="title">Links</div>
              <a className="link-row">
                <span className="row" style={{ gap: 10 }}><IconGlobe size={14} sw={1.8} /> Homepage</span>
                <span className="url">{tool.homepage} <IconExternal size={10} sw={1.8} /></span>
              </a>
              {tool.repo && (
                <a className="link-row">
                  <span className="row" style={{ gap: 10 }}><IconGithub size={14} sw={1.8} /> Repository</span>
                  <span className="url">{tool.repo.replace("github.com/", "")} <IconExternal size={10} sw={1.8} /></span>
                </a>
              )}
            </div>

            <div className="aside-card">
              <div className="title">Specs</div>
              <div className="kv-row"><span className="k">Pricing</span><span><PricingBadge value={tool.pricing} /></span></div>
              <div className="kv-row"><span className="k">Deployment</span><span><DeployBadge value={tool.deployment} /></span></div>
              <div className="kv-row"><span className="k">BYOK</span><span>{tool.byok ? "Supported" : "—"}</span></div>
              <div className="kv-row"><span className="k">API</span><span>{tool.api ? "Available" : "—"}</span></div>
              <div className="kv-row"><span className="k">Added</span><span style={{ fontSize: 13 }}>{tool.addedAt} by <strong>@{tool.addedBy}</strong></span></div>
            </div>

            <div className="aside-card" style={{ background: "var(--navy)", color: "white", border: 0 }}>
              <div className="title" style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Activity · 30d</div>
              <div className="row" style={{ gap: 22, alignItems: "flex-end", marginTop: 14 }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, color: "white" }}>{tool.upvotes.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>upvotes</div>
                </div>
                <svg viewBox="0 0 100 32" preserveAspectRatio="none" style={{ flex: 1, height: 32 }}>
                  <path d="M0,24 L10,22 L20,18 L30,20 L40,14 L50,16 L60,10 L70,12 L80,6 L90,8 L100,2" fill="none" stroke="var(--teal-3)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="aside-card">
              <div className="title">Also try</div>
              <div className="col" style={{ gap: 12 }}>
                {TOOLS.filter(t => t.id !== tool.id && t.tags.some(x => tool.tags.includes(x))).slice(0, 3).map(t => (
                  <div key={t.id} className="row" style={{ gap: 12, cursor: "pointer" }} onClick={() => navigate("detail", { id: t.id })}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: "white", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14 }}>{t.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>↑ {t.upvotes.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAddCol && <AddToCollectionModal onClose={() => setShowAddCol(false)} toolName={tool.name} />}
      {showEdit && <SuggestEditModal onClose={() => setShowEdit(false)} tool={tool} />}
    </section>
  );
}

function ReviewItem({ r }) {
  return (
    <div className="review">
      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{r.avatar}</div>
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
          <span className="x" onClick={onClose}><IconX size={16} sw={1.8} /></span>
        </div>
        <div className="modal-body">
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Adding <strong style={{ color: "var(--text)" }}>{toolName}</strong> to:
          </div>
          <div className="col" style={{ gap: 8 }}>
            {COLLECTIONS.map(c => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "14px 16px", border: "1px solid var(--line)", borderRadius: "var(--r-md)", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--line-strong)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
                onClick={() => { window.__showToast?.(`Added to ${c.name}`); onClose(); }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.count} tools · {c.isPublic ? "public" : "private"}</div>
                </div>
                <IconPlus size={14} sw={2} />
              </div>
            ))}
          </div>
          <div className="hr" style={{ margin: "20px 0" }} />
          <button className="btn primary" style={{ width: "100%", justifyContent: "center" }}>
            <IconPlus size={13} sw={2} /> Create new collection
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
          <span className="x" onClick={onClose}><IconX size={16} sw={1.8} /></span>
        </div>
        <div className="modal-body">
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Propose a change to <strong style={{ color: "var(--text)" }}>{tool.name}</strong>. The submitter reviews and approves.
          </div>
          <div className="field">
            <div className="label">Description</div>
            <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="hint">{desc.length} characters · diff will be shown to the reviewer.</div>
          </div>
          {changed && (
            <div className="info-inline" style={{ marginTop: 14 }}>
              <IconEdit size={14} sw={1.8} />
              <div>You're proposing changes. The current owner @{tool.addedBy} will be notified.</div>
            </div>
          )}
          <div className="row" style={{ marginTop: 20, gap: 10, justifyContent: "flex-end" }}>
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
