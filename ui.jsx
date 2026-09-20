// Shared UI atoms + app-wide state store.
// Exposes global components: Icon, Pill, Card, Button, Input, Select, Money,
// Sidebar, Topbar, EmptyState, KPI, Table, Modal.

const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;

/* ---------- Store (very small, in-memory + localStorage-persisted) ---------- */
const StoreCtx = createContext(null);

function useStore() { return useContext(StoreCtx); }

function StoreProvider({ children }) {
  const [properties, setProperties] = useState(window.SEED_PROPERTIES);
  const [tenants, setTenants]       = useState(window.SEED_TENANTS);
  const [income, setIncome]         = useState(window.SEED_INCOME);
  const [expenses, setExpenses]     = useState(window.SEED_EXPENSES);
  const [users, setUsers]           = useState(window.SEED_USERS);
  const [audit, setAudit]           = useState(window.SEED_AUDIT);

  // Route: dashboard | properties | property | tenants | tenant | income | expenses | reports | settings | users | audit | docs | login
  const [route, setRoute]   = useState(() => localStorage.getItem("rt.route") || "dashboard");
  const [param, setParam]   = useState(() => localStorage.getItem("rt.param") || null);
  useEffect(() => { localStorage.setItem("rt.route", route); }, [route]);
  useEffect(() => { if (param) localStorage.setItem("rt.param", param); else localStorage.removeItem("rt.param"); }, [param]);

  const nav = (r, p = null) => { setRoute(r); setParam(p); };

  const value = {
    properties, setProperties, tenants, setTenants,
    income, setIncome, expenses, setExpenses,
    users, setUsers, audit, setAudit,
    route, param, nav,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/* ---------- FX helpers ---------- */
// SETTINGS lives in tweaks/localStorage. Base currency + FX table.
function convert(amount, from, to, rates) {
  if (from === to) return amount;
  // rates are relative to USD, e.g. { USD: 1, NGN: 1585, EUR: 0.92 }
  const usd = amount / (rates[from] || 1);
  return usd * (rates[to] || 1);
}
function fmt(amount, ccy) {
  const sym = window.CURRENCY_SYMBOL[ccy] || "";
  const rounded = Math.round(amount);
  const s = rounded.toLocaleString("en-US");
  return `${sym}${s}`;
}

/* ---------- Icons (inline SVG, stroke-only, minimal) ---------- */
function Icon({ name, size = 18, color = "currentColor", strokeWidth = 1.6 }) {
  const paths = {
    dashboard: "M3 12l9-8 9 8M5 10v10h14V10",
    building:  "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M8 9h3M8 13h3M8 17h3",
    users:     "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M17 3.13a4 4 0 0 1 0 7.75",
    income:    "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    expense:   "M5 12h14M19 12l-6-6M19 12l-6 6",
    report:    "M3 3v18h18M7 14l4-4 4 4 5-5",
    settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z",
    shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    log:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
    book:      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20",
    plus:      "M12 5v14M5 12h14",
    search:    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
    chevron:   "M9 6l6 6-6 6",
    chevronD:  "M6 9l6 6 6-6",
    close:     "M18 6L6 18M6 6l12 12",
    download:  "M12 3v12M7 10l5 5 5-5M5 21h14",
    filter:    "M22 3H2l8 9.46V19l4 2v-8.54z",
    check:     "M20 6L9 17l-5-5",
    edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
    trash:     "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
    whatsapp:  "M20 12a8 8 0 1 1-3.2-6.4L20 4l-1.6 3.2A8 8 0 0 1 20 12zM8 10c0 3 2 5 5 5l1-2-2-1-1 1c-1 0-2-1-2-2l1-1-1-2-2 1z",
    file:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
    upload:    "M12 15V3M7 8l5-5 5 5M5 21h14",
    external:  "M15 3h6v6M10 14L21 3M21 14v7H3V3h7",
    dot:       "",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{flexShrink:0}}>
      <path d={paths[name] || paths.dot} />
    </svg>
  );
}

/* ---------- Atoms ---------- */
function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "var(--pill-bg)", fg: "var(--fg-2)" },
    good:    { bg: "color-mix(in oklab, var(--good) 14%, transparent)", fg: "var(--good)" },
    warn:    { bg: "color-mix(in oklab, var(--warn) 16%, transparent)", fg: "var(--warn)" },
    bad:     { bg: "color-mix(in oklab, var(--bad) 14%, transparent)",  fg: "var(--bad)" },
    accent:  { bg: "color-mix(in oklab, var(--accent) 14%, transparent)", fg: "var(--accent)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 999, fontSize: 11.5,
      fontWeight: 500, letterSpacing: 0.1,
      background: t.bg, color: t.fg,
    }}>{children}</span>
  );
}

function Button({ children, variant = "primary", size = "md", icon, onClick, style, ...rest }) {
  const bases = {
    primary: { bg: "var(--accent)", fg: "var(--accent-fg)", border: "1px solid var(--accent)" },
    ghost:   { bg: "transparent", fg: "var(--fg-1)", border: "1px solid var(--border)" },
    soft:    { bg: "var(--surface-2)", fg: "var(--fg-1)", border: "1px solid var(--border)" },
    danger:  { bg: "transparent", fg: "var(--bad)", border: "1px solid color-mix(in oklab, var(--bad) 40%, var(--border))" },
    link:    { bg: "transparent", fg: "var(--accent)", border: "1px solid transparent" },
  };
  const b = bases[variant];
  const sizes = {
    sm: { padding: "5px 10px", fontSize: 12, borderRadius: 7 },
    md: { padding: "8px 14px", fontSize: 13, borderRadius: 8 },
    lg: { padding: "11px 18px", fontSize: 14, borderRadius: 10 },
  }[size];
  return (
    <button onClick={onClick} {...rest} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      background: b.bg, color: b.fg, border: b.border,
      fontFamily: "inherit", fontWeight: 500, cursor: "pointer",
      transition: "transform .04s ease, filter .1s ease",
      ...sizes, ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
    onMouseUp={e => e.currentTarget.style.transform = ""}
    onMouseLeave={e => e.currentTarget.style.transform = ""}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

function Input({ label, hint, ...rest }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
      {label && <span style={{ fontWeight: 500 }}>{label}</span>}
      <input {...rest} style={{
        padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
        background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
        fontFamily: "inherit", outline: "none", ...(rest.style || {}),
      }} />
      {hint && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{hint}</span>}
    </label>
  );
}

function Select({ label, options = [], value, onChange, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
      {label && <span style={{ fontWeight: 500 }}>{label}</span>}
      <select value={value} onChange={onChange} style={{
        padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
        background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
        fontFamily: "inherit", outline: "none", appearance: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2399a' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
        paddingRight: 30, ...style,
      }}>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Card({ title, subtitle, action, children, padding = 20, style }) {
  return (
    <section style={{
      background: "var(--surface-1)", border: "1px solid var(--border)",
      borderRadius: 12, overflow: "hidden", ...style,
    }}>
      {(title || action) && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `14px ${padding}px`, borderBottom: "1px solid var(--border)",
        }}>
          <div>
            {title && <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-1)" }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding }}>{children}</div>
    </section>
  );
}

function KPI({ label, value, sub, tone = "neutral" }) {
  const toneColor = { neutral: "var(--fg-1)", good: "var(--good)", bad: "var(--bad)", accent: "var(--accent)" }[tone];
  return (
    <div style={{
      background: "var(--surface-1)", border: "1px solid var(--border)",
      borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontSize: 11.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: toneColor, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--fg-3)" }}>{sub}</div>}
    </div>
  );
}

function Table({ columns, rows, empty = "No records", onRowClick }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{
                textAlign: c.align || "left", padding: "10px 14px",
                fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                textTransform: "uppercase", letterSpacing: 0.5,
                borderBottom: "1px solid var(--border)", background: "var(--surface-2)",
                whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 30, textAlign: "center", color: "var(--fg-3)" }}>{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.id || i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background .1s",
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
              {columns.map(c => (
                <td key={c.key} style={{
                  padding: "12px 14px", borderBottom: "1px solid var(--border)",
                  color: "var(--fg-1)", textAlign: c.align || "left",
                  fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
                  whiteSpace: c.wrap ? "normal" : "nowrap",
                }}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(15,17,22,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40,
      backdropFilter: "blur(2px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: "92%", maxHeight: "88%", overflow: "auto",
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: 14, boxShadow: "0 24px 60px rgba(0,0,0,.2)",
      }}>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--fg-2)", padding: 4, display: "flex",
          }}><Icon name="close" size={18} /></button>
        </header>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- Money display: original + converted ---------- */
function Money({ amount, from, tweaks, showBoth = true, mono = true }) {
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92, GBP: 0.78 };
  const converted = convert(amount, from, base, rates);
  return (
    <span style={{ fontVariantNumeric: mono ? "tabular-nums" : "normal" }}>
      {fmt(amount, from)}
      {showBoth && from !== base && (
        <span style={{ color: "var(--fg-3)", marginLeft: 6, fontSize: "0.85em" }}>
          ≈ {fmt(converted, base)}
        </span>
      )}
    </span>
  );
}

/* ---------- Sidebar + Topbar ---------- */
function Sidebar() {
  const { route, nav } = useStore();
  const items = [
    { key: "dashboard",  label: "Dashboard",   icon: "dashboard" },
    { key: "properties", label: "Properties",  icon: "building" },
    { key: "tenants",    label: "Tenants",     icon: "users" },
    { key: "income",     label: "Income",      icon: "income" },
    { key: "expenses",   label: "Expenses",    icon: "expense" },
    { key: "reports",    label: "Reports",     icon: "report" },
    { key: "__sep__" },
    { key: "settings",   label: "Settings",    icon: "settings" },
    { key: "users",      label: "Users & Roles", icon: "shield" },
    { key: "audit",      label: "Audit log",   icon: "log" },
    { key: "docs",       label: "Docs & Deploy", icon: "book" },
  ];
  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "var(--surface-1)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
      padding: "18px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px 18px" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-fg)",
        }}>
          <Icon name="building" size={15} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-1)" }}>Doorkeep</div>
      </div>
      {items.map(it => it.key === "__sep__"
        ? <div key="sep" style={{ height: 1, background: "var(--border)", margin: "10px 8px" }} />
        : (
          <button key={it.key} onClick={() => nav(it.key)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", background: route === it.key ? "var(--surface-2)" : "transparent",
            border: "none", borderRadius: 8, cursor: "pointer",
            color: route === it.key ? "var(--fg-1)" : "var(--fg-2)",
            fontSize: 13, fontWeight: route === it.key ? 500 : 400,
            fontFamily: "inherit", textAlign: "left", marginBottom: 2,
          }}>
            <Icon name={it.icon} size={16} color={route === it.key ? "var(--accent)" : "currentColor"} />
            {it.label}
          </button>
        )
      )}
      <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #d97757, #b3543a)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>YO</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-1)" }}>You</div>
          <div style={{ fontSize: 11, color: "var(--fg-3)" }}>Owner · Admin</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, subtitle, action }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 28px", borderBottom: "1px solid var(--border)",
      background: "var(--surface-0)",
    }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--fg-1)", letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {action}
      </div>
    </header>
  );
}

function EmptyState({ icon = "file", title, sub, action }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 24px", color: "var(--fg-3)",
    }}>
      <div style={{ display: "inline-flex", padding: 14, borderRadius: 12, background: "var(--surface-2)", marginBottom: 12 }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-2)", marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, marginBottom: 16 }}>{sub}</div>}
      {action}
    </div>
  );
}

Object.assign(window, {
  StoreProvider, useStore,
  Icon, Pill, Button, Input, Select, Card, KPI, Table, Modal, Money,
  Sidebar, Topbar, EmptyState, convert, fmt,
});
