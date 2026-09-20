// Income · Expenses · Reports

const { useState: uState2, useMemo: uMemo2 } = React;

/* =========================================================
   INCOME
   ========================================================= */
function IncomeScreen({ tweaks }) {
  const { income, properties, tenants } = useStore();
  const [showAdd, setShowAdd] = uState2(false);
  const [filterProp, setFilterProp]   = uState2("all");
  const [filterCcy, setFilterCcy]     = uState2("all");
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };

  const filtered = income.filter(i =>
    (filterProp === "all" || i.propertyId === filterProp) &&
    (filterCcy === "all"  || i.currency === filterCcy)
  ).sort((a,b) => b.datePaid.localeCompare(a.datePaid));

  const totalOriginal = filtered.reduce((acc, i) => {
    acc[i.currency] = (acc[i.currency] || 0) + i.amount;
    return acc;
  }, {});
  const totalBase = filtered.reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KPI label={`Total income · matches filter`} value={fmt(totalBase, base)} sub="Converted to base currency" tone="good" />
        <KPI label="By currency" value={
          <div style={{ display: "flex", gap: 14, fontSize: 18 }}>
            {Object.entries(totalOriginal).map(([c, a]) => <span key={c}>{fmt(a, c)}</span>)}
          </div>
        } sub="Original amounts" />
        <KPI label="Records" value={String(filtered.length)} sub={`Late: ${filtered.filter(i => i.late).length}`} />
      </div>

      <Card padding={0}>
        <div style={{ display: "flex", gap: 10, padding: "12px 16px", alignItems: "flex-end", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <Select label="Property" value={filterProp} onChange={e => setFilterProp(e.target.value)} options={[{ value: "all", label: "All properties" }, ...properties.map(p => ({ value: p.id, label: p.name }))]} />
          <Select label="Currency" value={filterCcy} onChange={e => setFilterCcy(e.target.value)} options={[{ value: "all", label: "All" }, { value: "USD", label: "USD" }, { value: "NGN", label: "NGN" }]} />
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" icon="download">Export CSV</Button>
          <Button variant="primary" size="md" icon="plus" onClick={() => setShowAdd(true)}>Record income</Button>
        </div>
        <Table
          columns={[
            { key: "datePaid", label: "Date" },
            { key: "prop", label: "Property", render: r => properties.find(p => p.id === r.propertyId)?.name },
            { key: "tenant", label: "Tenant", render: r => tenants.find(t => t.id === r.tenantId)?.name },
            { key: "period", label: "Period covered" },
            { key: "amount", label: "Amount", align: "right", numeric: true, render: r => (
              <Money amount={r.amount} from={r.currency} tweaks={tweaks} />
            )},
            { key: "method", label: "Method" },
            { key: "ref",    label: "Ref", render: r => <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "var(--fg-3)" }}>{r.ref}</span> },
            { key: "status", label: "", render: r => r.late ? <Pill tone="warn">Late</Pill> : null },
          ]}
          rows={filtered}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record rent payment" width={600}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Property" options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={()=>{}} />
          <Select label="Tenant" options={tenants.map(t => ({ value: t.id, label: t.name }))} onChange={()=>{}} />
          <Input label="Amount" type="number" placeholder="0.00" />
          <Select label="Currency" options={["USD","NGN","EUR","GBP"]} onChange={()=>{}} />
          <Input label="Date paid" type="date" defaultValue="2026-09-12" />
          <Input label="Period covered" placeholder="e.g. September 2026" />
          <Select label="Payment method" options={["Bank transfer","Cash","Zelle","Wire","Check"]} onChange={()=>{}} />
          <Input label="Reference / Transaction ID" placeholder="REF123456" />
          <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
            <span style={{ fontWeight: 500 }}>Notes (optional)</span>
            <textarea rows={2} style={{
              padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
              fontFamily: "inherit", outline: "none", resize: "vertical",
            }} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAdd(false)}>Record payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* =========================================================
   EXPENSES — with receipt upload zone
   ========================================================= */
function ExpensesScreen({ tweaks }) {
  const { expenses, properties } = useStore();
  const [showAdd, setShowAdd] = uState2(false);
  const [filterType, setFilterType] = uState2("all");
  const [filterProp, setFilterProp] = uState2("all");
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };

  const filtered = expenses.filter(e =>
    (filterType === "all" || e.type === filterType) &&
    (filterProp === "all" || e.propertyId === filterProp)
  ).sort((a,b) => b.date.localeCompare(a.date));

  const byType = filtered.reduce((acc, e) => {
    const v = convert(e.amount, e.currency, base, rates);
    acc[e.type] = (acc[e.type] || 0) + v; return acc;
  }, {});
  const totalBase = Object.values(byType).reduce((a,b) => a + b, 0);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <KPI label="Total expenses" value={fmt(totalBase, base)} sub={`${filtered.length} records`} tone="bad" />
        <Card title="Breakdown by category">
          <div style={{ display: "flex", gap: 3, height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 10, background: "var(--surface-2)" }}>
            {Object.entries(byType).map(([k, v], i) => (
              <div key={k} title={`${k}: ${fmt(v, base)}`} style={{
                width: `${(v / totalBase) * 100}%`,
                background: ["#d97757", "#b3543a", "#e19478", "#8b3a25", "#f0b39b", "#c26749", "#6b2b1c"][i % 7],
              }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: 11.5, color: "var(--fg-2)" }}>
            {Object.entries(byType).map(([k, v], i) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: ["#d97757", "#b3543a", "#e19478", "#8b3a25", "#f0b39b", "#c26749", "#6b2b1c"][i % 7] }} />
                {k}: <b style={{ color: "var(--fg-1)", fontWeight: 500 }}>{fmt(v, base)}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ display: "flex", gap: 10, padding: "12px 16px", alignItems: "flex-end", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <Select label="Property" value={filterProp} onChange={e => setFilterProp(e.target.value)} options={[{ value: "all", label: "All properties" }, ...properties.map(p => ({ value: p.id, label: p.name }))]} />
          <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} options={["all","Mortgage","Repair","Maintenance","Tax","Insurance","Utility","Fee"].map(x => ({ value: x, label: x === "all" ? "All types" : x }))} />
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" icon="download">Export CSV</Button>
          <Button variant="primary" size="md" icon="plus" onClick={() => setShowAdd(true)}>Log expense</Button>
        </div>
        <Table
          columns={[
            { key: "date", label: "Date" },
            { key: "prop", label: "Property", render: r => properties.find(p => p.id === r.propertyId)?.name },
            { key: "type", label: "Type", render: r => <Pill>{r.type}</Pill> },
            { key: "payee", label: "Payee" },
            { key: "amount", label: "Amount", align: "right", numeric: true, render: r => (
              <Money amount={r.amount} from={r.currency} tweaks={tweaks} />
            )},
            { key: "recurring", label: "Recurring", render: r => r.recurring ? <Pill tone="accent">Monthly</Pill> : <span style={{ color: "var(--fg-3)" }}>One-time</span> },
            { key: "receipt", label: "Receipt", render: r => r.receipt
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--accent)", cursor: "pointer" }}><Icon name="file" size={13} />{r.receipt.slice(0,20)}…</span>
              : <span style={{ fontSize: 11.5, color: "var(--fg-3)" }}>—</span>
            },
          ]}
          rows={filtered}
        />
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log an expense" width={640}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Property" options={properties.map(p => ({ value: p.id, label: p.name }))} onChange={()=>{}} />
          <Select label="Expense type" options={["Mortgage","Repair","Maintenance","Tax","Insurance","Utility","Fee"]} onChange={()=>{}} />
          <Input label="Vendor / Payee" style={{ gridColumn: "1 / -1" }} placeholder="e.g. Wells Fargo" />
          <Input label="Amount" type="number" placeholder="0.00" />
          <Select label="Currency" options={["USD","NGN","EUR","GBP"]} onChange={()=>{}} />
          <Input label="Date" type="date" defaultValue="2026-09-12" />
          <Select label="Frequency" options={["One-time","Monthly recurring","Quarterly","Annual"]} onChange={()=>{}} />
          <label style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
            <span style={{ fontWeight: 500 }}>Notes (optional)</span>
            <textarea rows={2} style={{
              padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
              fontFamily: "inherit", outline: "none", resize: "vertical",
            }} />
          </label>
          {/* Receipt upload zone */}
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, marginBottom: 5 }}>Receipt (optional)</div>
            <div style={{
              border: "1.5px dashed var(--border)", borderRadius: 10, padding: 24, textAlign: "center",
              background: "var(--surface-2)", cursor: "pointer",
            }}>
              <div style={{ display: "inline-flex", padding: 12, borderRadius: 10, background: "var(--surface-1)", marginBottom: 10, color: "var(--accent)" }}>
                <Icon name="upload" size={20} />
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>Drop receipt here, or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>browse</span></div>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 3 }}>PDF, PNG, JPG · Max 10MB · Stored securely in Supabase Storage</div>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAdd(false)}>Log expense</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* =========================================================
   REPORTS — period selector, per-property breakdown, tax export
   ========================================================= */
function ReportsScreen({ tweaks }) {
  const { properties, income, expenses } = useStore();
  const [period, setPeriod] = uState2("Q3 2026");
  const [showTax, setShowTax] = uState2(false);
  const base = tweaks.baseCurrency;
  const rates = { USD: 1, NGN: Number(tweaks.usdToNgn) || 1585, EUR: 0.92 };

  const periodMonths = {
    "August 2026":   ["2026-08"],
    "Q3 2026":       ["2026-06","2026-07","2026-08"],
    "Q2 2026":       ["2026-03","2026-04","2026-05"],
    "YTD 2026":      ["2026-03","2026-04","2026-05","2026-06","2026-07","2026-08"],
  }[period];

  const perProp = properties.filter(p => p.active).map(p => {
    const inc = income.filter(i => i.propertyId === p.id && periodMonths.includes(i.period)).reduce((s,i) => s + convert(i.amount, i.currency, base, rates), 0);
    const exp = expenses.filter(e => e.propertyId === p.id && periodMonths.some(m => e.date.startsWith(m))).reduce((s,e) => s + convert(e.amount, e.currency, base, rates), 0);
    return { ...p, inc, exp, net: inc - exp };
  });
  const totInc = perProp.reduce((s,p) => s + p.inc, 0);
  const totExp = perProp.reduce((s,p) => s + p.exp, 0);
  const totNet = totInc - totExp;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Select label="Period" value={period} onChange={e => setPeriod(e.target.value)} options={["August 2026","Q3 2026","Q2 2026","YTD 2026"]} style={{ minWidth: 160 }} />
        <Select label="Group by" options={["Property","Tenant","Category"]} onChange={()=>{}} />
        <Select label="Base currency" options={["USD","NGN"]} value={base} onChange={()=>{}} />
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="download">Export CSV</Button>
        <Button variant="soft" icon="report" onClick={() => setShowTax(true)}>Tax export (Schedule E / FIRS)</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KPI label={`Income · ${period}`}   value={fmt(totInc, base)} tone="good" />
        <KPI label={`Expenses · ${period}`} value={fmt(totExp, base)} tone="bad" />
        <KPI label={`Net cash flow · ${period}`} value={fmt(totNet, base)} tone={totNet >= 0 ? "good" : "bad"} />
      </div>

      <Card title={`Net cash flow by property · ${period}`}>
        <Table
          columns={[
            { key: "name", label: "Property", render: r => (
              <div>
                <div style={{ fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{r.city}, {r.country}</div>
              </div>
            )},
            { key: "inc", label: `Income (${base})`, align: "right", numeric: true, render: r => <span style={{ color: "var(--good)" }}>{fmt(r.inc, base)}</span> },
            { key: "exp", label: `Expenses (${base})`, align: "right", numeric: true, render: r => <span style={{ color: "var(--bad)" }}>{fmt(r.exp, base)}</span> },
            { key: "net", label: `Net (${base})`, align: "right", numeric: true, render: r => (
              <span style={{ fontWeight: 600, color: r.net >= 0 ? "var(--good)" : "var(--bad)" }}>
                {r.net >= 0 ? "+" : ""}{fmt(r.net, base)}
              </span>
            )},
            { key: "bar", label: "", render: r => {
              const max = Math.max(...perProp.map(x => Math.max(x.inc, x.exp)));
              return (
                <div style={{ width: 100, display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(r.inc/max)*100}%`, height: "100%", background: "var(--good)" }} />
                  </div>
                  <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(r.exp/max)*100}%`, height: "100%", background: "var(--bad)", opacity: 0.7 }} />
                  </div>
                </div>
              );
            }},
          ]}
          rows={perProp}
        />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="Income by tenant" subtitle={`${period}`}>
          {(() => {
            const byT = {};
            income.filter(i => periodMonths.includes(i.period)).forEach(i => {
              byT[i.tenantId] = (byT[i.tenantId] || 0) + convert(i.amount, i.currency, base, rates);
            });
            const rows = Object.entries(byT).map(([tid, v]) => {
              const t = window.SEED_TENANTS.find(x => x.id === tid);
              return { id: tid, name: t?.name || "—", v };
            }).sort((a,b) => b.v - a.v);
            const max = Math.max(...rows.map(r => r.v));
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rows.map(r => (
                  <div key={r.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span>{r.name}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(r.v, base)}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(r.v/max)*100}%`, height: "100%", background: "var(--accent)", opacity: 0.85 }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>

        <Card title="Expenses by category" subtitle={`${period}`}>
          {(() => {
            const byC = {};
            expenses.filter(e => periodMonths.some(m => e.date.startsWith(m))).forEach(e => {
              byC[e.type] = (byC[e.type] || 0) + convert(e.amount, e.currency, base, rates);
            });
            const rows = Object.entries(byC).map(([k, v]) => ({ k, v })).sort((a,b) => b.v - a.v);
            const max = Math.max(...rows.map(r => r.v));
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rows.map(r => (
                  <div key={r.k}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                      <span>{r.k}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(r.v, base)}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(r.v/max)*100}%`, height: "100%", background: "var(--bad)", opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      </div>

      <Modal open={showTax} onClose={() => setShowTax(false)} title="Tax export" width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6 }}>
            Generates a per-property summary suitable for filing rental income taxes. Choose your jurisdiction — the export maps expense categories to the right line items.
          </div>
          <Select label="Jurisdiction" options={["🇺🇸 US · IRS Schedule E (Form 1040)","🇳🇬 Nigeria · FIRS Personal Income Tax","🇬🇧 UK · SA105 Property pages","Custom (raw columns)"]} onChange={()=>{}} />
          <Select label="Tax year" options={["2026","2025","2024"]} onChange={()=>{}} />
          <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 12, color: "var(--fg-2)" }}>
            <div style={{ fontWeight: 500, marginBottom: 6, color: "var(--fg-1)" }}>Included</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Gross rental income per property (converted to base currency at year-end rate)</li>
              <li>Deductible expenses grouped by IRS/FIRS category</li>
              <li>Mortgage interest split from principal</li>
              <li>Depreciation basis (from purchase price)</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="soft" icon="download" style={{ flex: 1, justifyContent: "center" }}>Download CSV</Button>
            <Button variant="primary" icon="download" style={{ flex: 1, justifyContent: "center" }}>Download PDF</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { IncomeScreen, ExpensesScreen, ReportsScreen });
