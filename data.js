// Mock data for the Rental Tracker prototype.
// Currency codes: USD, NGN. Amounts stored in the transaction's currency;
// FX conversion happens at render time using SETTINGS.fxRates.

window.SEED_PROPERTIES = [
  {
    id: "P-001", name: "Maple Row Duplex", address: "412 Maple Row",
    city: "Austin", state: "TX", country: "USA", type: "Multi-family",
    units: 2, purchaseDate: "2021-06-14", purchasePrice: 385000,
    lender: "Wells Fargo", mortgageBalance: 289400, interestRate: 4.25,
    monthlyPayment: 2140, currency: "USD", active: true,
    notes: "Roof replaced 2024. Both units occupied.",
  },
  {
    id: "P-002", name: "Lekki Phase 1 Flat", address: "18 Admiralty Way",
    city: "Lagos", state: "Lagos", country: "Nigeria", type: "Condo",
    units: 1, purchaseDate: "2019-03-02", purchasePrice: 78000000,
    lender: "Access Bank", mortgageBalance: 41200000, interestRate: 18.5,
    monthlyPayment: 620000, currency: "NGN", active: true,
    notes: "Serviced apartment. Generator + borehole.",
  },
  {
    id: "P-003", name: "Cedar Grove SFH", address: "7 Cedar Grove Ln",
    city: "Round Rock", state: "TX", country: "USA", type: "Single-family",
    units: 1, purchaseDate: "2022-11-20", purchasePrice: 298000,
    lender: "Chase", mortgageBalance: 251800, interestRate: 6.1,
    monthlyPayment: 1820, currency: "USD", active: true,
    notes: "",
  },
  {
    id: "P-004", name: "Ikoyi Terrace", address: "5B Bourdillon Rd",
    city: "Lagos", state: "Lagos", country: "Nigeria", type: "Multi-family",
    units: 3, purchaseDate: "2020-08-11", purchasePrice: 145000000,
    lender: "GTBank", mortgageBalance: 89400000, interestRate: 17.0,
    monthlyPayment: 1180000, currency: "NGN", active: true,
    notes: "Unit 3 vacant, painting in progress.",
  },
  {
    id: "P-005", name: "Southlake Bungalow", address: "22 Oakview Dr",
    city: "Southlake", state: "TX", country: "USA", type: "Single-family",
    units: 1, purchaseDate: "2018-01-15", purchasePrice: 210000,
    lender: "— (paid off)", mortgageBalance: 0, interestRate: 0,
    monthlyPayment: 0, currency: "USD", active: true,
    notes: "Owned outright.",
  },
  {
    id: "P-006", name: "Yaba Studio Block", address: "9 Herbert Macaulay Way",
    city: "Lagos", state: "Lagos", country: "Nigeria", type: "Multi-family",
    units: 4, purchaseDate: "2023-05-30", purchasePrice: 62000000,
    lender: "Stanbic IBTC", mortgageBalance: 48500000, interestRate: 19.25,
    monthlyPayment: 780000, currency: "NGN", active: false,
    notes: "Under renovation. Currently inactive.",
  },
];

window.SEED_TENANTS = [
  { id: "T-001", name: "Marcus Ellery",    phone: "+1 512 555 0134", email: "marcus.e@mail.com",  propertyId: "P-001", unit: "Unit A", leaseStart: "2024-02-01", leaseEnd: "2026-01-31", rent: 1650, currency: "USD", deposit: 1650, method: "Bank transfer", status: "active" },
  { id: "T-002", name: "Priya Nair",       phone: "+1 512 555 0192", email: "priya.n@mail.com",   propertyId: "P-001", unit: "Unit B", leaseStart: "2023-09-01", leaseEnd: "2025-08-31", rent: 1720, currency: "USD", deposit: 1720, method: "Bank transfer", status: "active" },
  { id: "T-003", name: "Adaeze Okafor",    phone: "+234 802 555 0198", email: "adaeze.o@mail.com", propertyId: "P-002", unit: "—",      leaseStart: "2025-01-15", leaseEnd: "2026-01-14", rent: 950000, currency: "NGN", deposit: 1900000, method: "Bank transfer", status: "active" },
  { id: "T-004", name: "Jordan Whitfield", phone: "+1 512 555 0140", email: "jordan.w@mail.com",  propertyId: "P-003", unit: "—",      leaseStart: "2024-05-01", leaseEnd: "2026-04-30", rent: 2150, currency: "USD", deposit: 2150, method: "Zelle",         status: "active" },
  { id: "T-005", name: "Emeka Balogun",    phone: "+234 803 555 0122", email: "emeka.b@mail.com",  propertyId: "P-004", unit: "Unit 1", leaseStart: "2024-11-01", leaseEnd: "2025-10-31", rent: 620000, currency: "NGN", deposit: 620000,  method: "Bank transfer", status: "active" },
  { id: "T-006", name: "Kemi Adebayo",     phone: "+234 806 555 0177", email: "kemi.a@mail.com",   propertyId: "P-004", unit: "Unit 2", leaseStart: "2025-02-01", leaseEnd: "2026-01-31", rent: 580000, currency: "NGN", deposit: 580000,  method: "Cash",          status: "active" },
  { id: "T-007", name: "Hana Ito",         phone: "+1 512 555 0166", email: "hana.i@mail.com",    propertyId: "P-005", unit: "—",      leaseStart: "2023-06-15", leaseEnd: "2025-06-14", rent: 1980, currency: "USD", deposit: 1980, method: "Bank transfer", status: "active" },
  { id: "T-008", name: "Tunde Bakare",     phone: "+234 809 555 0104", email: "tunde.b@mail.com",  propertyId: "P-004", unit: "Unit 3", leaseStart: "2023-04-01", leaseEnd: "2025-03-31", rent: 610000, currency: "NGN", deposit: 610000,  method: "Bank transfer", status: "moved out" },
];

// Generate 6 months of income + expenses for realism.
(function seedTransactions() {
  const months = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
  const income = [];
  const expenses = [];
  let incId = 1, expId = 1;

  window.SEED_TENANTS.filter(t => t.status === "active").forEach(t => {
    months.forEach((m, i) => {
      // Simulate a late payment for one tenant, one skipped for another
      if (t.id === "T-005" && i === 4) return; // skipped
      const dayPaid = t.id === "T-002" && i === 3 ? 14 : 3 + (i % 5);
      income.push({
        id: `INC-${String(incId++).padStart(4, "0")}`,
        propertyId: t.propertyId, tenantId: t.id,
        amount: t.rent, currency: t.currency,
        datePaid: `${m}-${String(dayPaid).padStart(2, "0")}`,
        period: m, method: t.method,
        ref: `REF${Math.floor(100000 + Math.random() * 900000)}`,
        notes: dayPaid > 10 ? "Late payment" : "",
        late: dayPaid > 10,
      });
    });
  });

  const expenseTemplates = [
    { propertyId: "P-001", type: "Mortgage",    payee: "Wells Fargo",  amount: 2140, currency: "USD", recurring: true },
    { propertyId: "P-001", type: "Insurance",   payee: "State Farm",   amount: 118,  currency: "USD", recurring: true },
    { propertyId: "P-001", type: "Repair",      payee: "AC Guy Inc.",  amount: 640,  currency: "USD", recurring: false },
    { propertyId: "P-002", type: "Mortgage",    payee: "Access Bank",  amount: 620000, currency: "NGN", recurring: true },
    { propertyId: "P-002", type: "Utility",     payee: "Ikeja Electric", amount: 42000, currency: "NGN", recurring: true },
    { propertyId: "P-003", type: "Mortgage",    payee: "Chase",        amount: 1820, currency: "USD", recurring: true },
    { propertyId: "P-003", type: "Tax",         payee: "Travis County",amount: 380,  currency: "USD", recurring: true },
    { propertyId: "P-004", type: "Mortgage",    payee: "GTBank",       amount: 1180000, currency: "NGN", recurring: true },
    { propertyId: "P-004", type: "Maintenance", payee: "Sunny Plumbing", amount: 85000, currency: "NGN", recurring: false },
    { propertyId: "P-005", type: "Tax",         payee: "Tarrant County", amount: 410, currency: "USD", recurring: true },
    { propertyId: "P-005", type: "Insurance",   payee: "Allstate",     amount: 94, currency: "USD", recurring: true },
  ];
  months.forEach(m => {
    expenseTemplates.forEach(e => {
      if (!e.recurring && m !== "2026-05") return;
      expenses.push({
        id: `EXP-${String(expId++).padStart(4, "0")}`,
        propertyId: e.propertyId, type: e.type, payee: e.payee,
        amount: e.amount, currency: e.currency,
        date: `${m}-${e.type === "Mortgage" ? "01" : "12"}`,
        recurring: e.recurring, notes: "",
        receipt: Math.random() > 0.5 ? `receipt_${e.type.toLowerCase()}_${m}.pdf` : null,
      });
    });
  });

  window.SEED_INCOME = income;
  window.SEED_EXPENSES = expenses;
})();

window.SEED_USERS = [
  { id: "U-001", name: "You (Owner)",   email: "owner@landlord.app",   role: "Admin",   status: "active",  lastActive: "2 min ago" },
  { id: "U-002", name: "Grace Okonkwo", email: "grace@bookkeep.co",    role: "Accountant", status: "active",  lastActive: "yesterday" },
  { id: "U-003", name: "Aliyu Musa",    email: "aliyu.m@mail.com",     role: "Viewer",  status: "invited", lastActive: "—" },
];

window.SEED_AUDIT = [
  { ts: "2026-09-12 09:14", who: "You (Owner)",   action: "Created income",  target: "INC-0031 · Maple Row Duplex · $1,650" },
  { ts: "2026-09-12 08:52", who: "You (Owner)",   action: "Edited property", target: "P-004 · Ikoyi Terrace (notes)" },
  { ts: "2026-09-11 17:03", who: "Grace Okonkwo", action: "Exported CSV",    target: "Income report Q3 2026" },
  { ts: "2026-09-11 14:20", who: "You (Owner)",   action: "Invited user",    target: "aliyu.m@mail.com · Viewer" },
  { ts: "2026-09-10 22:41", who: "You (Owner)",   action: "Updated FX rate", target: "USD → NGN set to 1,585" },
  { ts: "2026-09-10 11:07", who: "You (Owner)",   action: "Deleted expense", target: "EXP-0018 · duplicate mortgage entry" },
  { ts: "2026-09-08 16:39", who: "Grace Okonkwo", action: "Viewed report",   target: "Net cash flow · YTD" },
];

window.CURRENCY_SYMBOL = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };
