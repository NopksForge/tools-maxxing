// V2 App — router, toast, tweaks

const DEFAULT_USER = { name: "Ellie Reuter-Klein", handle: "ellie.rk", initial: "E" };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewerRole": "Member",
  "accent": "#389B9B",
  "density": "Comfy",
  "showHeroGraphic": true
}/*EDITMODE-END*/;

const ACCENT_OPTS = ["#389B9B", "#0A2E3F", "#7C3AED", "#E26F3E"];

function ToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    window.__showToast = (msg) => {
      const id = Math.random();
      setToasts(t => [...t, { id, msg }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
    };
  }, []);
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span className="ic"><IconCheck2 size={16} sw={2} /></span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [route, setRoute] = React.useState({ name: "browse", params: {} });
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ pricing: [], deployment: [], access: [], tags: [] });
  const [firstRun, setFirstRun] = React.useState(false);

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const isGuest = tweaks.viewerRole === "Guest";
  const user = isGuest ? null : DEFAULT_USER;

  React.useEffect(() => {
    document.documentElement.style.setProperty("--teal", tweaks.accent);
    // derive a hover by darkening modestly
    document.documentElement.style.setProperty("--teal-2", tweaks.accent);
  }, [tweaks.accent]);

  React.useEffect(() => {
    if (tweaks.density === "Dense") {
      document.body.style.fontSize = "14px";
    } else {
      document.body.style.fontSize = "";
    }
  }, [tweaks.density]);

  const navigate = (name, params = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const onSearch = (q) => {
    setQuery(q);
    navigate("search");
  };

  const isAuth = route.name === "auth";

  return (
    <div className="app" data-screen-label={routeLabel(route)}>
      {!isAuth && (
        <Nav
          route={route.name}
          navigate={navigate}
          query={query}
          setQuery={setQuery}
          user={user}
          onLogin={() => navigate("auth")}
          onLogout={() => { setTweak("viewerRole", "Guest"); navigate("browse"); window.__showToast?.("Logged out"); }}
          onSearch={onSearch}
        />
      )}

      {route.name === "browse" && (
        <BrowseScreen user={user} filters={filters} setFilters={setFilters} navigate={navigate} />
      )}
      {route.name === "search" && (
        <SearchScreen user={user} filters={filters} setFilters={setFilters} navigate={navigate} query={query} setQuery={setQuery} />
      )}
      {route.name === "detail" && (
        <DetailScreen id={route.params.id} user={user} navigate={navigate} />
      )}
      {route.name === "submit" && (
        <SubmitScreen user={user} navigate={navigate} />
      )}
      {route.name === "fastdrop" && (
        <FastDropScreen user={user} navigate={navigate} />
      )}
      {route.name === "profile" && (
        <ProfileScreen user={user} isOwn={true} navigate={navigate} />
      )}
      {route.name === "collections-mine" && (
        <CollectionsListScreen user={user} navigate={navigate} />
      )}
      {route.name === "collection" && (
        <CollectionDetailScreen id={route.params.id} user={user} navigate={navigate} />
      )}
      {route.name === "settings" && (
        <SettingsScreen user={user} navigate={navigate} />
      )}
      {route.name === "auth" && (
        <AuthScreen
          firstRun={firstRun} setFirstRun={setFirstRun}
          onLogin={() => {
            setTweak("viewerRole", "Member");
            setFirstRun(false);
            navigate("browse");
            window.__showToast?.("Logged in");
          }}
          navigate={navigate}
        />
      )}

      <ToastHost />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Viewer">
          <TweakRadio label="Role" value={tweaks.viewerRole} options={["Guest", "Member"]} onChange={v => setTweak("viewerRole", v)} />
        </TweakSection>
        <TweakSection title="Surface">
          <TweakColor label="Accent" value={tweaks.accent} options={ACCENT_OPTS} onChange={v => setTweak("accent", v)} />
          <TweakRadio label="Density" value={tweaks.density} options={["Comfy", "Dense"]} onChange={v => setTweak("density", v)} />
        </TweakSection>
        <TweakSection title="Jump to screen">
          <TweakSelect label="Screen" value={route.name}
            options={[
              "browse", "search", "detail",
              "submit", "fastdrop",
              "profile", "collections-mine", "collection",
              "settings", "auth",
            ]}
            onChange={v => navigate(v, v === "detail" ? { id: TOOLS[0].id } : v === "collection" ? { id: COLLECTIONS[0].id } : {})}
          />
          <TweakButton onClick={() => { setFirstRun(true); navigate("auth"); }}>Show first-run welcome</TweakButton>
          <TweakButton onClick={() => window.__showToast?.("This is a toast.")}>Fire a toast</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function routeLabel(r) {
  switch (r.name) {
    case "browse": return "01 Browse";
    case "search": return "02 Search";
    case "detail": return "03 Tool detail";
    case "submit": return "04 Submit";
    case "fastdrop": return "05 Fast drop";
    case "profile": return "06 Profile";
    case "collections-mine": return "07 Collections list";
    case "collection": return "08 Collection";
    case "settings": return "09 Settings";
    case "auth": return "10 Auth";
    default: return r.name;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
