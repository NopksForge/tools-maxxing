// Submit and Fast Drop screens.

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

  // duplicate detection: if homepage matches a known tool
  const dup = React.useMemo(() => {
    if (!homepage) return null;
    const h = homepage.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    return TOOLS.find(t => t.homepage && t.homepage.toLowerCase().includes(h.split(/[/.]/)[0]) && h.length > 4);
  }, [homepage]);

  if (!user) {
    return <LoginWall navigate={navigate} reason="submit a tool" />;
  }

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const onTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const valid = name && homepage && desc && pricing && deployment;

  return (
    <section className="page">
      <div className="eyebrow" style={{ marginBottom: 12 }}>Contribute / 01</div>
      <h1 className="display-i" style={{ fontSize: 64, lineHeight: 0.95, marginBottom: 8 }}>
        Submit a tool
      </h1>
      <div style={{ color: "var(--ink-2)", fontSize: 16, maxWidth: 560, marginBottom: 36 }}>
        Add a GitHub repo, hosted product, or local model to the catalog. Strict-category fields aren't free text — pick the closest match. We can edit it later.
      </div>

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
              <IconLink size={14} />
              <div>
                <strong>This tool may already exist:</strong> <span className="mono">{dup.name}</span> at {dup.homepage}.{" "}
                <a style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("detail", { id: dup.id })}>View the existing entry →</a>
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <div className="label">Repository URL <span style={{ color: "var(--mute)" }}>(optional)</span></div>
          <input className="input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="https://github.com/…" />
        </div>

        <div className="field">
          <div className="label">Description<span className="req"> *</span></div>
          <textarea className="textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="One paragraph. What does it do? Who's it for?" />
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
          <div className="row" style={{ gap: 16 }}>
            <div className="toggle-row" onClick={() => setByok(!byok)}>
              <div className={`toggle ${byok ? "on" : ""}`} />
              <span>BYOK <span className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>bring-your-own-key</span></span>
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
            border: "1px dashed var(--line)", borderRadius: 3, padding: 24,
            display: "flex", gap: 14, alignItems: "center", justifyContent: "center",
            color: "var(--mute)", fontSize: 13, cursor: "pointer",
          }}>
            <IconUpload size={16} /> Drop an image or click to upload · PNG/SVG · 256×256 recommended
          </div>
        </div>

        <div className="field">
          <div className="label">Tags</div>
          <div className="tag-input">
            {tags.map(t => {
              const isNew = !POPULAR_TAGS.includes(t);
              return (
                <span key={t} className={`tag-pill ${isNew ? "new" : ""}`}>
                  #{t}
                  {isNew && <span style={{ fontSize: 9, marginLeft: 4 }}>NEW</span>}
                  <span className="x" onClick={() => removeTag(t)}><IconX size={10} /></span>
                </span>
              );
            })}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey}
              placeholder={tags.length ? "" : "Add tags — press enter"} />
          </div>
          {tagInput && !POPULAR_TAGS.includes(tagInput) && !tags.includes(tagInput) && (
            <div className="hint">
              Press enter to <strong>create new tag</strong> <span className="mono">#{tagInput}</span>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 7).map(t => (
              <span key={t} className="tag" onClick={() => addTag(t)} style={{ cursor: "pointer" }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="hr" style={{ margin: "8px 0" }} />

        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
            {valid ? "Ready to submit" : "Missing required fields"}
          </span>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost">Save draft</button>
            <button className="btn primary" disabled={!valid} onClick={() => { window.__showToast?.("Submitted! Now upload media…"); }}>
              Submit & add media <IconArrowRight size={12} />
            </button>
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
      <div className="eyebrow" style={{ marginBottom: 16 }}>Contribute / 02 — fastest path</div>
      <h1 className="display-i" style={{ fontSize: 72, lineHeight: 0.95, marginBottom: 16 }}>
        Fast Drop.
      </h1>
      <div style={{ color: "var(--ink-2)", fontSize: 16, maxWidth: 480, margin: "0 auto 32px" }}>
        Paste a link. We'll handle the rest — fetch the metadata, dedupe, and queue it for review. You don't have to fill anything out.
      </div>

      {submitted ? (
        <div className="drop-success">
          <div className="check"><IconCheck size={20} stroke="white" /></div>
          <div>
            <div style={{ color: "white", fontWeight: 500, marginBottom: 2 }}>Got it.</div>
            <div style={{ opacity: 0.7 }}>Queued for processing — we'll notify you when it's live.</div>
          </div>
        </div>
      ) : (
        <>
          <input
            className="fastdrop-input"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && drop()}
            placeholder="github.com/anthropics/claude-code   or   tool.dev/launch"
            autoFocus
          />
          <div className="row" style={{ justifyContent: "center", marginTop: 14, gap: 12 }}>
            <button className="btn primary lg" onClick={drop} disabled={!url}>
              Drop it <IconArrowRight size={14} />
            </button>
            <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>or press Enter</span>
          </div>
        </>
      )}

      <div className="dropped-list">
        <div className="sec" style={{ marginTop: 56 }}>
          <span className="label">Your drops</span>
          <span className="rule" />
          <span className="num">{queue.length}</span>
        </div>
        {queue.map((q, i) => (
          <div key={i} className="dropped-row">
            <span className={`status ${q.status}`}>{q.status}</span>
            <div>
              <div style={{ color: "var(--ink)" }}>{q.url}</div>
              {q.name && <div className="mono" style={{ color: "var(--mute)", fontSize: 10, marginTop: 2 }}>→ {q.name}</div>}
            </div>
            <span style={{ color: "var(--mute)" }}>{q.at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginWall({ navigate, reason }) {
  return (
    <section className="page">
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
          <IconLock size={24} />
        </div>
        <h1 className="display-i" style={{ fontSize: 48, lineHeight: 0.95, marginBottom: 12 }}>
          Log in to {reason}.
        </h1>
        <div style={{ color: "var(--ink-2)", marginBottom: 28 }}>
          Contributing is members-only to keep the catalog real. Logging in takes a click — we use GitHub or Google.
        </div>
        <button className="btn primary lg" onClick={() => navigate("auth")}>
          Log in to continue <IconArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { SubmitScreen, FastDropScreen, LoginWall });
