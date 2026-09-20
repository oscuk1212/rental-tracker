// Root app: wires theme, tweaks panel, routing, and the browser-frame shell.

const { useEffect: uEff } = React;

function App() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "accent":       "warm",
    "dark":         false,
    "baseCurrency": "USD",
    "usdToNgn":     1585,
    "showFrame":    true,
    "density":      "comfy"
  }/*EDITMODE-END*/);

  // Apply theme via CSS vars on the outer wrapper
  const accents = {
    warm:    { a: "#c26749", fg: "#fff" },   // terracotta
    slate:   { a: "#3b5876", fg: "#fff" },
    ink:     { a: "#111", fg: "#fff" },
    olive:   { a: "#5b6b3a", fg: "#fff" },
    plum:    { a: "#6b4066", fg: "#fff" },
  };
  const A = accents[tweaks.accent] || accents.warm;
  const dark = tweaks.dark;
  const themeVars = {
    "--accent":    A.a,
    "--accent-fg": A.fg,
    "--surface-0": dark ? "#0f1114" : "#faf9f7",
    "--surface-1": dark ? "#161a1f" : "#ffffff",
    "--surface-2": dark ? "#1e232a" : "#f2efea",
    "--fg-1":      dark ? "#e8e8ea" : "#1a1a1c",
    "--fg-2":      dark ? "#b6b8bc" : "#4a4a50",
    "--fg-3":      dark ? "#7c8088" : "#8a8a92",
    "--border":    dark ? "#282d34" : "#e7e3dc",
    "--good":      dark ? "#7cc499" : "#3d8f5f",
    "--bad":       dark ? "#e07a6d" : "#c74a3c",
    "--warn":      dark ? "#e0b467" : "#a37a1a",
    "--pill-bg":   dark ? "#252a31" : "#eeeae2",
    fontFamily: 'ui-sans-serif, "Inter var", "Segoe UI", -apple-system, sans-serif',
  };

  const { route, param, nav } = useStore();

  useEffect(() => {
    document.title = `Doorkeep · ${route}`;
  }, [route]);

  // Login has its own layout (no sidebar)
  if (route === "login") {
    const content = <LoginScreen />;
    return renderShell(content, tweaks, setTweak, themeVars, true);
  }

  const title = {
    dashboard:  { t: "Dashboard",  s: "Portfolio at a glance" },
    properties: { t: "Properties", s: `Manage your ${window.SEED_PROPERTIES.length} properties and their units` },
    property:   { t: "Property",   s: "Details, tenants and cash flow" },
    tenants:    { t: "Tenants",    s: "All leases and payment history" },
    tenant:     { t: "Tenant",     s: "Payment history and reminders" },
    income:     { t: "Income",     s: "Rent payments across all properties" },
    expenses:   { t: "Expenses",   s: "Mortgage, tax, insurance, repairs and more" },
    reports:    { t: "Reports",    s: "Period summaries, CSV & tax export" },
    settings:   { t: "Settings",   s: "Currency, FX rate, profile and notifications" },
    users:      { t: "Users & Roles", s: "Invite an accountant or property manager" },
    audit:      { t: "Audit log",  s: "Every create, edit, and delete — recorded" },
    docs:       { t: "Docs & Deploy Guide", s: "How to get your app online for free" },
  }[route] || { t: "Doorkeep", s: "" };

  let screen;
  switch (route) {
    case "dashboard":  screen = <DashboardScreen tweaks={tweaks} />; break;
    case "properties": screen = <PropertiesScreen tweaks={tweaks} />; break;
    case "property":   screen = <PropertyDetail tweaks={tweaks} />; break;
    case "tenants":    screen = <TenantsScreen tweaks={tweaks} />; break;
    case "tenant":     screen = <TenantDetail tweaks={tweaks} />; break;
    case "income":     screen = <IncomeScreen tweaks={tweaks} />; break;
    case "expenses":   screen = <ExpensesScreen tweaks={tweaks} />; break;
    case "reports":    screen = <ReportsScreen tweaks={tweaks} />; break;
    case "settings":   screen = <SettingsScreen tweaks={tweaks} setTweak={setTweak} />; break;
    case "users":      screen = <UsersScreen />; break;
    case "audit":      screen = <AuditScreen />; break;
    case "docs":       screen = <DocsScreen />; break;
    default: screen = <DashboardScreen tweaks={tweaks} />;
  }

  const topbarAction = (
    <>
      <Button variant="ghost" size="sm" onClick={() => nav("login")}>Sign out</Button>
    </>
  );

  const content = (
    <div style={{ display: "flex", height: "100%", background: "var(--surface-0)", color: "var(--fg-1)" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar title={title.t} subtitle={title.s} action={topbarAction} />
        <div style={{ flex: 1, overflow: "auto" }}>
          {screen}
        </div>
      </main>
    </div>
  );

  return renderShell(content, tweaks, setTweak, themeVars, false);
}

function renderShell(content, tweaks, setTweak, themeVars, isLogin) {
  const inner = (
    <div style={{ ...themeVars, height: "100%", width: "100%", background: "var(--surface-0)" }}>
      {content}
    </div>
  );

  const tweaksPanel = (
    <TweaksPanel>
      <TweakSection title="Theme">
        <TweakColor
          label="Accent"
          value={tweaks.accent}
          onChange={v => setTweak("accent", v)}
          options={[
            { value: "warm",  color: "#c26749", label: "Warm" },
            { value: "slate", color: "#3b5876", label: "Slate" },
            { value: "ink",   color: "#111111", label: "Ink" },
            { value: "olive", color: "#5b6b3a", label: "Olive" },
            { value: "plum",  color: "#6b4066", label: "Plum" },
          ]}
        />
        <TweakToggle label="Dark mode" value={tweaks.dark} onChange={v => setTweak("dark", v)} />
        <TweakToggle label="Show browser frame" value={tweaks.showFrame} onChange={v => setTweak("showFrame", v)} />
      </TweakSection>
      <TweakSection title="Currency">
        <TweakRadio
          label="Base reporting currency"
          value={tweaks.baseCurrency}
          onChange={v => setTweak("baseCurrency", v)}
          options={[
            { value: "USD", label: "USD" },
            { value: "NGN", label: "NGN" },
          ]}
        />
        <TweakSlider label="USD → NGN rate" min={800} max={2500} step={5} value={Number(tweaks.usdToNgn)} onChange={v => setTweak("usdToNgn", v)} />
      </TweakSection>
      <TweakSuggestionBar suggestions={[
        "Add a Tenant screen showing payment reliability score",
        "Make the dashboard chart a stacked area instead of bars",
        "Add a mobile phone frame alongside the browser view",
        "Add a receipts library screen with search",
        "Show mortgage principal vs interest split on property detail",
      ]} />
    </TweaksPanel>
  );

  if (!tweaks.showFrame) {
    return (
      <div style={{ position: "fixed", inset: 0 }}>
        {inner}
        {tweaksPanel}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tweaks.dark ? "#0a0b0d" : "#e7e3dc", padding: 24 }}>
      <ChromeWindow
        tabs={[{ title: "Doorkeep — Rental Tracker" }]}
        url={`doorkeep.vercel.app${(function() {
          const r = tweaks && window.__lastRoute; return "";
        })()}`}
        width={Math.min(1360, window.innerWidth - 48)}
        height={Math.min(860, window.innerHeight - 48)}
      >
        {inner}
      </ChromeWindow>
      {tweaksPanel}
    </div>
  );
}

// Root render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<StoreProvider><App /></StoreProvider>);
