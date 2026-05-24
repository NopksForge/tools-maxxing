// V2 Submit + FastDrop + LoginWall

function SubmitScreen({ user, navigate }) {
  const [name, setName] = React.useState("");
  const [homepage, setHomepage] = React.useState("");
  const [repo, setRepo] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [pricing, setPricing] = React.useState(null);
  const [deployment, setDeployment] = React.useState(null);
  const [byok, setByok] = React.useState(false);
  const [api, setApi] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState("");

  const dup = React.useMemo(() => {
    if (!homepage) return null;
    const h = homepage.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    return TOOLS.find(t => t.homepage && t.homepage.toLowerCase().includes(h.split(/[/.]/)[0]) && h.length > 4);
  }, [homepage]);

  if (!user) return <LoginWall navigate={navigate} reason="submit a tool" />;

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));
  const onTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    else if (e.key === "Backspace" && !tagInput && tags.length) { removeTag(tags[tags.length - 1]); }
  };
  const valid = name && homepage && desc && pricing && deployment;

  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="page" style={{ maxWidth: 880 }}>
        <div className="crumb">
          <span className="l" onClick={() => navigate("browse")}>Catalog</span>
          <span>/</span>
          <span>Submit</span>
        </div>
        <div className="eyebrow">Contribute · 01</div>
        <h1 className="h-1" style={{ marginTop: 18, marginBottom: 14 }}>
          Submit a tool to the catalog.
        </h1>
        <p className="lede" style={{ marginBottom: 48 }}>
          Add a GitHub repo, hosted product, or local model. Strict-category fields aren't free text — pick the closest match. You can refine it later.
        </p>

        <div className="form-grid">
          <div className="field">
            <div className="label">Name<span className="req"> *</span></div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Claude Code" />
          </div>

          <div className="field">
            <div className="label">Homepage URL<span className="req"> *</span></div>
            <input className="input" value={homepage} onChange={e => setHomepage(e.target.value)} placeholder="https://…" />
            {dup && (
              <div className="warn-inline">
                <IconLink size={14} sw={1.8} />
                <div>
                  <strong>This tool may already exist:</strong> {dup.name} at <span className="mono">{dup.homepage}</span>. {" "}
                  <a style={{ textDecoration: "underline", cursor: "pointer", color: "var(--teal-2)", fontWeight: 600 }} onClick={() => navigate("detail", { id: dup.id })}>View the existing entry →</a>
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <div className="label">Repository URL<span className="opt">optional</span></div>
            <input className="input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="https://github.com/…" />
          </div>

          <div className="field">
            <div className="label">Description<span className="req"> *</span></div>
            <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="One paragraph. What does it do? Who is it for?" />
            <div className="hint">{desc.length} / 280 characters · keep it scannable.</div>
          </div>

          <div className="field">
            <div className="label">Pricing<span className="req"> *</span></div>
            <div className="segmented">
              {PRICING.map(p => (
                <button key={p} className={pricing === p ? "on" : ""} onClick={() => setPricing(p)}>{p}</button>
              ))}
            </div>
            <div className="hint">Pick the closest match. Used for the prominent badge on every card.</div>
          </div>

          <div className="field">
            <div className="label">Deployment<span className="req"> *</span></div>
            <div className="segmented">
              {DEPLOYMENT.map(p => (
                <button key={p} className={deployment === p ? "on" : ""} onClick={() => setDeployment(p)}>{p}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <div className="label">Access</div>
            <div className="row" style={{ gap: 24 }}>
              <div className="toggle-row" onClick={() => setByok(!byok)}>
                <div className={`toggle ${byok ? "on" : ""}`} />
                <span>BYOK <span className="muted" style={{ fontSize: 12 }}>(bring-your-own-key)</span></span>
              </div>
              <div className="toggle-row" onClick={() => setApi(!api)}>
                <div className={`toggle ${api ? "on" : ""}`} />
                <span>API available</span>
              </div>
            </div>
          </div>

          <div className="field">
            <div className="label">Logo</div>
            <div style={{
              border: "1.5px dashed var(--line-strong)", borderRadius: "var(--r-md)", padding: 28,
              display: "flex", gap: 14, alignItems: "center", justifyContent: "center",
              color: "var(--text-2)", fontSize: 14, cursor: "pointer",
              background: "var(--gray-50)",
            }}>
              <IconUpload size={18} sw={1.8} /> Drop an image or click to upload · PNG/SVG · 256×256 recommended
            </div>
          </div>

          <div className="field">
            <div className="label">Tags</div>
            <div className="tag-input">
              {tags.map(t => {
                const isNew = !POPULAR_TAGS.includes(t);
                return (
                  <span key={t} className={`tag-pill ${isNew ? "new" : ""}`}>
                    #{t}{isNew && <span style={{ fontSize: 9, marginLeft: 4, fontWeight: 600, letterSpacing: "0.05em" }}>NEW</span>}
                    <span className="x" onClick={() => removeTag(t)}><IconX size={10} sw={2} /></span>
                  </span>
                );
              })}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey}
                placeholder={tags.length ? "" : "Add tags — press enter"} />
            </div>
            {tagInput && !POPULAR_TAGS.includes(tagInput) && !tags.includes(tagInput) && (
              <div className="hint">Press enter to <strong>create new tag</strong> #{tagInput}</div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 7).map(t => (
                <span key={t} onClick={() => addTag(t)}
                  style={{
                    fontSize: 12, padding: "3px 10px",
                    background: "var(--gray-50)", color: "var(--text-2)",
                    border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer",
                  }}>#{t}</span>
              ))}
            </div>
          </div>

          <div className="hr" style={{ margin: "16px 0" }} />

          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {valid ? "Ready to submit" : "Complete required fields to submit"}
            </span>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn secondary">Save draft</button>
              <button className="btn primary" disabled={!valid} onClick={() => { window.__showToast?.("Submitted! Add media next…"); }}>
                Submit & add media <ArrowOut />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FastDropScreen({ user, navigate }) {
  const [url, setUrl] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [queue, setQueue] = React.useState([
    { url: "github.com/sgl-project/sglang", status: "processed", at: "2h", name: "SGLang" },
    { url: "modal.com/llm-finetuning", status: "queued", at: "5h", name: null },
    { url: "exo-labs.github.io/exo", status: "queued", at: "1d", name: null },
  ]);

  if (!user) return <LoginWall navigate={navigate} reason="use Fast Drop" />;

  const drop = () => {
    if (!url) return;
    setQueue([{ url: url.replace(/^https?:\/\//, ""), status: "queued", at: "just now", name: null }, ...queue]);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setUrl(""); }, 2400);
  };

  return (
    <div className="fastdrop-shell">
      <div className="eyebrow" style={{ justifyContent: "center" }}>Contribute · 02 — fastest path</div>
      <h1 className="h-display" style={{ marginTop: 24, marginBottom: 18, fontSize: "clamp(56px, 7vw, 96px)" }}>
        Fast Drop.
      </h1>
      <p className="lede" style={{ margin: "0 auto 40px" }}>
        Paste a link. We'll fetch the metadata, dedupe, and queue it for review. You don't have to fill anything out.
      </p>

      {submitted ? (
        <div className="drop-success">
          <div className="check"><IconCheck size={20} sw={2.5} stroke="white" /></div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Got it.</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Queued for processing — we'll notify you when it's live.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="fastdrop-input-wrap">
            <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && drop()}
              placeholder="github.com/anthropics/claude-code · or · tool.dev/launch" autoFocus />
            <button className="btn primary" onClick={drop} disabled={!url} style={{ borderRadius: 8 }}>
              Drop it <ArrowOut />
            </button>
          </div>
          <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            Or press Enter. Works with any URL — repos, hosted apps, package pages.
          </div>
        </>
      )}

      <div className="dropped-list">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div className="eyebrow gray no-rule" style={{ paddingLeft: 0 }}>Your drops · {queue.length}</div>
        </div>
        {queue.map((q, i) => (
          <div key={i} className="dropped-row">
            <span className={`status ${q.status}`}>{q.status}</span>
            <div>
              <div className="url-text">{q.url}</div>
              {q.name && <div className="name-text">→ {q.name}</div>}
            </div>
            <span className="time">{q.at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginWall({ navigate, reason }) {
  return (
    <section className="section">
      <div className="page" style={{ maxWidth: 520, textAlign: "center", paddingTop: 64 }}>
        <div style={{ width: 64, height: 64, borderRadius: "var(--r-md)", background: "var(--gray-50)", border: "1px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 28px", color: "var(--text-2)" }}>
          <IconLock size={24} sw={1.6} />
        </div>
        <h1 className="h-2" style={{ marginBottom: 16 }}>
          Log in to {reason}.
        </h1>
        <p className="lede" style={{ margin: "0 auto 32px" }}>
          Contributing is members-only to keep the catalog real. Logging in takes a click — GitHub or Google.
        </p>
        <button className="btn primary lg" onClick={() => navigate("auth")}>
          Log in to continue <ArrowOut />
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { SubmitScreen, FastDropScreen, LoginWall });
