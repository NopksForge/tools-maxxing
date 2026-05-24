// V2 Settings + Auth

function SettingsScreen({ user, navigate }) {
  const [section, setSection] = React.useState("account");
  const [name, setName] = React.useState(user?.name || "Ellie Reuter-Klein");
  const [handle, setHandle] = React.useState(user?.handle || "ellie.rk");
  const [bio, setBio] = React.useState("Engineer, late-night tool-tester. I run a lot of local models and inflict opinions about them on the catalog.");
  const [prefs, setPrefs] = React.useState({
    weekly: true, replies: true, reviews: true, pinned: false, edits: true, marketing: false,
  });

  if (!user) return <LoginWall navigate={navigate} reason="open settings" />;

  return (
    <section className="section" style={{ paddingTop: 56 }}>
      <div className="page">
        <div className="eyebrow">Settings</div>
        <h1 className="h-1" style={{ marginTop: 14, marginBottom: 40 }}>Your account</h1>

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
                <div className="field" style={{ marginTop: 16 }}>
                  <div className="label">Username</div>
                  <input className="input" value={handle} onChange={e => setHandle(e.target.value)} />
                  <div className="hint">Profile URL: <span className="mono">toolsmaxxing.dev/@{handle}</span></div>
                </div>
                <div className="row" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                  <button className="btn primary" onClick={() => window.__showToast?.("Saved")}>Save changes</button>
                </div>
              </div>
            )}

            {section === "profile" && (
              <div className="set-card">
                <h3>Profile</h3>
                <div className="sub">How you show up to other members.</div>
                <div className="row" style={{ gap: 20, marginBottom: 18 }}>
                  <div className="avatar lg" style={{ width: 72, height: 72, fontSize: 28 }}>{user.initial}</div>
                  <div className="col" style={{ gap: 8 }}>
                    <button className="btn secondary sm"><IconUpload size={12} sw={1.8} /> Replace avatar</button>
                    <span className="hint">PNG or SVG · square, ≥256px</span>
                  </div>
                </div>
                <div className="field">
                  <div className="label">Bio</div>
                  <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} />
                  <div className="hint">{bio.length} / 240 characters</div>
                </div>
                <div className="row" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                  <button className="btn primary" onClick={() => window.__showToast?.("Profile updated")}>Save changes</button>
                </div>
              </div>
            )}

            {section === "connected" && (
              <div className="set-card">
                <h3>Connected accounts</h3>
                <div className="sub">We support OAuth via GitHub and Google. No passwords stored.</div>
                <div className="connect-row">
                  <div className="left">
                    <div className="ic"><IconGithub size={18} sw={1.8} /></div>
                    <div>
                      <div className="name">GitHub</div>
                      <div className="status on">Connected · @{handle}</div>
                    </div>
                  </div>
                  <button className="btn secondary sm">Disconnect</button>
                </div>
                <div className="connect-row">
                  <div className="left">
                    <div className="ic" style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>G</div>
                    <div>
                      <div className="name">Google</div>
                      <div className="status">Not connected</div>
                    </div>
                  </div>
                  <button className="btn primary sm">Connect</button>
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
                  ["pinned", "Your tool gets pinned or featured", ""],
                  ["edits", "Suggested edits on your tools", ""],
                  ["marketing", "Product announcements", "Rare — we promise."],
                ].map(([k, label, sub]) => (
                  <div key={k} className="row" style={{ justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                      {sub && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
                    </div>
                    <div className="toggle-row" onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))}>
                      <div className={`toggle ${prefs[k] ? "on" : ""}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section === "danger" && (
              <div className="set-card" style={{ borderColor: "var(--danger)" }}>
                <h3 style={{ color: "var(--danger)" }}>Danger zone</h3>
                <div className="sub">These actions are permanent.</div>
                <div className="row" style={{ justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Export your data</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>JSON dump of submissions, collections, comments.</div>
                  </div>
                  <button className="btn secondary sm">Export</button>
                </div>
                <div className="row" style={{ justifyContent: "space-between", padding: "14px 0" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Delete account</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Permanently removes your profile, comments, and collections. Submissions remain attributed to "former member".</div>
                  </div>
                  <button className="btn sm" style={{ background: "var(--danger)", color: "white" }}>Delete</button>
                </div>
              </div>
            )}
          </div>
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
          <div className="nav-logo" onClick={() => navigate("browse")}>
            <div className="logo-mark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="logo-word">Toolsmaxxing</span>
          </div>
          <div>
            <div className="eyebrow">Welcome — one quick thing</div>
            <h1 className="h-1" style={{ marginTop: 18, marginBottom: 18 }}>Pick a handle.</h1>
            <p className="lede" style={{ marginBottom: 28 }}>
              It's what you'll be known by in the catalog — on submissions, reviews, and collections. Lowercase, no spaces.
            </p>
            <div className="auth-form">
              <div className="combo-input">
                <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} placeholder="your-handle" autoFocus />
                <button className="btn primary" disabled={handle.length < 2} onClick={() => { setFirstRun(false); navigate("browse"); }}>
                  Take me in <ArrowOut />
                </button>
              </div>
              <div className="hint">Profile URL will be <strong className="mono">toolsmaxxing.dev/@{handle || "—"}</strong>. You can change this later in settings.</div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>№ 001 — by the community, for the community.</div>
        </div>
        <div className="auth-right">
          <div className="bg-art" />
          <div style={{ position: "relative" }}>
            <div className="eyebrow no-rule" style={{ color: "var(--teal-3)" }}>What you unlock</div>
          </div>
          <div style={{ position: "relative" }}>
            <h2>
              Submit tools.<br />
              Save favorites.<br />
              Build <span className="teal">collections</span>.<br />
              Review &amp; comment.
            </h2>
            <p style={{ color: "rgba(240, 244, 246, 0.7)", maxWidth: 420, marginTop: 28, fontSize: 16 }}>
              Earn reputation. Unlock the triage queue. Help the catalog stay real.
            </p>
          </div>
          <div className="muted" style={{ position: "relative", color: "rgba(240, 244, 246, 0.5)", fontSize: 12 }}>Toolsmaxxing v1.0</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="nav-logo" onClick={() => navigate("browse")}>
          <div className="logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-word">Toolsmaxxing</span>
        </div>

        <div>
          <div className="eyebrow">Welcome back</div>
          <h1 className="h-1" style={{ marginTop: 18, marginBottom: 18 }}>
            Log in to submit, save,<br /> and join the catalog.
          </h1>
          <p className="lede" style={{ marginBottom: 32 }}>
            Two providers. No passwords to forget. We don't sell your data — we don't even know your email if you don't tell us.
          </p>

          <div className="auth-form">
            <button className="oauth-btn" onClick={() => setPickingName(true)}>
              <IconGithub size={20} sw={1.7} />
              <span>Continue with GitHub</span>
              <ArrowOut className="arr" size={14} />
            </button>
            <button className="oauth-btn" onClick={() => setPickingName(true)}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "conic-gradient(from 0deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)" }} />
              <span>Continue with Google</span>
              <ArrowOut className="arr" size={14} />
            </button>
          </div>

          <div className="muted" style={{ fontSize: 12, marginTop: 28, maxWidth: 380, lineHeight: 1.6 }}>
            By logging in you accept the community guidelines. We use OAuth — no password storage on our side.
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="muted" style={{ fontSize: 13 }}>
            <a onClick={() => navigate("browse")} style={{ cursor: "pointer", color: "var(--text-2)" }}>← Continue as guest</a>
          </span>
          <span className="muted" style={{ fontSize: 12 }}>v1.0</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="bg-art" />
        <div style={{ position: "relative" }}>
          <div className="eyebrow no-rule" style={{ color: "var(--teal-3)" }}>Catalog № 001</div>
        </div>
        <div style={{ position: "relative" }}>
          <h2>
            Find the <span className="teal">one tool</span><br />
            you were missing.
          </h2>
          <p style={{ color: "rgba(240, 244, 246, 0.72)", maxWidth: 460, marginTop: 28, fontSize: 18 }}>
            {(TOOLS.length * 17).toLocaleString()} tools indexed — every one with a strict pricing badge so you know what you're getting before you click.
          </p>
        </div>
        <div className="row" style={{ position: "relative", gap: 8, flexWrap: "wrap" }}>
          <PricingBadge value="Open Source" />
          <PricingBadge value="Freemium" />
          <PricingBadge value="Paid" />
          <PricingBadge value="Free" />
        </div>
      </div>

      {pickingName && (
        <div className="modal-overlay" onClick={() => setPickingName(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ paddingTop: 26 }}>
              <div className="row" style={{ gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, background: "var(--teal-soft)", borderRadius: "var(--r-md)", display: "grid", placeItems: "center", color: "var(--teal)" }}>
                  <IconCheck size={20} sw={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>You're in.</div>
                  <div className="muted" style={{ fontSize: 12 }}>Authenticated via OAuth.</div>
                </div>
              </div>
              <button className="btn primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { setPickingName(false); onLogin(); }}>
                Continue <ArrowOut />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SettingsScreen, AuthScreen });
