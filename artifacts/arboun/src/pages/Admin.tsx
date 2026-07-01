import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const TOKEN_KEY = "arbon_admin_token";

type Overview = {
  dbConnected?: boolean;
  online?: number;
  counts: Record<string, number>;
  dealsByStatus: Record<string, number>;
  money: { held: number; released: number; refunded: number; forfeited: number };
  reconcile: { debits: number; credits: number; balanced: boolean };
  verifiedUsers: number;
  openDisputes: number;
  pendingApprovals: number;
};

const TABS = [
  ["deals", "الصفقات"],
  ["users", "المستخدمون"],
  ["funds", "أموال الصفقات"],
  ["ledger", "دفتر القيود"],
  ["approvals", "الموافقات"],
  ["disputes", "النزاعات"],
  ["transfers", "التنازلات"],
  ["contracts", "العقود"],
  ["timeline", "السجل الزمني"],
  ["templates", "القوالب"],
] as const;

async function api(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "content-type": "application/json", "x-admin-token": token, ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? `HTTP ${res.status}`);
  return res.json();
}

const card: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--card-border))",
  borderRadius: 14,
  padding: 16,
};

function money(n: number) {
  return `${Number(n).toLocaleString("ar-SA")} ر.س`;
}

function DataTable({ rows, onDelete, onEdit }: { rows: Record<string, unknown>[]; onDelete?: (id: number) => void; onEdit?: (row: Record<string, unknown>) => void }) {
  if (!rows.length) return <p style={{ color: "hsl(var(--muted-foreground))", padding: 16 }}>لا توجد بيانات</p>;
  const cols = Object.keys(rows[0]!);
  const actions = onDelete || onEdit;
  return (
    <div style={{ overflowX: "auto", ...card, padding: 0 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, whiteSpace: "nowrap" }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ textAlign: "right", padding: "10px 12px", color: "hsl(var(--muted-foreground))", borderBottom: "1px solid hsl(var(--card-border))", position: "sticky", top: 0, background: "hsl(var(--card))" }}>
                {c}
              </th>
            ))}
            {actions && <th style={{ padding: "10px 12px", borderBottom: "1px solid hsl(var(--card-border))" }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid hsl(var(--card-border))" }}>
              {cols.map((c) => {
                const v = r[c];
                const text = v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
                return (
                  <td key={c} style={{ padding: "9px 12px", color: "hsl(var(--foreground))", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }} title={text}>
                    {text}
                  </td>
                );
              })}
              {actions && (
                <td style={{ padding: "9px 12px", display: "flex", gap: 6 }}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(r)}
                      style={{ background: "hsl(var(--input))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      تعديل
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(Number(r.id))}
                      style={{ background: "rgba(203,96,96,0.14)", color: "#CB6060", border: "1px solid rgba(203,96,96,0.25)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      حذف
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditModal({ row, onClose, onSave }: { row: Record<string, unknown>; onClose: () => void; onSave: (patch: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v === null || v === undefined ? "" : String(v)])),
  );
  const editable = Object.keys(row).filter((k) => k !== "id" && !/At$/.test(k));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
        <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>تعديل السجل رقم {String(row.id)}</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {editable.map((k) => (
            <label key={k} style={{ display: "block" }}>
              <span style={{ display: "block", color: "hsl(var(--muted-foreground))", fontSize: 12, marginBottom: 4 }}>{k}</span>
              <input
                value={form[k] ?? ""}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                style={{ width: "100%", background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "9px 12px", color: "hsl(var(--foreground))", fontSize: 13, outline: "none" }}
              />
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-start" }}>
          <button onClick={() => onSave(Object.fromEntries(editable.map((k) => [k, form[k] ?? ""])))} style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>حفظ</button>
          <button onClick={onClose} style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: (t: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "فشل تسجيل الدخول");
      localStorage.setItem(TOKEN_KEY, data.token);
      onSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", background: "hsl(var(--input))", border: "1px solid hsl(var(--border))",
    borderRadius: 12, padding: "13px 14px", color: "hsl(var(--foreground))", fontSize: 14, outline: "none",
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--background))" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 360, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ color: "hsl(var(--foreground))", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>لوحة تحكم عربون</h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>الدخول للمشرفين فقط</p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <input style={input} type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={input} type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: "#CB6060", fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("deals");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  const [, navigate] = useLocation();

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOverview(null);
    navigate("/");
  }

  useEffect(() => {
    if (!token) return;
    api("/admin/overview", token).then(setOverview).catch((e) => {
      if (String(e.message).includes("مصرّح") || String(e).includes("401")) logout();
      else setError(String(e.message ?? e));
    });
    api("/admin/settings", token).then((s) => s && setSettings(s)).catch(() => {});
  }, [token]);

  async function saveSettings() {
    if (!token || !settings) return;
    try {
      const updated = await api("/admin/settings", token, { method: "PUT", body: JSON.stringify(settings) });
      setSettings(updated);
      setSavedMsg("تم الحفظ ✓");
      setTimeout(() => setSavedMsg(""), 2000);
    } catch (e) {
      alert(String((e as Error).message ?? e));
    }
  }

  async function deleteRow(rowId: number) {
    if (!token || !Number.isFinite(rowId) || !confirm(`حذف السجل رقم ${rowId} من «${tab}»؟`)) return;
    try {
      await api(`/admin/${tab}/${rowId}`, token, { method: "DELETE" });
      setRows((rs) => rs.filter((r) => Number(r.id) !== rowId));
      api("/admin/overview", token).then(setOverview).catch(() => {});
    } catch (e) {
      alert(String((e as Error).message ?? e));
    }
  }

  async function saveEdit(patch: Record<string, string>) {
    if (!token || !editRow) return;
    const rowId = Number(editRow.id);
    try {
      await api(`/admin/${tab}/${rowId}`, token, { method: "PATCH", body: JSON.stringify(patch) });
      const fresh = await api(`/admin/${tab}`, token);
      setRows(fresh);
      setEditRow(null);
      api("/admin/overview", token).then(setOverview).catch(() => {});
    } catch (e) {
      alert(String((e as Error).message ?? e));
    }
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    api(`/admin/${tab}`, token)
      .then(setRows)
      .catch((e) => setError(String(e.message ?? e)))
      .finally(() => setLoading(false));
  }, [tab, token]);

  async function reseed() {
    if (!token || !confirm("إعادة تهيئة قاعدة البيانات بالبيانات التجريبية؟ سيُحذف كل شيء حالي.")) return;
    try {
      await api("/admin/reseed", token, { method: "POST" });
      const ov = await api("/admin/overview", token);
      setOverview(ov);
      const r = await api(`/admin/${tab}`, token);
      setRows(r);
    } catch (e) {
      alert(String((e as Error).message ?? e));
    }
  }

  if (!token) return <Login onSuccess={setToken} />;

  const stat = (label: string, value: string | number) => (
    <div style={card}>
      <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "hsl(var(--foreground))", fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid hsl(var(--card-border))", position: "sticky", top: 0, background: "hsl(var(--card))", zIndex: 10 }}>
        <h1 style={{ fontWeight: 800, fontSize: 18 }}>لوحة تحكم عربون</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reseed} style={{ background: "rgba(91,174,126,0.14)", color: "#5BAE7E", border: "1px solid rgba(91,174,126,0.25)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>إعادة تحميل البيانات التجريبية</button>
          <button onClick={logout} style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>خروج</button>
        </div>
      </header>

      <div style={{ padding: 20, display: "grid", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
        {error && <div style={{ ...card, color: "#CB6060" }}>{error}</div>}

        {overview && overview.dbConnected === false && (
          <div style={{ ...card, borderColor: "rgba(208,168,79,0.4)", color: "#D0A84F", fontSize: 13, fontWeight: 700, lineHeight: 1.8 }}>
            ⚠️ قاعدة البيانات غير مربوطة — لن تظهر بيانات حتى تضبط متغيّر البيئة <span style={{ direction: "ltr", display: "inline-block" }}>DATABASE_URL</span> في إعدادات الاستضافة (مثلاً قاعدة Neon المجانية). بعد ربطها تُنشأ الجداول وتُملأ البيانات تلقائياً.
          </div>
        )}

        {overview && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              <div style={{ ...card, borderColor: "rgba(91,174,126,0.4)" }}>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 12, marginBottom: 6 }}>المتواجدون الآن</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#5BAE7E", fontSize: 20, fontWeight: 800 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: "#5BAE7E", display: "inline-block" }} />
                  {overview.online ?? 0}
                </div>
              </div>
              {stat("الصفقات", overview.counts.deals ?? 0)}
              {stat("المستخدمون", overview.counts.users ?? 0)}
              {stat("موثّقون", overview.verifiedUsers)}
              {stat("نزاعات مفتوحة", overview.openDisputes)}
              {stat("موافقات معلّقة", overview.pendingApprovals)}
              {stat("قيود الدفتر", overview.counts.ledgerEntries ?? 0)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {stat("محتجز حالياً", money(overview.money.held))}
              {stat("مُحرّر للبائعين", money(overview.money.released))}
              {stat("مُسترَد للمشترين", money(overview.money.refunded))}
              <div style={{ ...card, borderColor: overview.reconcile.balanced ? "rgba(91,174,126,0.4)" : "#CB6060" }}>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 12, marginBottom: 6 }}>مطابقة الدفتر (مدين=دائن)</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: overview.reconcile.balanced ? "#5BAE7E" : "#CB6060" }}>
                  {overview.reconcile.balanced ? "✓ متوازن" : "✗ غير متوازن"} · {money(overview.reconcile.debits)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Site settings — control the site details */}
        {settings && (
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontWeight: 800, fontSize: 15 }}>⚙️ تفاصيل الموقع</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {savedMsg && <span style={{ color: "#5BAE7E", fontSize: 13, fontWeight: 700 }}>{savedMsg}</span>}
                <button onClick={saveSettings} style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>حفظ</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {([
                ["siteName", "اسم الموقع"],
                ["tagline", "الشعار النصّي"],
                ["logoUrl", "رابط شعار المنصة (صورة)"],
                ["platformFeePercent", "نسبة رسوم المنصة %"],
                ["supportEmail", "بريد الدعم"],
                ["supportPhone", "هاتف الدعم"],
                ["aboutText", "نبذة عن الموقع"],
                ["bankName", "الحساب البنكي — اسم البنك"],
                ["bankIban", "الحساب البنكي — الآيبان (IBAN)"],
                ["bankAccountHolder", "الحساب البنكي — اسم صاحب الحساب"],
              ] as const).map(([key, label]) => (
                <label key={key} style={{ display: "block" }}>
                  <span style={{ display: "block", color: "hsl(var(--muted-foreground))", fontSize: 12, marginBottom: 6 }}>{label}</span>
                  <input
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    style={{ width: "100%", background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "10px 12px", color: "hsl(var(--foreground))", fontSize: 13, outline: "none" }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: "1px solid hsl(var(--border))",
                background: tab === key ? "hsl(var(--foreground))" : "transparent",
                color: tab === key ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: "hsl(var(--muted-foreground))" }}>جاري التحميل...</p> : <DataTable rows={rows} onDelete={deleteRow} onEdit={setEditRow} />}
      </div>

      {editRow && <EditModal row={editRow} onClose={() => setEditRow(null)} onSave={saveEdit} />}
    </div>
  );
}
