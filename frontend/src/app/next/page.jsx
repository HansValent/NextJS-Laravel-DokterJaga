"use client"

import { useState, useRef, useEffect } from "react";

const ALL_EMPLOYEES = [
  { id: 1, name: "dr. Robert Sinto", spec: "SpPD", initials: "RS", position: "Doctor" },
  { id: 2, name: "dr. Hendra K.", spec: "MBiomed, SpPD", initials: "HK", position: "Doctor" },
  { id: 3, name: "dr. Aurelia Saraswati", spec: "Dokter Jaga", initials: "AS", position: "Doctor" },
  { id: 4, name: "dr. Melina Gazali", spec: "Dokter Jaga", initials: "MG", position: "Doctor" },
  { id: 5, name: "dr. Ivanna T. Setijanto", spec: "SpOG, MPH", initials: "IS", position: "Doctor" },
  { id: 6, name: "dr. A.M. Onny Witjaksono", spec: "SpJP", initials: "AO", position: "Doctor" },
  { id: 7, name: "dr. Andika C. P.", spec: "SpP, FAPSR", initials: "AC", position: "Doctor" },
  { id: 8, name: "dr. Yanni", spec: "SpS", initials: "YN", position: "Doctor" },
  { id: 9, name: "dr. Stevanus Ingwantoro", spec: "SpKJ", initials: "SI", position: "Doctor" },
  { id: 10, name: "dr. Regina Talitha Rosa", spec: "SpTHT-BKL", initials: "RT", position: "Doctor" },
  { id: 11, name: "dr. Ria Yoanita", spec: "SpA", initials: "RY", position: "Doctor" },
  { id: 12, name: "dr. Hardjo Prawira", spec: "SpPD-KKV", initials: "HP", position: "Doctor" },
  { id: 13, name: "Ns. I Made Suraya", spec: "SKep", initials: "NS", position: "Nurse" },
  { id: 14, name: "dr. Purnawati", spec: "Radiologi", initials: "PW", position: "Doctor" },
  { id: 15, name: "dr. Daniel W.", spec: "SpB", initials: "DW", position: "Doctor" },
  { id: 16, name: "dr. Wawolumaja", spec: "SpB", initials: "WW", position: "Doctor" },
  { id: 17, name: "dr. Budi Santoso", spec: "SpOT", initials: "BS", position: "Doctor" },
  { id: 18, name: "dr. Agus Prasetyo", spec: "SpOT", initials: "AP", position: "Doctor" },
  { id: 19, name: "Ns. Maria Lestari", spec: "SKep, Ners", initials: "ML", position: "Nurse" },
  { id: 20, name: "Ns. Dewi Anggraini", spec: "SKep", initials: "DA", position: "Nurse" },
  { id: 21, name: "dr. Farida Noor", spec: "SpAn", initials: "FN", position: "Doctor" },
  { id: 22, name: "dr. Cahyo Wibowo", spec: "SpPD-KGEH", initials: "CW", position: "Doctor" },
];

const SCHEDULE_PARTS = [
  { id: 1, name: "Penyakit Dalam", color: "#127F3F", icon: "\u{1FA7A}" },
  { id: 2, name: "Orthopedi", color: "#569A45", icon: "\u{1F9B4}" },
  { id: 3, name: "Jaga Bangsal", color: "#73B045", icon: "\u{1F3E5}" },
  { id: 4, name: "IGD Pagi", color: "#D42027", icon: "\u{1F6A8}" },
  { id: 5, name: "IGD Sore", color: "#B72227", icon: "\u{1F305}" },
  { id: 6, name: "IGD Malam", color: "#8B1A1F", icon: "\u{1F319}" },
  { id: 7, name: "ICU", color: "#1a4fa0", icon: "\u{1F489}" },
  { id: 8, name: "Bedah Umum", color: "#2C5F2D", icon: "\u{1FA78}" },
  { id: 9, name: "Kebidanan & Kandungan", color: "#997A3D", icon: "\u{1F476}" },
];

const initPartMap = () => ({
  1: [1, 2, 12, 22],
  2: [17, 18, 15],
  3: [3, 4, 13, 19, 20],
  4: [3, 4, 13, 19],
  5: [3, 4, 20],
  6: [3, 4, 13],
  7: [6, 12, 21],
  8: [15, 16],
  9: [5],
});

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function isWeekend(y, m, d) { const w = new Date(y, m, d).getDay(); return w === 0 || w === 6; }

const initSchedule = (pm) => {
  const s = {};
  SCHEDULE_PARTS.forEach(p => {
    s[p.id] = {};
    for (let d = 1; d <= 30; d++) {
      const pool = (pm[p.id] || []).map(eid => ALL_EMPLOYEES.find(e => e.id === eid)).filter(Boolean);
      if (p.id === 1 && d <= 3 && pool.length > 0) s[p.id][d] = [{ ...pool[0] }];
      else if (p.id === 4 && d <= 2 && pool.length >= 2) s[p.id][d] = [{ ...pool[0] }, { ...pool[1] }];
      else s[p.id][d] = [];
    }
  });
  return s;
};

function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", icon: "\u{1F4CA}", label: "Dashboard" },
    { id: "schedule", icon: "\u{1F4C5}", label: "Input Jadwal" },
    { id: "mapping", icon: "\u{1F517}", label: "Mapping Karyawan" },
    { id: "master", icon: "\u{1F3E5}", label: "Master Data" },
    { id: "employee", icon: "\u{1F468}\u200D\u2695\uFE0F", label: "Karyawan" },
    { id: "audit", icon: "\u{1F4CB}", label: "Audit Trail" },
  ];
  return (
    <div style={{ width: 210, background: "#127F3F", minHeight: "100%", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>{"\u271A"}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>RS St. Carolus</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 600 }}>Admin Panel</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 6px", flex: 1 }}>
        {items.map(it => (
          <div key={it.id} onClick={() => setActive(it.id)} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 7, cursor: "pointer", marginBottom: 1, fontSize: 12, fontWeight: 600, transition: "all 0.15s",
            background: active === it.id ? "rgba(255,255,255,0.18)" : "transparent",
            color: active === it.id ? "#fff" : "rgba(255,255,255,0.72)",
          }}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{it.icon}</span>{it.label}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>AD</div>
          <div>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Admin UGD</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9 }}>admin@rs-carolus.id</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorPill({ doc, onRemove, small }) {
  const isNurse = doc.position === "Nurse";
  const c = isNurse ? { bg: "#e6f0ff", border: "#b5d4f4", text: "#1a4fa0", grad: "linear-gradient(135deg,#1a4fa0,#3b82f6)" } : { bg: "#e8f5ec", border: "#b8dbb8", text: "#127F3F", grad: "linear-gradient(135deg,#569A45,#99CA51)" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 5px 2px 2px", background: c.bg, borderRadius: 12, fontSize: small ? 9 : 10, fontWeight: 600, color: c.text, border: "1px solid " + c.border, maxWidth: "100%" }}>
      <div style={{ width: small ? 15 : 18, height: small ? 15 : 18, borderRadius: "50%", background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: small ? 6 : 7, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{doc.initials}</div>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name.replace("dr. ", "").replace("Ns. ", "")}</span>
      {onRemove && <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ cursor: "pointer", marginLeft: 1, color: "#999", fontSize: 11, lineHeight: 1, flexShrink: 0 }}>{"\u00D7"}</span>}
    </div>
  );
}

function DoctorDropdown({ onSelect, exclude = [], eligible = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const pool = eligible.length > 0 ? ALL_EMPLOYEES.filter(d => eligible.includes(d.id)) : ALL_EMPLOYEES;
  const filtered = pool.filter(d => !exclude.includes(d.id) && d.name.toLowerCase().includes(search.toLowerCase()));
  const nonEligible = eligible.length > 0 ? ALL_EMPLOYEES.filter(d => !eligible.includes(d.id) && !exclude.includes(d.id) && d.name.toLowerCase().includes(search.toLowerCase())) : [];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px dashed #b8dbb8", background: "transparent", cursor: "pointer", fontSize: 12, color: "#127F3F", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
      {open && (
        <div style={{ position: "absolute", top: 24, left: 0, zIndex: 100, width: 260, background: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.14)", overflow: "hidden" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari dokter/paramedis..." autoFocus style={{ width: "100%", padding: "8px 12px", border: "none", borderBottom: "1px solid #eee", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
          <div style={{ maxHeight: 220, overflow: "auto" }}>
            {filtered.length > 0 && eligible.length > 0 && (
              <div style={{ padding: "6px 10px 2px", fontSize: 9, fontWeight: 700, color: "#127F3F", textTransform: "uppercase", letterSpacing: 1 }}>Eligible untuk bagian ini</div>
            )}
            {filtered.map(d => (
              <div key={d.id} onClick={() => { onSelect(d); setOpen(false); setSearch(""); }}
                style={{ padding: "7px 12px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f5f5f5" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0faf3"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: d.position === "Nurse" ? "linear-gradient(135deg,#1a4fa0,#3b82f6)" : "linear-gradient(135deg,#569A45,#99CA51)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{d.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "#1A2E1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: "#6A8A6A" }}>{d.spec} {"\u00B7"} {d.position}</div>
                </div>
              </div>
            ))}
            {eligible.length > 0 && nonEligible.length > 0 && (
              <>
                <div style={{ padding: "8px 10px 2px", fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, borderTop: "1px solid #eee" }}>Tidak di-mapping (perlu ditambah dulu)</div>
                {nonEligible.slice(0, 4).map(d => (
                  <div key={d.id} style={{ padding: "7px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 8, opacity: 0.4, borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#999", fontWeight: 700, flexShrink: 0 }}>{d.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#999" }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: "#bbb" }}>{d.spec}</div>
                    </div>
                    <span style={{ fontSize: 8, color: "#cc8800", background: "#fff8e1", padding: "2px 5px", borderRadius: 3, fontWeight: 600 }}>Belum mapped</span>
                  </div>
                ))}
              </>
            )}
            {filtered.length === 0 && nonEligible.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "#999", textAlign: "center" }}>Tidak ditemukan</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function MappingView({ partMap, setPartMap }) {
  const [activePart, setActivePart] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const part = SCHEDULE_PARTS.find(p => p.id === activePart);
  const mapped = (partMap[activePart] || []).map(eid => ALL_EMPLOYEES.find(e => e.id === eid)).filter(Boolean);
  const unmapped = ALL_EMPLOYEES.filter(e => !(partMap[activePart] || []).includes(e.id));
  const filteredUnmapped = unmapped.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const addToMap = (empId) => setPartMap(prev => ({ ...prev, [activePart]: [...(prev[activePart] || []), empId] }));
  const removeFromMap = (empId) => setPartMap(prev => ({ ...prev, [activePart]: (prev[activePart] || []).filter(id => id !== empId) }));

  return (
    <div style={{ flex: 1, overflow: "auto", background: "#f4f8f4" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A2E1A", margin: 0 }}>Mapping Karyawan per Bagian KSM</h2>
        <p style={{ fontSize: 12, color: "#6A8A6A", margin: "2px 0 0" }}>Tentukan dokter/paramedis yang eligible untuk setiap bagian jadwal</p>
      </div>
      <div style={{ display: "flex", height: "calc(100% - 70px)" }}>
        <div style={{ width: 240, borderRight: "1px solid #e5e5e5", background: "#fff", overflow: "auto", flexShrink: 0 }}>
          <div style={{ padding: "10px 10px 6px", fontSize: 9, fontWeight: 700, color: "#6A8A6A", textTransform: "uppercase", letterSpacing: 1 }}>Bagian Jadwal</div>
          {SCHEDULE_PARTS.map(p => {
            const count = (partMap[p.id] || []).length;
            return (
              <div key={p.id} onClick={() => { setActivePart(p.id); setShowAdd(false); setSearch(""); }}
                style={{ padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.12s", background: activePart === p.id ? p.color + "10" : "transparent", borderLeft: activePart === p.id ? "3px solid " + p.color : "3px solid transparent" }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activePart === p.id ? p.color : "#1A2E1A" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "#6A8A6A" }}>{count} karyawan</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, background: count > 0 ? p.color + "20" : "#f0f0f0", color: count > 0 ? p.color : "#999" }}>{count}</div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{part.icon}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: part.color, margin: 0 }}>{part.name}</h3>
                <p style={{ fontSize: 11, color: "#6A8A6A", margin: 0 }}>{mapped.length} karyawan eligible</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "7px 14px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: showAdd ? "#fce8e8" : part.color, color: showAdd ? "#D42027" : "#fff" }}>
              {showAdd ? "\u2715 Tutup" : "+ Tambah Karyawan"}
            </button>
          </div>
          {showAdd && (
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari karyawan untuk ditambahkan..." style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d4e4d4", fontSize: 12, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflow: "auto" }}>
                {filteredUnmapped.map(e => (
                  <div key={e.id} onClick={() => { addToMap(e.id); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 5px", background: "#f9f9f9", border: "1px dashed #ccc", borderRadius: 8, fontSize: 11, cursor: "pointer", transition: "all 0.12s" }}
                    onMouseEnter={ev => { ev.currentTarget.style.background = "#e8f5ec"; ev.currentTarget.style.borderColor = "#127F3F"; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = "#f9f9f9"; ev.currentTarget.style.borderColor = "#ccc"; }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700, flexShrink: 0, background: e.position === "Nurse" ? "linear-gradient(135deg,#1a4fa0,#3b82f6)" : "linear-gradient(135deg,#569A45,#99CA51)" }}>{e.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1A2E1A" }}>{e.name}</div>
                      <div style={{ fontSize: 9, color: "#6A8A6A" }}>{e.spec} {"\u00B7"} {e.position}</div>
                    </div>
                    <span style={{ marginLeft: 4, color: "#127F3F", fontWeight: 700, fontSize: 14 }}>+</span>
                  </div>
                ))}
                {filteredUnmapped.length === 0 && <div style={{ padding: 8, fontSize: 12, color: "#999" }}>Semua karyawan sudah di-assign</div>}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {mapped.map(emp => (
              <div key={emp.id} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0, background: emp.position === "Nurse" ? "linear-gradient(135deg,#1a4fa0,#3b82f6)" : "linear-gradient(135deg,#569A45,#99CA51)" }}>{emp.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1A2E1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                  <div style={{ fontSize: 10, color: "#6A8A6A" }}>{emp.spec}</div>
                </div>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, background: emp.position === "Doctor" ? "#e8f5ec" : "#e6f0ff", color: emp.position === "Doctor" ? "#127F3F" : "#1a4fa0", border: "1px solid " + (emp.position === "Doctor" ? "#b8dbb8" : "#b5d4f4") }}>{emp.position}</span>
                <button onClick={() => removeFromMap(emp.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fcc", background: "#fff", cursor: "pointer", fontSize: 12, color: "#D42027", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{"\u00D7"}</button>
              </div>
            ))}
          </div>
          {mapped.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u261D"}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Belum ada karyawan di-assign</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>Klik "Tambah Karyawan" untuk mapping</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleGrid({ partMap }) {
  const [schedule, setSchedule] = useState(() => initSchedule(partMap));
  const [activePart, setActivePart] = useState(1);
  const [month] = useState(3);
  const [year] = useState(2026);
  const [copySource, setCopySource] = useState(null);
  const [toast, setToast] = useState(null);

  const daysCount = getDaysInMonth(year, month);
  const partData = schedule[activePart] || {};
  const part = SCHEDULE_PARTS.find(p => p.id === activePart);
  const eligible = partMap[activePart] || [];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const addDoctor = (day, doc) => {
    setSchedule(prev => { const n = { ...prev }; n[activePart] = { ...n[activePart] }; n[activePart][day] = [...(n[activePart][day] || []), { ...doc }]; return n; });
    showToast(doc.name + " \u2192 tgl " + day);
  };
  const removeDoctor = (day, docId) => {
    setSchedule(prev => { const n = { ...prev }; n[activePart] = { ...n[activePart] }; n[activePart][day] = (n[activePart][day] || []).filter(d => d.id !== docId); return n; });
  };
  const copyDay = (day) => { setCopySource(day); showToast("Tgl " + day + " di-copy"); };
  const pasteDay = (day) => {
    if (!copySource) return;
    setSchedule(prev => { const n = { ...prev }; n[activePart] = { ...n[activePart] }; n[activePart][day] = [...(prev[activePart][copySource] || [])]; return n; });
    showToast("Paste ke tgl " + day);
  };
  const copyWeek = () => {
    const src = {};
    for (let i = 0; i < 7 && 1 + i <= daysCount; i++) src[i] = [...(partData[1 + i] || [])];
    setSchedule(prev => { const n = { ...prev }; n[activePart] = { ...n[activePart] }; for (let i = 0; i < 7 && 8 + i <= daysCount; i++) n[activePart][8 + i] = [...(src[i] || [])]; return n; });
    showToast("Minggu 1 di-copy ke minggu 2");
  };

  const filledCount = Object.values(partData).filter(v => v && v.length > 0).length;
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #e5e5e5", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A2E1A", margin: 0 }}>Input Jadwal Dokter Jaga</h2>
          <p style={{ fontSize: 11, color: "#6A8A6A", margin: "2px 0 0" }}>Jadwal Dokter Jaga IGD {"\u2014"} {monthNames[month]} {year}</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={copyWeek} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d4e4d4", background: "#fff", fontSize: 11, fontWeight: 600, color: "#3A5A3A", cursor: "pointer" }}>{"\u{1F4CB}"} Copy Minggu</button>
          <button style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#127F3F", fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>{"\u{1F4BE}"} Simpan</button>
        </div>
      </div>
      <div style={{ padding: "10px 24px 0", background: "#fff", borderBottom: "1px solid #e5e5e5", display: "flex", gap: 3, overflowX: "auto" }}>
        {SCHEDULE_PARTS.map(p => {
          const cnt = (partMap[p.id] || []).length;
          return (
            <button key={p.id} onClick={() => setActivePart(p.id)} style={{
              padding: "7px 12px", borderRadius: "7px 7px 0 0", border: "1px solid " + (activePart === p.id ? p.color : "#e5e5e5"),
              borderBottom: activePart === p.id ? "2px solid " + p.color : "1px solid #e5e5e5",
              background: activePart === p.id ? p.color + "10" : "#f9f9f9",
              fontSize: 10, fontWeight: 700, color: activePart === p.id ? p.color : "#888",
              cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4,
            }}>
              {p.icon} {p.name}
              <span style={{ fontSize: 9, background: activePart === p.id ? p.color + "25" : "#eee", color: activePart === p.id ? p.color : "#999", padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>{cnt}</span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: "8px 24px", background: "#f4f8f4", display: "flex", gap: 14, alignItems: "center", borderBottom: "1px solid #e5e5e5", fontSize: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: part.color }}></div>
          <span style={{ fontWeight: 700, color: part.color }}>{part.name}</span>
        </div>
        <span style={{ color: "#6A8A6A" }}><b style={{ color: "#127F3F" }}>{filledCount}</b>/{daysCount} terisi</span>
        <div style={{ flex: 1, height: 3, background: "#ddd", borderRadius: 2 }}>
          <div style={{ width: (filledCount / daysCount * 100) + "%", height: "100%", background: part.color, borderRadius: 2, transition: "width 0.3s" }}></div>
        </div>
        <span style={{ fontWeight: 700, color: part.color }}>{Math.round(filledCount / daysCount * 100)}%</span>
        <div style={{ borderLeft: "1px solid #ddd", paddingLeft: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#6A8A6A" }}>Pool:</span>
          {eligible.length > 0 ? (
            <div style={{ display: "flex", gap: 2 }}>
              {eligible.slice(0, 4).map(eid => { const emp = ALL_EMPLOYEES.find(e => e.id === eid); return emp ? <div key={eid} title={emp.name} style={{ width: 18, height: 18, borderRadius: "50%", background: emp.position === "Nurse" ? "linear-gradient(135deg,#1a4fa0,#3b82f6)" : "linear-gradient(135deg,#569A45,#99CA51)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700, border: "1.5px solid #fff" }}>{emp.initials}</div> : null; })}
              {eligible.length > 4 && <span style={{ fontSize: 10, color: "#999", fontWeight: 600 }}>+{eligible.length - 4}</span>}
            </div>
          ) : <span style={{ color: "#cc8800", fontWeight: 600, fontSize: 10 }}>Belum ada mapping</span>}
        </div>
        {copySource && <span style={{ fontSize: 9, padding: "2px 7px", background: "#fff3cd", borderRadius: 4, color: "#856404", fontWeight: 600 }}>{"\u{1F4CB}"} Tgl {copySource}</span>}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 24px 20px" }}>
        {eligible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>{"\u{1F517}"}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2E1A" }}>Belum ada karyawan di-mapping</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "#6A8A6A" }}>Buka menu "Mapping Karyawan" untuk assign dokter/paramedis ke bagian <b>{part.name}</b></div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 5 }}>
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "#6A8A6A", padding: "3px 0", textTransform: "uppercase", letterSpacing: 1 }}>{d}</div>
            ))}
            {(() => {
              const fow = new Date(year, month, 1).getDay();
              const offset = fow === 0 ? 6 : fow - 1;
              const cells = [];
              for (let i = 0; i < offset; i++) cells.push(<div key={"e" + i}></div>);
              for (let day = 1; day <= daysCount; day++) {
                const docs = partData[day] || [];
                const we = isWeekend(year, month, day);
                const today = day === 1;
                cells.push(
                  <div key={day} style={{ minHeight: 80, border: today ? "2px solid " + part.color : "1px solid " + (docs.length > 0 ? "#b8dbb8" : "#e5e5e5"), borderRadius: 7, padding: 5, background: docs.length > 0 ? "#f0faf3" : we ? "#fafafa" : "#fff", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: today ? part.color : we ? "#D42027" : "#1A2E1A" }}>{day}</span>
                      <div style={{ display: "flex", gap: 1 }}>
                        <button onClick={() => copyDay(day)} title="Copy" style={{ width: 16, height: 16, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", fontSize: 9, color: "#999", padding: 0 }}>{"\u{1F4CB}"}</button>
                        {copySource && <button onClick={() => pasteDay(day)} title="Paste" style={{ width: 16, height: 16, borderRadius: 3, border: "none", background: "#fff3cd", cursor: "pointer", fontSize: 9, color: "#856404", padding: 0 }}>{"\u{1F4CC}"}</button>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {docs.map(doc => <DoctorPill key={doc.id} doc={doc} onRemove={() => removeDoctor(day, doc.id)} small />)}
                      <DoctorDropdown onSelect={(doc) => addDoctor(day, doc)} exclude={docs.map(d => d.id)} eligible={eligible} />
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        )}
      </div>
      {toast && <div style={{ position: "fixed", bottom: 16, right: 16, padding: "8px 16px", background: "#127F3F", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 999 }}>{toast}</div>}
    </div>
  );
}

function DashboardView({ partMap }) {
  const stats = [
    { label: "Bertugas Hari Ini", value: 13, color: "#127F3F" },
    { label: "Belum Terisi", value: 10, color: "#D42027" },
    { label: "Total Unit", value: 23, color: "#1a4fa0" },
    { label: "Total Mapped", value: Object.values(partMap).reduce((a, b) => a + b.length, 0), color: "#569A45" },
  ];
  return (
    <div style={{ flex: 1, overflow: "auto", background: "#f4f8f4" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A2E1A", margin: 0 }}>Dashboard</h2>
        <p style={{ fontSize: 11, color: "#6A8A6A", margin: "2px 0 0" }}>Overview jadwal dan mapping {"\u2014"} April 2026</p>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: 14, border: "1px solid #e5e5e5" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6A8A6A", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 3 }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 8, padding: 14, border: "1px solid #e5e5e5" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1A2E1A", margin: "0 0 10px" }}>Status Mapping per KSM</h3>
          {SCHEDULE_PARTS.map(p => {
            const cnt = (partMap[p.id] || []).length;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1A2E1A" }}>{p.name}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {(partMap[p.id] || []).slice(0, 5).map(eid => { const emp = ALL_EMPLOYEES.find(e => e.id === eid); return emp ? <div key={eid} title={emp.name} style={{ width: 20, height: 20, borderRadius: "50%", background: emp.position === "Nurse" ? "#3b82f6" : "#569A45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700 }}>{emp.initials}</div> : null; })}
                  {cnt > 5 && <span style={{ fontSize: 9, color: "#999", fontWeight: 600, lineHeight: "20px" }}>+{cnt - 5}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: cnt > 0 ? "#127F3F" : "#D42027", minWidth: 24, textAlign: "right" }}>{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmployeeView() {
  const [search, setSearch] = useState("");
  const filtered = ALL_EMPLOYEES.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ flex: 1, overflow: "auto", background: "#f4f8f4" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e5e5", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A2E1A", margin: 0 }}>Data Karyawan</h2>
          <p style={{ fontSize: 11, color: "#6A8A6A", margin: "2px 0 0" }}>{ALL_EMPLOYEES.length} karyawan terdaftar</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d4e4d4", fontSize: 11, width: 180, outline: "none" }} />
          <button style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#127F3F", fontSize: 11, fontWeight: 600, color: "#fff", cursor: "pointer" }}>+ Tambah</button>
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {filtered.map(d => (
            <div key={d.id} style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0, background: d.position === "Nurse" ? "linear-gradient(135deg,#1a4fa0,#3b82f6)" : "linear-gradient(135deg,#569A45,#99CA51)" }}>{d.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1A2E1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ fontSize: 10, color: "#6A8A6A" }}>{d.spec} {"\u00B7"} <span style={{ color: d.position === "Nurse" ? "#1a4fa0" : "#127F3F", fontWeight: 600 }}>{d.position}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("mapping");
  const [partMap, setPartMap] = useState(initPartMap);
  return (
    <div style={{ display: "flex", height: "92vh", fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#f4f8f4", borderRadius: 10, overflow: "hidden", border: "1px solid #ddd" }}>
      <Sidebar active={activePage} setActive={setActivePage} />
      {activePage === "dashboard" && <DashboardView partMap={partMap} />}
      {activePage === "schedule" && <ScheduleGrid partMap={partMap} />}
      {activePage === "mapping" && <MappingView partMap={partMap} setPartMap={setPartMap} />}
      {activePage === "employee" && <EmployeeView />}
      {!["dashboard", "schedule", "mapping", "employee"].includes(activePage) && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6A8A6A", fontSize: 13 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>{"\u{1F6A7}"}</div>
            <div style={{ fontWeight: 700 }}>Halaman dalam pengembangan</div>
          </div>
        </div>
      )}
    </div>
  );
}
