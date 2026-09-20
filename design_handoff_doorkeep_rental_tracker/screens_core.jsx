// Dashboard · Properties (list + detail) · Tenants (list + detail)

const { useState: uState1, useMemo: uMemo1 } = React;

/* =========================================================
   DASHBOARD
   ========================================================= */
function DashboardScreen({ tweaks }) {
  const { properties, tenants, income, expenses, nav } = useStore();
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };
  const base = tweaks.baseCurrency;

  const totalIncome  = income.reduce((s, i) => s + convert(i.amount, i.currency, base, rates), 0);
  const totalExpense = expenses.reduce((s, e) => s + convert(e.amount, e.currency, base, rates), 0);
  const net = totalIncome - totalExpense;
  const activeProps   = properties.filter(p => p.active).length;
  const activeTenants = tenants.filter(t => t.status === "active").length;

  // Monthly bars, last 6 months
  const months = ["2026-03","2026-04","2026-05","2026-06","2026-07","2026-08"];
  const byMonth = months.map(m => {
    const inc = income.filter(i => i.period === m).reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);
    const exp = expenses.filter(e => e.date.startsWith(m)).reduce((s,e) => s + convert(e.amount, e.currency, base, rates), 0);
    return { m, inc, exp };
  });
  const maxBar = Math.max(...byMonth.flatMap(x => [x.inc, x.exp])) || 1;

  const perProperty = properties.filter(p => p.active).map(p => {
    const inc = income.filter(i => i.propertyId === p.id).reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);
    const exp = expenses.filter(e => e.propertyId === p.id).reduce((s,e) => s + convert(e.amount, e.currency, base, rates), 0);
    return { ...p, inc, exp, net: inc - exp };
  }).sort((a,b) => b.net - a.net);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <KPI label={`Total income · 6mo`}   value={fmt(totalIncome, base)}  sub="Across all properties" tone="good" />
        <KPI label={`Total expenses · 6mo`} value={fmt(totalExpense, base)} sub="Mortgage, tax, repairs…" tone="bad" />
        <KPI label="Net cash flow"          value={fmt(net, base)}          sub={net > 0 ? "In the black" : "In the red"} tone={net > 0 ? "good" : "bad"} />
        <KPI label="Active properties"      value={String(activeProps)}     sub={`${properties.length - activeProps} inactive`} />
        <KPI label="Active tenants"         value={String(activeTenants)}   sub={`${tenants.filter(t => t.status !== "active").length} moved out`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <Card title="Monthly cash flow" subtitle={`Base currency: ${base}. Converted from source currencies using the FX rate in Settings.`}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 200, padding: "10px 4px 0" }}>
            {byMonth.map(x => (
              <div key={x.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 170 }}>
                  <div title={`Income: ${fmt(x.inc, base)}`} style={{
                    width: 22, height: `${(x.inc / maxBar) * 100}%`,
                    background: "var(--good)", borderRadius: "3px 3px 0 0", opacity: 0.85,
                  }} />
                  <div title={`Expenses: ${fmt(x.exp, base)}`} style={{
                    width: 22, height: `${(x.exp / maxBar) * 100}%`,
                    background: "var(--bad)", borderRadius: "3px 3px 0 0", opacity: 0.7,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{x.m.slice(5)}/{x.m.slice(2,4)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 12, color: "var(--fg-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "var(--good)", borderRadius: 2 }} /> Income
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, background: "var(--bad)", opacity: 0.7, borderRadius: 2 }} /> Expenses
            </span>
          </div>
        </Card>

        <Card title="Net by property" subtitle="Sorted by cash flow, highest first">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {perProperty.map(p => {
              const total = Math.max(p.inc, p.exp);
              return (
                <div key={p.id} onClick={() => nav("property", p.id)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: p.net >= 0 ? "var(--good)" : "var(--bad)", fontVariantNumeric: "tabular-nums" }}>
                      {p.net >= 0 ? "+" : ""}{fmt(p.net, base)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 3, height: 6, borderRadius: 3, overflow: "hidden", background: "var(--surface-2)" }}>
                    <div style={{ width: `${(p.inc/total)*100}%`, background: "var(--good)", opacity: 0.85 }} />
                    <div style={{ width: `${(p.exp/total)*100}%`, background: "var(--bad)", opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="Recent activity" action={<Button variant="link" size="sm" onClick={() => nav("audit")}>View all →</Button>}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {window.SEED_AUDIT.slice(0, 5).map((a, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none", fontSize: 12.5,
              }}>
                <div>
                  <div style={{ color: "var(--fg-1)" }}>{a.action}</div>
                  <div style={{ color: "var(--fg-3)", fontSize: 11.5 }}>{a.target}</div>
                </div>
                <div style={{ color: "var(--fg-3)", fontSize: 11.5, whiteSpace: "nowrap" }}>{a.ts.slice(5,16)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Attention needed" subtitle="Late/missed rent and expiring leases">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {income.filter(i => i.late).slice(0, 3).map(i => {
              const t = tenants.find(x => x.id === i.tenantId);
              const p = properties.find(x => x.id === i.propertyId);
              return (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "color-mix(in oklab, var(--warn) 8%, transparent)", borderRadius: 8 }}>
                  <div style={{ fontSize: 12.5 }}>
                    <div style={{ color: "var(--fg-1)" }}>Late payment · {t?.name}</div>
                    <div style={{ color: "var(--fg-3)", fontSize: 11.5 }}>{p?.name} · {i.period}</div>
                  </div>
                  <Pill tone="warn">Late</Pill>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "color-mix(in oklab, var(--bad) 8%, transparent)", borderRadius: 8 }}>
              <div style={{ fontSize: 12.5 }}>
                <div style={{ color: "var(--fg-1)" }}>Missed payment · Emeka Balogun</div>
                <div style={{ color: "var(--fg-3)", fontSize: 11.5 }}>Ikoyi Terrace · July 2026</div>
              </div>
              <Button size="sm" variant="soft" icon="whatsapp" onClick={() => alert("Would open WhatsApp reminder composer")}>Remind</Button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
              <div style={{ fontSize: 12.5 }}>
                <div style={{ color: "var(--fg-1)" }}>Lease ending in 32 days</div>
                <div style={{ color: "var(--fg-3)", fontSize: 11.5 }}>Hana Ito · Southlake Bungalow</div>
              </div>
              <Pill tone="warn">Renewal</Pill>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================
   PROPERTIES · LIST
   ========================================================= */
function PropertiesScreen({ tweaks }) {
  const { properties, tenants, income, expenses, nav } = useStore();
  const [query, setQuery] = uState1("");
  const [showAdd, setShowAdd] = uState1(false);
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };

  const rows = properties.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.city.toLowerCase().includes(query.toLowerCase())).map(p => {
    const tCount = tenants.filter(t => t.propertyId === p.id && t.status === "active").length;
    const inc = income.filter(i => i.propertyId === p.id).reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);
    const exp = expenses.filter(e => e.propertyId === p.id).reduce((s,e) => s + convert(e.amount, e.currency, base, rates), 0);
    return { ...p, tCount, inc, exp, net: inc - exp };
  });

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--fg-3)", pointerEvents: "none" }}>
            <Icon name="search" size={14} />
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or city…" style={{
            width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13, fontFamily: "inherit", outline: "none",
          }}/>
        </div>
        <Button variant="ghost" size="sm" icon="filter">Filters</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="md" icon="plus" onClick={() => setShowAdd(true)}>Add property</Button>
      </div>

      <Card padding={0}>
        <Table
          onRowClick={r => nav("property", r.id)}
          columns={[
            { key: "name",  label: "Property", render: r => (
              <div>
                <div style={{ fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{r.address}, {r.city}</div>
              </div>
            )},
            { key: "type",  label: "Type", render: r => <span style={{ color: "var(--fg-2)" }}>{r.type} · {r.units}u</span> },
            { key: "loc",   label: "Location", render: r => <span style={{ color: "var(--fg-2)" }}>{r.city}, {r.country}</span> },
            { key: "tCount",label: "Tenants", align: "right", numeric: true, render: r => r.tCount },
            { key: "net",   label: `Net (${base})`, align: "right", numeric: true, render: r => (
              <span style={{ color: r.net >= 0 ? "var(--good)" : "var(--bad)" }}>
                {r.net >= 0 ? "+" : ""}{fmt(r.net, base)}
              </span>
            )},
            { key: "status",label: "Status", render: r => <Pill tone={r.active ? "good" : "neutral"}>{r.active ? "Active" : "Inactive"}</Pill> },
          ]}
          rows={rows}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add property" width={640}>
        <PropertyForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}

function PropertyForm({ onClose, initial }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Input label="Property name" defaultValue={initial?.name} placeholder="e.g. Maple Row Duplex" />
      <Select label="Type" options={["Single-family","Multi-family","Condo","Townhouse","Commercial"]} defaultValue={initial?.type || "Single-family"} onChange={()=>{}} />
      <Input label="Address" style={{ gridColumn: "1 / -1" }} defaultValue={initial?.address} />
      <Input label="City" defaultValue={initial?.city} />
      <Input label="State / Region" defaultValue={initial?.state} />
      <Input label="Country" defaultValue={initial?.country} />
      <Input label="Number of units" type="number" defaultValue={initial?.units || 1} />
      <Input label="Purchase date" type="date" defaultValue={initial?.purchaseDate} />
      <Select label="Currency" options={["USD","NGN","EUR","GBP"]} defaultValue={initial?.currency || "USD"} onChange={()=>{}} />
      <Input label="Purchase price" type="number" defaultValue={initial?.purchasePrice} />
      <Input label="Mortgage lender" defaultValue={initial?.lender} />
      <Input label="Mortgage balance" type="number" defaultValue={initial?.mortgageBalance} />
      <Input label="Interest rate (%)" type="number" step="0.01" defaultValue={initial?.interestRate} />
      <Input label="Monthly payment" type="number" defaultValue={initial?.monthlyPayment} />
      <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
        <span style={{ fontWeight: 500 }}>Notes</span>
        <textarea rows={3} defaultValue={initial?.notes} style={{
          padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
          fontFamily: "inherit", outline: "none", resize: "vertical",
        }} />
      </label>
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Save property</Button>
      </div>
    </div>
  );
}

/* =========================================================
   PROPERTY DETAIL
   ========================================================= */
function PropertyDetail({ tweaks }) {
  const { properties, tenants, income, expenses, param, nav } = useStore();
  const p = properties.find(x => x.id === param);
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };
  if (!p) return <div style={{ padding: 40 }}>Property not found. <Button variant="link" onClick={() => nav("properties")}>Back →</Button></div>;

  const linkedTenants = tenants.filter(t => t.propertyId === p.id);
  const inc = income.filter(i => i.propertyId === p.id);
  const exp = expenses.filter(e => e.propertyId === p.id);
  const totalInc = inc.reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);
  const totalExp = exp.reduce((s,e) => s + convert(e.amount, e.currency, base, rates), 0);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--fg-3)" }}>
        <button onClick={() => nav("properties")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-3)", fontFamily: "inherit", padding: 0 }}>Properties</button>
        <Icon name="chevron" size={12} />
        <span style={{ color: "var(--fg-1)" }}>{p.name}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{p.name}</h1>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--fg-3)" }}>{p.address} · {p.city}, {p.state}, {p.country}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill tone={p.active ? "good" : "neutral"}>{p.active ? "Active" : "Inactive"}</Pill>
          <Button variant="ghost" size="sm" icon="edit">Edit</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI label="Type"        value={p.type} sub={`${p.units} unit${p.units > 1 ? "s" : ""}`} />
        <KPI label="Income · 6mo"  value={fmt(totalInc, base)} tone="good" />
        <KPI label="Expenses · 6mo" value={fmt(totalExp, base)} tone="bad" />
        <KPI label="Net · 6mo"      value={fmt(totalInc - totalExp, base)} tone={totalInc - totalExp >= 0 ? "good" : "bad"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="Purchase & mortgage">
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px", fontSize: 13 }}>
            <span style={{ color: "var(--fg-3)" }}>Purchase date</span><span>{p.purchaseDate}</span>
            <span style={{ color: "var(--fg-3)" }}>Purchase price</span><span><Money amount={p.purchasePrice} from={p.currency} tweaks={tweaks} /></span>
            <span style={{ color: "var(--fg-3)" }}>Lender</span><span>{p.lender}</span>
            <span style={{ color: "var(--fg-3)" }}>Mortgage balance</span><span><Money amount={p.mortgageBalance} from={p.currency} tweaks={tweaks} /></span>
            <span style={{ color: "var(--fg-3)" }}>Interest rate</span><span>{p.interestRate}%</span>
            <span style={{ color: "var(--fg-3)" }}>Monthly payment</span><span><Money amount={p.monthlyPayment} from={p.currency} tweaks={tweaks} /></span>
          </div>
          {p.notes && <div style={{ marginTop: 14, padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5, color: "var(--fg-2)", fontStyle: "italic" }}>{p.notes}</div>}
        </Card>

        <Card title="Linked tenants" subtitle={`${linkedTenants.length} tenant${linkedTenants.length === 1 ? "" : "s"}`} action={<Button variant="link" size="sm" icon="plus">Link tenant</Button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {linkedTenants.map(t => (
              <div key={t.id} onClick={() => nav("tenant", t.id)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 8, background: "var(--surface-2)", cursor: "pointer",
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>{t.name} <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {t.unit}</span></div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>Lease: {t.leaseStart} → {t.leaseEnd}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{fmt(t.rent, t.currency)}/mo</div>
                  <Pill tone={t.status === "active" ? "good" : "neutral"}>{t.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent transactions">
        <Table
          columns={[
            { key: "date",   label: "Date" },
            { key: "kind",   label: "Type", render: r => <Pill tone={r.kind === "income" ? "good" : "bad"}>{r.kind === "income" ? "Rent" : r.subtype}</Pill> },
            { key: "who",    label: "Party" },
            { key: "amount", label: "Amount", align: "right", numeric: true, render: r => (
              <span style={{ color: r.kind === "income" ? "var(--good)" : "var(--fg-1)" }}>
                {r.kind === "income" ? "+" : "−"}<Money amount={r.amount} from={r.currency} tweaks={tweaks} showBoth={false} />
              </span>
            )},
          ]}
          rows={[
            ...inc.map(i => ({ id: i.id, date: i.datePaid, kind: "income", who: tenants.find(t => t.id === i.tenantId)?.name || "—", amount: i.amount, currency: i.currency })),
            ...exp.map(e => ({ id: e.id, date: e.date, kind: "expense", subtype: e.type, who: e.payee, amount: e.amount, currency: e.currency })),
          ].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8)}
        />
      </Card>
    </div>
  );
}

/* =========================================================
   TENANTS · LIST
   ========================================================= */
function TenantsScreen({ tweaks }) {
  const { tenants, properties, nav } = useStore();
  const [showAdd, setShowAdd] = uState1(false);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Add tenant</Button>
      </div>
      <Card padding={0}>
        <Table
          onRowClick={r => nav("tenant", r.id)}
          columns={[
            { key: "name",    label: "Tenant", render: r => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--fg-2)" }}>
                  {r.name.split(" ").map(x => x[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: "property", label: "Property", render: r => {
              const p = properties.find(p => p.id === r.propertyId);
              return <span style={{ color: "var(--fg-2)" }}>{p?.name} <span style={{ color: "var(--fg-3)" }}>{r.unit !== "—" ? `· ${r.unit}` : ""}</span></span>;
            }},
            { key: "rent", label: "Rent", align: "right", numeric: true, render: r => `${fmt(r.rent, r.currency)}/mo` },
            { key: "lease", label: "Lease ends", render: r => r.leaseEnd },
            { key: "method", label: "Method", render: r => <span style={{ color: "var(--fg-2)" }}>{r.method}</span> },
            { key: "status", label: "Status", render: r => <Pill tone={r.status === "active" ? "good" : "neutral"}>{r.status}</Pill> },
          ]}
          rows={tenants}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add tenant" width={640}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Full name" style={{ gridColumn: "1 / -1" }} />
          <Input label="Phone" placeholder="+234 …" />
          <Input label="Email" type="email" />
          <Select label="Property" options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={()=>{}} />
          <Input label="Unit" placeholder="e.g. Unit A" />
          <Input label="Lease start" type="date" />
          <Input label="Lease end" type="date" />
          <Input label="Monthly rent" type="number" />
          <Select label="Rent currency" options={["USD","NGN","EUR","GBP"]} onChange={()=>{}} />
          <Input label="Deposit amount" type="number" />
          <Select label="Payment method" options={["Bank transfer","Cash","Zelle","Wire","Check"]} onChange={()=>{}} />
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAdd(false)}>Save tenant</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* =========================================================
   TENANT DETAIL — with payment history + WhatsApp reminder
   ========================================================= */
function TenantDetail({ tweaks }) {
  const { tenants, properties, income, param, nav } = useStore();
  const [showRemind, setShowRemind] = uState1(false);
  const t = tenants.find(x => x.id === param);
  if (!t) return <div style={{ padding: 40 }}>Tenant not found. <Button variant="link" onClick={() => nav("tenants")}>Back →</Button></div>;
  const p = properties.find(x => x.id === t.propertyId);
  const payments = income.filter(i => i.tenantId === t.id).sort((a,b) => b.datePaid.localeCompare(a.datePaid));

  const months = ["2026-03","2026-04","2026-05","2026-06","2026-07","2026-08"];
  const paid = new Set(payments.map(x => x.period));
  const late = new Set(payments.filter(x => x.late).map(x => x.period));

  const defaultMessage = `Hi ${t.name.split(" ")[0]}, this is a friendly reminder that your rent for ${p?.name} (${fmt(t.rent, t.currency)}) is due. Please let me know once payment is sent. Thank you!`;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--fg-3)" }}>
        <button onClick={() => nav("tenants")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-3)", fontFamily: "inherit", padding: 0 }}>Tenants</button>
        <Icon name="chevron" size={12} /><span style={{ color: "var(--fg-1)" }}>{t.name}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: "var(--fg-2)" }}>
            {t.name.split(" ").map(x => x[0]).slice(0,2).join("")}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{t.name}</h1>
            <div style={{ marginTop: 3, fontSize: 13, color: "var(--fg-3)" }}>{t.phone} · {t.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="soft" icon="whatsapp" onClick={() => setShowRemind(true)}>Send WhatsApp reminder</Button>
          <Button variant="ghost" icon="edit">Edit</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI label="Monthly rent" value={fmt(t.rent, t.currency)} sub={`Deposit: ${fmt(t.deposit, t.currency)}`} />
        <KPI label="Payment method" value={t.method} />
        <KPI label="Lease" value={t.leaseEnd} sub={`Started ${t.leaseStart}`} />
        <KPI label="Status" value={t.status === "active" ? "Active" : "Moved out"} tone={t.status === "active" ? "good" : "neutral"} />
      </div>

      <Card title="Payment history · 6 months" subtitle="Green = paid on time, amber = late, red = missed">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 18 }}>
          {months.map(m => {
            const status = late.has(m) ? "late" : paid.has(m) ? "paid" : "missed";
            const cfg = {
              paid:   { bg: "color-mix(in oklab, var(--good) 15%, transparent)", fg: "var(--good)", label: "Paid" },
              late:   { bg: "color-mix(in oklab, var(--warn) 18%, transparent)", fg: "var(--warn)", label: "Late" },
              missed: { bg: "color-mix(in oklab, var(--bad) 15%, transparent)",  fg: "var(--bad)",  label: "Missed" },
            }[status];
            return (
              <div key={m} style={{ background: cfg.bg, padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 4 }}>{m}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: cfg.fg }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        <Table
          columns={[
            { key: "period", label: "Period" },
            { key: "datePaid", label: "Date paid" },
            { key: "amount", label: "Amount", align: "right", numeric: true, render: r => fmt(r.amount, r.currency) },
            { key: "method", label: "Method" },
            { key: "ref", label: "Reference" },
            { key: "status", label: "Status", render: r => r.late ? <Pill tone="warn">Late</Pill> : <Pill tone="good">On time</Pill> },
          ]}
          rows={payments}
        />
      </Card>

      <Modal open={showRemind} onClose={() => setShowRemind(false)} title="Send WhatsApp reminder" width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: "var(--fg-3)" }}>Recipient</span>
            <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>{t.name} · {t.phone}</span>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
            <span style={{ fontWeight: 500 }}>Message</span>
            <textarea defaultValue={defaultMessage} rows={5} style={{
              padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
              fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.55,
            }} />
          </label>
          <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>
            Opens WhatsApp with the pre-filled message. In production this uses the WhatsApp Business API (via Twilio or Meta Cloud API) for automated reminders on a schedule.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <Button variant="ghost" onClick={() => setShowRemind(false)}>Cancel</Button>
            <Button variant="primary" icon="whatsapp" onClick={() => setShowRemind(false)}>Send via WhatsApp</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, {
  DashboardScreen, PropertiesScreen, PropertyDetail, TenantsScreen, TenantDetail,
});
