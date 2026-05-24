// Top nav. Includes search, avatar dropdown, notifications.

function Nav({ route, navigate, query, setQuery, user, onLogin, onLogout, onSearch }) {
  const [showNotif, setShowNotif] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [notifs, setNotifs] = React.useState(NOTIFICATIONS);
  const unread = notifs.filter(n => !n.read).length;

  const close = () => { setShowNotif(false); setShowMenu(false); };
  React.useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest(".nav-auth")) close();
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      onSearch?.(e.target.value);
    }
  };

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate("browse")} style={{ cursor: "pointer" }}>
        <span className="mark">Toolsmaxxing</span>
        <span className="tag">V1</span>
      </div>
      <div className="nav-search">
        <span className="ic"><IconSearch size={16} /></span>
        <input
          placeholder="Search tools, tags, or paste a URL…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
        />
        <span className="kbd">⌘K</span>
      </div>
      <div className="row">
        <div className="nav-links">
          <div className={`nav-link ${route === "browse" ? "active" : ""}`} onClick={() => navigate("browse")}>Browse</div>
          <div className={`nav-link ${route === "collections-mine" ? "active" : ""}`} onClick={() => navigate("collections-mine")}>Collections</div>
          <div className={`nav-link ${route === "submit" ? "active" : ""}`} onClick={() => navigate("submit")}>Submit</div>
          <div className={`nav-link ${route === "fastdrop" ? "active" : ""}`} onClick={() => navigate("fastdrop")}>Fast Drop</div>
        </div>
        <div className="nav-auth" style={{ position: "relative" }}>
          {user ? (
            <>
              <button className="bell-btn" onClick={(e) => { e.stopPropagation(); setShowNotif(v => !v); setShowMenu(false); }}>
                <IconBell size={18} />
                {unread > 0 && <span className="bell-dot" />}
              </button>
              {showNotif && (
                <div className="notif-panel" onClick={e => e.stopPropagation()}>
                  <div className="notif-head">
                    <div className="t">Notifications</div>
                    <div className="mark" onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}>
                      Mark all read
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifs.map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? "read" : ""}`} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <div className="dot" />
                        <div>
                          <div className="body">{n.body}</div>
                          <div className="meta">{n.meta} ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="avatar" onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); setShowNotif(false); }}>
                {user.initial}
              </div>
              {showMenu && (
                <div className="avatar-menu" onClick={e => e.stopPropagation()}>
                  <div className="head">
                    <div className="avatar" style={{ width: 36, height: 36 }}>{user.initial}</div>
                    <div>
                      <div className="name">{user.name}</div>
                      <div className="handle">@{user.handle}</div>
                    </div>
                  </div>
                  <a onClick={() => { navigate("profile"); close(); }}><IconUser size={14} /> Profile</a>
                  <a onClick={() => { navigate("collections-mine"); close(); }}><IconBookmark size={14} /> My collections</a>
                  <a onClick={() => { navigate("profile", { tab: "submitted" }); close(); }}><IconUpload size={14} /> My submissions</a>
                  <a onClick={() => { navigate("settings"); close(); }}><IconCog size={14} /> Settings</a>
                  <div className="sep" />
                  <a className="danger" onClick={() => { onLogout(); close(); }}><IconLogout size={14} /> Log out</a>
                </div>
              )}
            </>
          ) : (
            <button className="btn-login" onClick={onLogin}>Log in</button>
          )}
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { Nav });
