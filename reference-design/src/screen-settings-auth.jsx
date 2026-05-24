// Settings + Auth.

function SettingsScreen({ user, navigate, onLogout }) {
  const [section, setSection] = React.useState("account");
  const [name, setName] = React.useState(user?.name || "Ellie Reuter-Klein");
  const [handle, setHandle] = React.useState(user?.handle || "ellie.rk");
  const [bio, setBio] = React.useState("Engineer, late-night tool-tester. I run a lot of local models and inflict opinions about them on the catalog.");
  const [prefs, setPrefs] = React.useState({
    weekly: true, replies: true, reviews: true, pinned: false, edits: true, marketing: false,
  });

  if (!user) return <LoginWall navigate={navigate} reason="open settings" />;

  return (
    <section className="page">
      <div className="eyebrow" style={{ marginBottom: 10 }}>Settings</div>
      <h1 className="display-i" style={{ fontSize: 56, lineHeight: 0.95, marginBottom: 28 }}>Your account</h1>

      <div className="set-grid">
        <div className="set-nav">
          {[
            ["account", "Account"],
            ["profile", "Profile"],
            ["connected", "Connected"],
            ["notifications", "Notifications"],
            ["danger", "Danger zone"],
          ].map(([k, label]) => (
            <a key={k} className={section === k ? "active" : ""} onClick={() => setSection(k)}>{label}</a>
          ))}
        </div>

        <div>
          {section === "account" && (
            <div className="set-card">
              <h3>Account</h3>
              <div className="sub">Basics that show up across the catalog.</div>
              <div className="field"><div className="label">Display name</div><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="field" style={{ marginTop: 14 }}><div className="label">Username</div>
                <input className="input" value={handle} onChange={e => setHandle(e.target.value)} />
                <div className="hint">Profile URL: toolsmaxxing.dev/@{handle}</div>
              </div>
              <div className="row" style={{ marginTop: 18, justifyContent: "flex-end" }}>
                <button className="btn primary" onClick={() => window.__showToast?.("Saved")}>Save</button>
              </div>
            </div>
          )}

          {section === "profile" && (
            <div className="set-card">
              <h3>Profile</h3>
              <div className="sub">How you show up to other members.</div>
              <div className="row" style={{ gap: 18, marginBottom: 14 }}>
                <div className="avatar lg" style={{ width: 72, height: 72, fontSize: 26 }}>{user.initial}</div>
                <div className="col" style={{ gap: 8 }}>
                  <button className="btn sm"><IconUpload size={11} /> Replace avatar</button>
                  <span className="hint">PNG or SVG · square, ≥256px</span>
                </div>
              </div>
              <div className="field"><div className="label">Bio</div>
                <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} />
                <div className="hint">{bio.length} / 240 characters</div>
              </div>
              <div className="row" style={{ marginTop: 18, justifyContent: "flex-end" }}>
                <button className="btn primary" onClick={() => window.__showToast?.("Profile updated")}>Save</button>
              </div>
            </div>
          )}

          {section === "connected" && (
            <div className="set-card">
              <h3>Connected accounts</h3>
              <div className="sub">We support OAuth via GitHub and Google. No passwords stored.</div>
              <div className="connect-row">
                <div className="left">
                  <div className="ic"><IconGithub size={18} /></div>
                  <div>
                    <div className="name">GitHub</div>
                    <div className="status on">Connected · @{handle}</div>
                  </div>
                </div>
                <button className="btn ghost sm">Disconnect</button>
              </div>
              <div className="connect-row">
                <div className="left">
                  <div className="ic">G</div>
                  <div>
                    <div className="name">Google</div>
                    <div className="status">Not connected</div>
                  </div>
                </div>
                <button className="btn sm">Connect</button>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="set-card">
              <h3>Notifications</h3>
              <div className="sub">Email + in-app delivery. Turn it down to taste.</div>
              {[
                ["weekly", "Weekly digest", "A Saturday summary of trending tools."],
                ["replies", "Replies to your comments", ""],
                ["reviews", "Reviews on your submitted tools", ""],
                ["pinned", "Your tool gets pinned / featured", ""],
                ["edits", "Suggested edits on your tools", ""],
                ["marketing", "Product announcements", "Rare — we promise."],
              ].map(([k, label, sub]) => (
                <div key={k} className="row" style={{ justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                    {sub && <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 2 }}>{sub}</div>}
                  </div>
                  <div className="toggle-row" onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))}>
                    <div className={`toggle ${prefs[k] ? "on" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "danger" && (
            <div className="set-card" style={{ borderColor: "var(--b-paid)" }}>
              <h3 style={{ color: "var(--b-paid)" }}>Danger zone</h3>
              <div className="sub">These actions are permanent.</div>
              <div className="row" style={{ justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Export your data</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>JSON dump of submissions, collections, comments.</div>
                </div>
                <button className="btn sm">Export</button>
              </div>
              <div className="row" style={{ justifyContent: "space-between", padding: "12px 0" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Delete account</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Permanently removes your profile, comments, and collections. Submissions remain attributed to "former member".</div>
                </div>
                <button className="btn sm" style={{ background: "var(--b-paid)", color: "white", borderColor: "var(--b-paid)" }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AuthScreen({ onLogin, navigate, firstRun, setFirstRun }) {
  const [pickingName, setPickingName] = React.useState(false);
  const [handle, setHandle] = React.useState("");

  if (firstRun) {
    return (
      <div className="auth-shell">
        <div className="auth-left">
          <div className="nav-logo">
            <span className="mark">Toolsmaxxing</span>
            <span className="tag">V1</span>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Welcome — one quick thing</div>
            <h1 className="display-i" style={{ fontSize: 56, lineHeight: 0.95, marginBottom: 16, color: "var(--ink)" }}>
              Pick a handle.
            </h1>
            <div style={{ color: "var(--ink-2)", maxWidth: 380, marginBottom: 28 }}>
              It's what you'll be known by in the catalog — on submissions, reviews, and collections. Lowercase, no spaces.
            </div>
            <div className="auth-form">
              <div className="row" style={{ alignItems: "stretch", gap: 0, border: "1px solid var(--line)", borderRadius: 4 }}>
                <span style={{ padding: "14px 12px", color: "var(--mute)", borderRight: "1px solid var(--line)", fontFamily: "var(--f-mono)", fontSize: 13 }}>toolsmaxxing.dev/@</span>
                <input className="input" style={{ border: 0, borderRadius: 0 }} value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} placeholder="your-handle" autoFocus />
              </div>
              <button className="btn primary lg" disabled={handle.length < 2} onClick={() => { setFirstRun(false); navigate("browse"); }}>
                Take me in <IconArrowRight size={14} />
              </button>
              <div className="hint">You can change this later in settings.</div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
            № 001 — by the community, for the community.
          </div>
        </div>
        <div className="auth-right">
          <div className="mono" style={{ fontSize: 11, color: "oklch(0.7 0.01 80)", letterSpacing: "0.14em", textTransform: "uppercase" }}>What you unlock</div>
          <ul style={{ listStyle: "none", padding: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 36, lineHeight: 1.15 }}>
            <li>Submit tools</li>
            <li>Save favorites</li>
            <li>Build collections</li>
            <li>Suggest edits</li>
            <li>Review &amp; comment</li>
          </ul>
          <div className="mono" style={{ fontSize: 11, color: "oklch(0.7 0.01 80)" }}>Earn reputation. Maybe unlock the Triage queue.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="nav-logo">
          <span className="mark">Toolsmaxxing</span>
          <span className="tag">V1</span>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Welcome back</div>
          <h1 className="display-i" style={{ fontSize: 56, lineHeight: 0.95, marginBottom: 16 }}>
            Log in to submit, save, and join the catalog.
          </h1>
          <div style={{ color: "var(--ink-2)", maxWidth: 380, marginBottom: 28 }}>
            Two providers. No passwords to forget. We don't sell your data — we don't even know your email if you don't tell us.
          </div>

          <div className="auth-form">
            <button className="oauth-btn" onClick={() => { setPickingName(true); }}>
              <IconGithub size={20} />
              Continue with GitHub
              <IconArrowRight className="arr" size={16} />
            </button>
            <button className="oauth-btn" onClick={() => { setPickingName(true); }}>
              <span className="ic" style={{
                background: "conic-gradient(from 0deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)",
                borderRadius: "50%",
              }} />
              Continue with Google
              <IconArrowRight className="arr" size={16} />
            </button>
          </div>

          <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 24, maxWidth: 360 }}>
            By logging in you accept the community guidelines. We use OAuth — no password storage on our side.
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>
            <span onClick={() => navigate("browse")} style={{ cursor: "pointer", textDecoration: "underline" }}>← Continue as guest</span>
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>v1.0</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="mono" style={{ fontSize: 11, color: "oklch(0.7 0.01 80)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Catalog № 001</div>
        <div>
          <h2 style={{ color: "var(--paper)" }}>
            Find the<br/>
            <em>one</em><br/>
            tool you<br/>
            were missing.
          </h2>
          <div style={{ color: "oklch(0.78 0.01 80)", maxWidth: 420, marginTop: 24, fontSize: 16 }}>
            {TOOLS.length * 17} tools indexed — every one with a strict pricing badge so you know what you're getting before you click.
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <PricingBadge value="Open Source" />
          <PricingBadge value="Freemium" />
          <PricingBadge value="Paid" />
          <PricingBadge value="Free" />
        </div>
      </div>

      {pickingName && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "grid", placeItems: "center", zIndex: 100 }} onClick={() => setPickingName(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="row" style={{ gap: 14, marginBottom: 16 }}>
                <div className="avatar" style={{ width: 40, height: 40, background: "var(--hot)" }}><IconCheck size={18} stroke="white" /></div>
                <div>
                  <div style={{ fontWeight: 500 }}>You're in.</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Authenticated via OAuth.</div>
                </div>
              </div>
              <button className="btn primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { setPickingName(false); onLogin(); }}>
                Continue <IconArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SettingsScreen, AuthScreen });
