// Settings · Users & Roles · Audit log · Login · Docs (deploy guide)

const { useState: uState3 } = React;

/* =========================================================
   SETTINGS
   ========================================================= */
function SettingsScreen({ tweaks, setTweak }) {
  return (
    <div style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <Card title="Reporting & currency">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select label="Base reporting currency" value={tweaks.baseCurrency} onChange={e => setTweak("baseCurrency", e.target.value)} options={["USD","NGN","EUR","GBP"]} />
          <Input label="USD → NGN rate" type="number" value={tweaks.usdToNgn} onChange={e => setTweak("usdToNgn", e.target.value)} hint="Update this whenever the exchange rate shifts. Historical transactions keep the rate they were entered with." />
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 12 }}>
            <Icon name="check" size={14} color="var(--good)" />
            <span style={{ color: "var(--fg-2)" }}>Auto-fetch rates from openexchangerates.org is available in production (free tier).</span>
          </div>
        </div>
      </Card>

      <Card title="Profile">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Name" defaultValue="You" />
          <Input label="Email" type="email" defaultValue="owner@landlord.app" />
          <Input label="Phone" defaultValue="+1 512 555 0100" />
          <Button variant="ghost" size="sm" style={{ alignSelf: "flex-start" }}>Change password</Button>
        </div>
      </Card>

      <Card title="Notifications">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { k: "rent_due",   label: "Rent due reminders (5 days before)" },
            { k: "rent_late",  label: "Alert me when rent is late" },
            { k: "lease_end",  label: "Lease expiring soon (60 days)" },
            { k: "wa_auto",    label: "Auto-send WhatsApp reminder to tenant" },
            { k: "receipts",   label: "Weekly receipts digest" },
          ].map(o => (
            <label key={o.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: "var(--fg-1)" }}>{o.label}</span>
              <input type="checkbox" defaultChecked={o.k !== "wa_auto"} style={{ accentColor: "var(--accent)" }} />
            </label>
          ))}
        </div>
      </Card>

      <Card title="Data & backup">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button variant="soft" icon="download">Download all data as CSV</Button>
          <Button variant="soft" icon="download">Download receipts (ZIP)</Button>
          <Button variant="danger" icon="trash">Delete account</Button>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   USERS & ROLES
   ========================================================= */
function UsersScreen() {
  const [showInvite, setShowInvite] = uState3(false);
  const { users } = useStore();
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--fg-3)" }}>
          Invite an accountant, co-owner, or property manager. Roles control what they can see and change.
        </div>
        <Button variant="primary" icon="plus" onClick={() => setShowInvite(true)}>Invite user</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { role: "Admin (Owner)",    perms: ["Full read + write", "Manage users & roles", "Delete records", "Export data"], count: users.filter(u => u.role === "Admin").length },
          { role: "Accountant",       perms: ["Read all data", "Create/edit income + expenses", "Export reports", "Cannot delete or invite"], count: users.filter(u => u.role === "Accountant").length },
          { role: "Viewer",           perms: ["Read-only", "View dashboard + reports", "No editing"], count: users.filter(u => u.role === "Viewer").length },
        ].map(r => (
          <Card key={r.role} title={r.role} subtitle={`${r.count} user${r.count === 1 ? "" : "s"}`}>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.9 }}>
              {r.perms.map(p => <li key={p}>{p}</li>)}
            </ul>
          </Card>
        ))}
      </div>

      <Card title="Team" padding={0}>
        <Table
          columns={[
            { key: "name", label: "User", render: u => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--fg-2)" }}>
                  {u.name.split(" ").map(x => x[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{u.email}</div>
                </div>
              </div>
            )},
            { key: "role", label: "Role", render: u => <Pill tone={u.role === "Admin" ? "accent" : "neutral"}>{u.role}</Pill> },
            { key: "status", label: "Status", render: u => <Pill tone={u.status === "active" ? "good" : "warn"}>{u.status}</Pill> },
            { key: "lastActive", label: "Last active", render: u => <span style={{ color: "var(--fg-3)" }}>{u.lastActive}</span> },
            { key: "actions", label: "", align: "right", render: u => (
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant="ghost" size="sm">Change role</Button>
                {u.role !== "Admin" && <Button variant="danger" size="sm">Remove</Button>}
              </div>
            )},
          ]}
          rows={users}
        />
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite a user" width={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Email address" type="email" placeholder="name@example.com" />
          <Select label="Role" options={["Accountant","Viewer","Admin"]} onChange={()=>{}} />
          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "var(--fg-2)" }}>
            <span style={{ fontWeight: 500 }}>Personal note (optional)</span>
            <textarea rows={3} placeholder="e.g. Grace, please help me reconcile Q3." style={{
              padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface-1)", color: "var(--fg-1)", fontSize: 13,
              fontFamily: "inherit", outline: "none", resize: "vertical",
            }} />
          </label>
          <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 8, fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.6 }}>
            They'll get an email with a magic-link to set a password. Access is revocable any time from this page.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowInvite(false)}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* =========================================================
   AUDIT LOG
   ========================================================= */
function AuditScreen() {
  const { audit } = useStore();
  return (
    <div style={{ padding: 28 }}>
      <Card padding={0} title="Audit log" subtitle="Every create, edit, and delete is recorded — filterable and exportable." action={<Button variant="ghost" size="sm" icon="download">Export</Button>}>
        <Table
          columns={[
            { key: "ts", label: "Timestamp", render: r => <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--fg-3)" }}>{r.ts}</span> },
            { key: "who", label: "User" },
            { key: "action", label: "Action", render: r => {
              const tone = r.action.startsWith("Deleted") ? "bad" : r.action.startsWith("Created") ? "good" : r.action.startsWith("Edited") || r.action.startsWith("Updated") ? "warn" : "neutral";
              return <Pill tone={tone}>{r.action}</Pill>;
            }},
            { key: "target", label: "Target", wrap: true },
          ]}
          rows={audit}
        />
      </Card>
    </div>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */
function LoginScreen() {
  const { nav } = useStore();
  return (
    <div style={{
      minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--surface-0)", padding: 40,
    }}>
      <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-fg)",
          }}>
            <Icon name="building" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>Doorkeep</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)" }}>Rental income & expense tracker</div>
          </div>
        </div>
        <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>Sign in to your portfolio</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Email" type="email" defaultValue="owner@landlord.app" />
          <Input label="Password" type="password" defaultValue="••••••••" />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--fg-2)", cursor: "pointer" }}>
            <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} /> Keep me signed in for 30 days
          </label>
          <Button variant="primary" size="lg" onClick={() => nav("dashboard")} style={{ justifyContent: "center", marginTop: 6 }}>Sign in →</Button>
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--fg-3)" }}>
            <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>Forgot password?</a>
            &nbsp;·&nbsp;
            <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign up</a>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 11.5, color: "var(--fg-3)", lineHeight: 1.6 }}>
          <b style={{ color: "var(--fg-2)" }}>Prototype note:</b> real deployment uses Supabase Auth (email + password + magic link). HTTPS is enforced via Vercel's free SSL.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DOCS / DEPLOY GUIDE
   ========================================================= */
function DocsScreen() {
  return (
    <div style={{ padding: "28px 40px", maxWidth: 900, margin: "0 auto", color: "var(--fg-1)", lineHeight: 1.65 }}>
      <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>For the landlord</div>
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.4, margin: "0 0 6px" }}>Getting your app online — free, in about an hour</h1>
      <p style={{ color: "var(--fg-2)", fontSize: 14, marginTop: 0 }}>
        This is the plain-English deployment guide. No coding is required to follow it, but you will copy-paste some settings. Bookmark this page.
      </p>

      <DocCard>
        <DocH2>The stack you'll use</DocH2>
        <p><b>Recommended:</b> <b style={{ color: "var(--accent)" }}>Vercel</b> (hosts the app) + <b style={{ color: "var(--accent)" }}>Supabase</b> (database, login, receipt storage). Both are free for a portfolio your size and include free HTTPS. <b>Alternative:</b> Netlify + NeonDB.</p>
        <DocTable rows={[
          ["Hosting",           "Vercel",            "Free hobby plan · 100 GB bandwidth · SSL included"],
          ["Database + Auth",   "Supabase",          "Free tier: 500 MB Postgres, 1 GB storage, 50 K auth users"],
          ["Backup hosting",    "Netlify",           "Same generous free tier"],
          ["Backup DB",         "NeonDB",            "0.5 GB Postgres, always free"],
        ]} />
      </DocCard>

      <DocCard>
        <DocH2>The 7 steps — start to finish</DocH2>
        {[
          { n: 1, t: "Create your accounts", body: <>Go to <DocLink href="https://vercel.com">vercel.com</DocLink> and <DocLink href="https://supabase.com">supabase.com</DocLink>. Sign up with your Google or GitHub account. Both are free — no credit card needed.</> },
          { n: 2, t: "Push the code to GitHub", body: <>The developer who builds this hands you a GitHub repo (or you download a ZIP and upload it). If you got a ZIP: on <DocLink href="https://github.com">github.com</DocLink>, click <em>New repository</em> → <em>Upload files</em> → drop the ZIP contents in. That's it.</> },
          { n: 3, t: "Connect GitHub to Vercel", body: <>In Vercel: <em>New Project</em> → pick your repo → <em>Import</em>. Vercel auto-detects the framework (Next.js) and shows an <em>Environment Variables</em> screen. Keep this tab open — you'll fill it in step 5.</> },
          { n: 4, t: "Create your database in Supabase", body: <>In Supabase: <em>New Project</em>. Pick a region close to you (e.g. Frankfurt for Europe/Africa, Dallas for Nigeria/US mix). Set a strong DB password and save it in your password manager. Wait ~2 minutes for it to spin up. Then: <em>Settings → API</em>. You'll see three values: <b>Project URL</b>, <b>anon key</b>, <b>service_role key</b>. Copy all three.</> },
          { n: 5, t: "Set environment variables in Vercel", body: <>Back in Vercel, in the Environment Variables screen, paste:<br/>
            <DocEnv>{`NEXT_PUBLIC_SUPABASE_URL   = <Project URL>
NEXT_PUBLIC_SUPABASE_ANON  = <anon key>
SUPABASE_SERVICE_ROLE      = <service_role key>
NEXTAUTH_SECRET            = <run: openssl rand -base64 32>`}</DocEnv>
            Click <em>Deploy</em>. Vercel builds and publishes in ~90 seconds. You'll get a URL like <DocMono>https://my-rental-tracker.vercel.app</DocMono>.</> },
          { n: 6, t: "Run the database setup script", body: <>In Supabase: <em>SQL Editor → New query</em>. Paste the contents of <DocMono>supabase/schema.sql</DocMono> (in the repo) and click <em>Run</em>. This creates all the tables (properties, tenants, income, expenses, users, audit_log). Then run <DocMono>supabase/rls.sql</DocMono> — this locks down each row so users only see data they're allowed to.</> },
          { n: 7, t: "Sign in and test", body: <>Open your Vercel URL. Click <em>Sign up</em>. The first user to sign up automatically becomes the Admin/Owner. Add one property, one tenant, and one rent payment to verify everything works. You're live.</> },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 18, padding: "14px 0", borderBottom: "1px dashed var(--border)" }}>
            <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", color: "var(--accent-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-1)", marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: "var(--fg-2)" }}>{s.body}</div>
            </div>
          </div>
        ))}
      </DocCard>

      <DocCard>
        <DocH2>Example URLs you'll get</DocH2>
        <p>Vercel and Netlify both give you a free subdomain. Pick a name that isn't taken:</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--fg-2)", fontSize: 13.5 }}>
          <li><DocMono>https://my-rental-tracker.vercel.app</DocMono></li>
          <li><DocMono>https://doorkeep.vercel.app</DocMono></li>
          <li><DocMono>https://landlord-books.netlify.app</DocMono></li>
          <li><DocMono>https://yourname.github.io/rental-tracker</DocMono> (static export)</li>
        </ul>
        <p style={{ marginTop: 12 }}>Later you can point a custom domain (e.g. <DocMono>books.mylastname.com</DocMono>) at Vercel for free — just add a CNAME in your domain registrar.</p>
      </DocCard>

      <DocCard>
        <DocH2>Inviting your accountant or manager</DocH2>
        <ol style={{ margin: 0, paddingLeft: 20, color: "var(--fg-2)", fontSize: 13.5, lineHeight: 1.9 }}>
          <li>Go to <b>Users & Roles</b> in the sidebar.</li>
          <li>Click <b>Invite user</b> and type their email.</li>
          <li>Pick a role:
            <ul style={{ marginTop: 4 }}>
              <li><b>Admin</b> — full access. Only give to co-owners you fully trust.</li>
              <li><b>Accountant</b> — can add income/expenses, run reports, cannot delete anything, cannot invite others.</li>
              <li><b>Viewer</b> — read-only. Perfect for a spouse or a tax advisor who just needs to see numbers.</li>
            </ul>
          </li>
          <li>They get an email with a magic-link. They set a password, and they're in.</li>
          <li>You can change or remove their access anytime from the same page. All their actions are logged in <b>Audit log</b>.</li>
        </ol>
      </DocCard>

      <DocCard>
        <DocH2>Architecture (for your developer)</DocH2>
        <DocH3>Tech stack</DocH3>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--fg-2)", fontSize: 13.5 }}>
          <li><b>Frontend:</b> Next.js 14 (App Router) + React + Tailwind, deployed on Vercel</li>
          <li><b>Backend:</b> Next.js API routes (serverless)</li>
          <li><b>Database:</b> Supabase Postgres with Row-Level Security</li>
          <li><b>Auth:</b> Supabase Auth (email + password + magic link)</li>
          <li><b>File storage:</b> Supabase Storage for receipts</li>
          <li><b>WhatsApp:</b> Twilio WhatsApp Business API (free trial → pay-per-message)</li>
          <li><b>FX rates:</b> openexchangerates.org free tier (1000 requests/month)</li>
        </ul>
        <DocH3>Data model</DocH3>
        <DocEnv>{`users             (id, email, name, role, created_at)
properties        (id, owner_id, name, address, city, state, country,
                   type, units, purchase_date, purchase_price, currency,
                   lender, mortgage_balance, interest_rate, monthly_payment,
                   active, notes)
tenants           (id, property_id, name, phone, email, unit,
                   lease_start, lease_end, rent, currency,
                   deposit, method, status)
income            (id, property_id, tenant_id, amount, currency,
                   date_paid, period, method, reference, notes, late)
expenses          (id, property_id, type, payee, amount, currency,
                   date, recurring, receipt_url, notes)
fx_rates          (id, from_ccy, to_ccy, rate, effective_date)
audit_log         (id, user_id, action, target_table, target_id, ts, diff)
invitations       (id, email, role, token, expires_at, accepted_at)`}</DocEnv>
        <DocH3>Main API endpoints</DocH3>
        <DocEnv>{`POST   /api/auth/signup           /api/auth/login       /api/auth/logout
GET    /api/properties           POST /api/properties
GET    /api/properties/:id       PATCH /api/properties/:id   DELETE ...
GET    /api/tenants              POST /api/tenants           /api/tenants/:id
GET    /api/income               POST /api/income            /api/income/:id
GET    /api/expenses             POST /api/expenses          /api/expenses/:id
POST   /api/expenses/:id/receipt      (uploads to Supabase Storage)
GET    /api/reports?period=Q3&groupBy=property
GET    /api/reports/export.csv        /api/reports/tax-export.pdf
POST   /api/users/invite         GET  /api/users             PATCH /api/users/:id
GET    /api/audit
POST   /api/whatsapp/remind      (Twilio; body: tenant_id, message)
GET    /api/fx?from=USD&to=NGN`}</DocEnv>
      </DocCard>

      <DocCard>
        <DocH2>Security checklist</DocH2>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--fg-2)", fontSize: 13.5, lineHeight: 1.9 }}>
          <li>HTTPS enforced — Vercel provides free SSL, no config needed.</li>
          <li>Row-Level Security in Supabase: every table has a policy so a user only sees rows for portfolios they belong to.</li>
          <li>Passwords hashed by Supabase Auth (bcrypt).</li>
          <li>Secrets stored as environment variables in Vercel — never checked into git.</li>
          <li>Audit log records every write with user + timestamp + diff.</li>
          <li>Daily automated database backups on Supabase's free plan.</li>
        </ul>
      </DocCard>

      <div style={{ marginTop: 30, padding: 18, background: "color-mix(in oklab, var(--accent) 8%, transparent)", borderRadius: 12, textAlign: "center", fontSize: 13, color: "var(--fg-2)" }}>
        Stuck on any step? Screenshot the error and send it to your developer, or open a support ticket at <DocLink href="https://vercel.com/help">vercel.com/help</DocLink> — response is usually within a day on the free plan.
      </div>
    </div>
  );
}

function DocCard({ children }) {
  return <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginTop: 22 }}>{children}</div>;
}
function DocH2({ children }) { return <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>{children}</h2>; }
function DocH3({ children }) { return <h3 style={{ margin: "18px 0 8px", fontSize: 13.5, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</h3>; }
function DocLink({ href, children }) { return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>{children} <Icon name="external" size={10} /></a>; }
function DocMono({ children }) { return <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4, color: "var(--fg-1)" }}>{children}</code>; }
function DocEnv({ children }) {
  return <pre style={{
    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
    padding: 14, fontSize: 12, fontFamily: "ui-monospace, monospace", color: "var(--fg-1)",
    margin: "10px 0", whiteSpace: "pre-wrap", lineHeight: 1.7, overflowX: "auto",
  }}>{children}</pre>;
}
function DocTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginTop: 10 }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} style={{
                padding: "9px 12px", borderBottom: "1px solid var(--border)",
                color: j === 0 ? "var(--fg-3)" : "var(--fg-1)",
                fontWeight: j === 1 ? 500 : 400,
                width: j === 0 ? 140 : j === 1 ? 140 : "auto",
              }}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Object.assign(window, { SettingsScreen, UsersScreen, AuditScreen, LoginScreen, DocsScreen });
