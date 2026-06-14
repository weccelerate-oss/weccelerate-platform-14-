'use client';
/* eslint-disable */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";

// ===== TYPES =====
type Photo = { id: number; name: string; data: string; type: string; room: string };
type Finding = { location: string; description: string; severity: string; defect_type: string };
type Recommendation = { location: string; action: string; annex_needed: string | null };
type CostItem = { description: string; estimated_cost: number };
type Annex = { id: string; name: string; trigger: string; keywords: string[]; steps: string };
type Expert = { id: string; name: string; role: string; education: string; experience: string };
type FindingsObj = {
  findings?: Finding[];
  case_description?: string;
  building_type?: string;
  recommendations?: Recommendation[];
  cost_items?: CostItem[];
  matchedAnnexes?: Annex[];
  expert?: Expert;
  approver?: Expert;
};
type InspectionData = {
  id?: number | string;
  clientName: string;
  address: string;
  callNumber: string;
  buildingType: string;
  expert: string;
  approver: string;
  date: string;
  notes: string;
  photos: Photo[];
  findings: FindingsObj | null;
  report: unknown;
  status?: string;
};

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// ===== CONSTANTS & DATA =====
const EXPERTS = [
  { id: "tal_y", name: "טל יהודה", role: "מנכ\"ל, מאשר חוו\"ד", education: "מהנדס בניין B.Sc - אוניברסיטת בן גוריון", experience: "מרצה במכללת בילדינג, מרצה במכון התקנים, מרצה באיגוד המהנדסים" },
  { id: "nir_y", name: "ניר יהודה", role: "מומחה בודק + מאשר", education: "סוקר תרמי מוסמך רמה 1, קבלן אינסטלציה מוסמך, אוטם מורשה", experience: "14+ שנות ניסיון, 50,000+ דירות ומבנים" },
  { id: "adi_b", name: "עדי בלס", role: "מומחה בודק", education: "מהנדס בניין B.Sc - אוניברסיטת בן גוריון, סוקר תרמי מוסמך", experience: "מהנדס חברת אינפרטק, מרצה במכללת בילדינג, מרצה במכון התקנים" },
  { id: "tal_b", name: "טל בייליס", role: "מומחה בודק", education: "סוקר תרמי מוסמך, קבלן אינסטלציה, אוטם מורשה, שמאי רכוש", experience: "14+ שנים באבחון תרמוגרפי, 50,000+ ביקורות" },
];

const ANNEXES = [
  { id: "a1", name: "טיפול מערכתי - מקלחון", trigger: "רטיבות + חדר רחצה + מקלחון", keywords: ["מקלחון", "מקלחת", "איטום תת רצפתי", "חדר רחצה"], steps: "פירוק ריצוף, איטום היפר דסמו PB, הצפה 72 שעות, ריצוף מחדש" },
  { id: "a2", name: "טיפול מערכתי - אמבטיה", trigger: "רטיבות + חדר רחצה + אמבטיה", keywords: ["אמבטיה", "איטום", "מפגש קיר"], steps: "פירוק ריצוף+חיפוי, פריימר אקוודור, איטום, חגורת חציצה" },
  { id: "a3", name: "טיפול מערכתי - גג עליון", trigger: "נזילה + גג שטוח", keywords: ["גג", "גג עליון", "יריעה ביטומנית", "מרזב"], steps: "כיסוי מרזבים, ניקוי גג, בדיקת קולטנים, יריעות ביטומניות" },
  { id: "a4", name: "טיפול מערכתי - מרפסות", trigger: "רטיבות + מרפסת", keywords: ["מרפסת", "ריצוף מרפסת", "שיפוע"], steps: "עקירת ריצוף, שיפועים, איטום ביטומני, בדיקת ניקוז" },
  { id: "a5", name: "ניקוז כפול", trigger: "ניקוז לקוי / הצפה", keywords: ["ניקוז", "הצפה", "ניקוז כפול"], steps: "התקנת מערכת ניקוז כפול למניעת הצפות" },
  { id: "a6", name: "סף דלת - חיץ אטימה", trigger: "חדירת מים דרך סף / פתח", keywords: ["סף", "דלת", "חיץ אטימה", "סף מוגבה"], steps: "התקנת סף מוגבה + חיץ אטימה" },
  { id: "a7", name: "איטום קירות יסוד", trigger: "קיר חיצוני + רטיבות עולה", keywords: ["קיר יסוד", "קיר חיצוני", "רטיבות עולה", "ממברנה"], steps: "חפירה, פריימר, ממברנה פוליאורטנית, הגנת קלקר" },
];

const DEFECT_TYPES = [
  { id: "seal", name: "כשל איטום", icon: "💧", color: "#3498db" },
  { id: "plumb_hot", name: "נזילת מים חמים", icon: "🔴", color: "#e74c3c" },
  { id: "plumb_cold", name: "נזילת מים קרים", icon: "🔵", color: "#2980b9" },
  { id: "drain", name: "כשל דלוחין/שופכין", icon: "🟤", color: "#8B4513" },
  { id: "drainage", name: "בעיית ניקוז", icon: "🌊", color: "#1abc9c" },
  { id: "roof", name: "נזילת גג", icon: "🏠", color: "#9b59b6" },
];

const PRICE_LIST = {
  "טיפול מערכתי חדר רחצה ילדים": 44000,
  "טיפול מערכתי חדר רחצה הורים": 39000,
  "טיפול מערכתי חדר רחצה + כביסה": 52000,
  "טיפול מערכתי גג": 35000,
  "טיפול מערכתי מרפסת": 28000,
  "תיקוני טיח וצבע": 2200,
  "תיקוני טיח וצבע (גרם מדרגות)": 500,
  "החלפת צנרת מים קרים": 8000,
  "החלפת צנרת מים חמים": 9500,
  "תיקון ניקוז כפול": 6500,
  "איטום קיר יסוד": 25000,
  "איטום סף דלת": 3500,
};

// ===== AI PROCESSING =====
async function processWithAI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const res = await fetch("/api/infratech-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "שגיאה בעיבוד";
  } catch (e) {
    return "שגיאה בחיבור ל-AI: " + (e instanceof Error ? e.message : String(e));
  }
}

async function processFieldNotes(rawText: string, defectType: string): Promise<string> {
  const sys = `אתה מנוע עיבוד שפה של מערכת אינפרטק לאבחון ליקויי בנייה. 
תפקידך: לקחת תיאור גולמי (כפי שנאמר בשטח ע"י בודק) ולנסח אותו מחדש בשפה הנדסית-משפטית מקצועית.

כללי ניסוח:
- שפה פורמלית, הנדסית ומשפטית
- שימוש במונחים תקניים: "צנרת דלוחין", "חגורת הפרדה", "בדיקת הצפה", "איטום תת-רצפתי", "סריקה תרמית", "מד לחות"
- ציון ממצאים בצורה עובדתית ומדויקת
- הפניה לתקן ישראלי 1476 כשרלוונטי
- ציון כלי הבדיקה ששימשו (מצלמה תרמית FLUKE Ti400, מד לחות Protimeter Surveymaster, מצלמת צנרת RIDGID)

פורמט הפלט (JSON):
{
  "findings": [
    {
      "location": "שם החדר/אזור",
      "description": "תיאור מקצועי של הממצא",
      "severity": "חמור/בינוני/קל",
      "defect_type": "סוג הכשל"
    }
  ],
  "case_description": "תיאור כללי של המקרה בשפה מקצועית",
  "building_type": "סוג המבנה",
  "recommendations": [
    {
      "location": "אזור",
      "action": "המלצה מפורטת לתיקון",
      "annex_needed": "שם הנספח הרלוונטי או null"
    }
  ],
  "cost_items": [
    {
      "description": "תיאור סעיף",
      "estimated_cost": מספר
    }
  ]
}

החזר JSON בלבד, ללא backticks או markdown.`;

  return await processWithAI(rawText, sys);
}

// ===== COMPONENTS =====

// Sidebar Navigation
function Sidebar({ active, onNav, inspectionCount }: { active: string; onNav: (id: string) => void; inspectionCount: number }) {
  const { t, dir } = useLanguage();
  const items = [
    { id: "dashboard", icon: "📊", label: t("infratech.sidebar.dashboard") },
    { id: "new", icon: "➕", label: t("infratech.sidebar.new") },
    { id: "annexes", icon: "📎", label: t("infratech.sidebar.annexes") },
    { id: "prices", icon: "💰", label: t("infratech.sidebar.prices") },
    { id: "experts", icon: "👷", label: t("infratech.sidebar.experts") },
  ];
  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "linear-gradient(180deg, #0a1628 0%, #132743 100%)",
      color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0,
      [dir === "rtl" ? "borderLeft" : "borderRight"]: "1px solid rgba(255,255,255,0.06)",
      fontFamily: "'Noto Sans Hebrew', 'Segoe UI', sans-serif",
    }}>
      <div style={{ padding: "28px 20px 24px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: "#5dade2" }}>INFRATECH</div>
        <div style={{ fontSize: 11, color: "#7fb3d8", marginTop: 4, letterSpacing: 1.5 }}>{t("infratech.sidebar.tagline")}</div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "12px 14px", marginBottom: 4, border: "none", borderRadius: 10, cursor: "pointer",
            background: active === it.id ? "rgba(93,173,226,0.15)" : "transparent",
            color: active === it.id ? "#5dade2" : "#8eafc4",
            fontSize: 14, fontWeight: active === it.id ? 700 : 500,
            direction: dir, textAlign: dir === "rtl" ? "right" : "left", transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { if (active !== it.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { if (active !== it.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            <span>{it.label}</span>
            {it.id === "dashboard" && inspectionCount > 0 && (
              <span style={{
                marginInlineStart: "auto", background: "#5dade2", color: "#0a1628",
                borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700,
              }}>{inspectionCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#4a6580", textAlign: "center" }}>
        {t("infratech.sidebar.version")}
      </div>
    </div>
  );
}

// Voice Recorder
function VoiceRecorder({ onTranscript }: { onTranscript: (t: string) => void }) {
  const { t, dir } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (e: any) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setTranscript(t);
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
    setRecording(true);
    setElapsed(0);
    intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (transcript) onTranscript(transcript);
  };

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{
      background: recording ? "linear-gradient(135deg, #1a0a0a, #2a1515)" : "linear-gradient(135deg, #f8fafe, #eef4fb)",
      borderRadius: 16, padding: 28, textAlign: "center",
      border: recording ? "2px solid #e74c3c" : "2px solid #d6e9f8",
      transition: "all 0.3s",
    }}>
      <div style={{ fontSize: 13, color: recording ? "#e74c3c" : "#5b7a94", marginBottom: 12, fontWeight: 600 }}>
        {recording ? t("infratech.voice.recording") : t("infratech.voice.idle")}
      </div>
      {recording && (
        <div style={{ fontSize: 36, fontWeight: 300, color: "#e74c3c", fontFamily: "monospace", marginBottom: 16 }}>
          {fmt(elapsed)}
        </div>
      )}
      <button onClick={recording ? stopRecording : startRecording} style={{
        padding: "14px 36px", borderRadius: 30, border: "none", cursor: "pointer",
        background: recording ? "#e74c3c" : "#1a5276",
        color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
        boxShadow: recording ? "0 0 20px rgba(231,76,60,0.3)" : "0 4px 15px rgba(26,82,118,0.3)",
        transition: "all 0.2s",
      }}>
        {recording ? t("infratech.voice.stop") : t("infratech.voice.start")}
      </button>
      {transcript && (
        <div style={{
          marginTop: 16, padding: 16, background: "rgba(255,255,255,0.9)", borderRadius: 12,
          direction: dir, textAlign: dir === "rtl" ? "right" : "left", fontSize: 14, color: "#2c3e50",
          border: "1px solid #e0e8ef", maxHeight: 120, overflow: "auto",
        }}>
          <div style={{ fontSize: 11, color: "#7f8c8d", marginBottom: 6 }}>{t("infratech.voice.liveTranscript")}</div>
          {transcript}
        </div>
      )}
    </div>
  );
}

// Photo Manager
function PhotoManager({ photos, onAdd, onRemove }: { photos: Photo[]; onAdd: (p: Photo) => void; onRemove: (id: number) => void }) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => onAdd({ id: Date.now() + Math.random(), name: f.name, data: String(ev.target?.result ?? ''), type: "דיגיטלי", room: "" });
      reader.readAsDataURL(f);
    });
  };
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => fileRef.current?.click()} style={{
          width: 110, height: 110, borderRadius: 14, border: "2px dashed #b0c8de",
          background: "#f0f6fb", cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "#5b7a94",
          fontFamily: "inherit", transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <span>{t("infratech.photo.add")}</span>
        </button>
        {photos.map((ph: Photo, i: number) => (
          <div key={ph.id} style={{ position: "relative", width: 110, height: 110, borderRadius: 14, overflow: "hidden", border: "2px solid #d6e9f8" }}>
            <img src={ph.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => onRemove(ph.id)} style={{
              position: "absolute", top: 4, left: 4, width: 22, height: 22, borderRadius: "50%",
              background: "rgba(231,76,60,0.9)", color: "#fff", border: "none", cursor: "pointer",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, padding: "3px 6px",
              background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, textAlign: "center",
            }}>{ph.type === "דיגיטלי" ? t("infratech.photo.typeDigital") : ph.type} | {ph.room || `${t("infratech.photo.label")} ${i+1}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard
function Dashboard({ inspections, onSelect, onNew }: { inspections: InspectionData[]; onSelect: (i: InspectionData) => void; onNew: () => void }) {
  const { t } = useLanguage();
  const statusColors: Record<string, string> = { draft: "#f39c12", processing: "#3498db", ready: "#27ae60", approved: "#2c3e50" };
  const statusLabels: Record<string, string> = {
    draft: t("infratech.status.draft"),
    processing: t("infratech.status.processing"),
    ready: t("infratech.status.ready"),
    approved: t("infratech.status.approved"),
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a3c5e", margin: 0 }}>{t("infratech.dashboard.title")}</h1>
        <button onClick={onNew} style={{
          padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #1a5276, #2471a3)", color: "#fff",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          boxShadow: "0 4px 15px rgba(26,82,118,0.3)",
        }}>{t("infratech.dashboard.new")}</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: t("infratech.dashboard.stat.total"), value: inspections.length, icon: "📁", color: "#3498db" },
          { label: t("infratech.dashboard.stat.processing"), value: inspections.filter((i: InspectionData) => i.status === "processing").length, icon: "⚙️", color: "#f39c12" },
          { label: t("infratech.dashboard.stat.ready"), value: inspections.filter((i: InspectionData) => i.status === "ready").length, icon: "✅", color: "#27ae60" },
          { label: t("infratech.dashboard.stat.approved"), value: inspections.filter((i: InspectionData) => i.status === "approved").length, icon: "📋", color: "#2c3e50" },
        ].map((s: { label: string; value: number; icon: string; color: string }, i: number) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 16, padding: "20px 18px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #eef2f7",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#7f8c8d" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Inspections List */}
      {inspections.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60, background: "#f8fafe", borderRadius: 20,
          border: "2px dashed #d6e9f8",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a3c5e", marginBottom: 8 }}>{t("infratech.dashboard.empty.title")}</div>
          <div style={{ fontSize: 14, color: "#7f8c8d", marginBottom: 20 }}>{t("infratech.dashboard.empty.subtitle")}</div>
          <button onClick={onNew} style={{
            padding: "12px 32px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "#1a5276", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          }}>{t("infratech.dashboard.empty.cta")}</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {inspections.map((insp: InspectionData) => (
            <div key={insp.id} onClick={() => onSelect(insp)} style={{
              background: "#fff", borderRadius: 14, padding: "18px 22px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)", border: "1px solid #eef2f7",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef4fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🏠
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1a3c5e", fontSize: 15 }}>{insp.clientName || t("infratech.dashboard.unknownClient")}</div>
                <div style={{ fontSize: 12, color: "#7f8c8d" }}>{insp.address || t("infratech.dashboard.noAddress")} | {insp.date}</div>
              </div>
              <div style={{ fontSize: 12, color: "#7f8c8d" }}>{insp.expert}</div>
              <span style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: statusColors[insp.status || ''] + "15",
                color: statusColors[insp.status || ''],
              }}>{statusLabels[insp.status || '']}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// New Inspection Wizard
function NewInspection({ onComplete, onCancel }: { onComplete: (d: InspectionData) => void; onCancel: () => void }) {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<InspectionData>({
    clientName: "", address: "", callNumber: "", buildingType: "דירה",
    expert: "adi_b", approver: "tal_y", date: new Date().toISOString().split("T")[0],
    notes: "", photos: [], findings: null, report: null,
  });
  const [processing, setProcessing] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);

  const update = <K extends keyof InspectionData>(k: K, v: InspectionData[K]) => setData((p: InspectionData) => ({ ...p, [k]: v }));

  // AI Processing
  const runAIProcessing = async () => {
    setProcessing(true);
    setProcessLog([t("infratech.process.start")]);

    await new Promise(r => setTimeout(r, 500));
    setProcessLog(p => [...p, t("infratech.process.sendNlp")]);

    try {
      const result = await processFieldNotes(
        data.notes || t("infratech.process.demoNotes"),
        "seal"
      );

      setProcessLog(p => [...p, t("infratech.process.received")]);
      await new Promise(r => setTimeout(r, 300));

      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch {
        parsed = {
          findings: [{ location: t("infratech.process.fallback.location"), description: result.substring(0, 200), severity: t("infratech.process.fallback.severity"), defect_type: t("infratech.process.fallback.defectType") }],
          case_description: t("infratech.process.fallback.caseDescription"),
          building_type: data.buildingType,
          recommendations: [{ location: t("infratech.process.fallback.location"), action: t("infratech.process.fallback.recAction"), annex_needed: t("infratech.process.fallback.recAnnex") }],
          cost_items: [{ description: t("infratech.process.fallback.costDescription"), estimated_cost: 39000 }],
        };
      }

      setProcessLog(p => [...p, t("infratech.process.classify")]);
      await new Promise(r => setTimeout(r, 400));

      // Match annexes
      const matchedAnnexes: Annex[] = [];
      const allText = JSON.stringify(parsed).toLowerCase();
      ANNEXES.forEach((a: Annex) => {
        if (a.keywords.some((k: string) => allText.includes(k))) matchedAnnexes.push(a);
      });

      setProcessLog(p => [...p, `${t("infratech.process.annexesFoundPrefix")} ${matchedAnnexes.length} ${t("infratech.process.annexesFoundSuffix")}`]);
      await new Promise(r => setTimeout(r, 300));

      setProcessLog(p => [...p, t("infratech.process.costEstimate")]);
      await new Promise(r => setTimeout(r, 300));

      const expertObj = EXPERTS.find(e => e.id === data.expert);
      const approverObj = EXPERTS.find(e => e.id === data.approver);

      update("findings", {
        ...parsed,
        matchedAnnexes,
        expert: expertObj,
        approver: approverObj,
      });

      setProcessLog(p => [...p, t("infratech.process.done")]);
      await new Promise(r => setTimeout(r, 500));
      setStep(3);
    } catch (e) {
      setProcessLog(p => [...p, t("infratech.process.errorPrefix") + (e instanceof Error ? e.message : String(e))]);
    }
    setProcessing(false);
  };

  const steps = [t("infratech.steps.client"), t("infratech.steps.field"), t("infratech.steps.ai"), t("infratech.steps.report")];

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i <= step ? "#1a5276" : "#e0e8ef", color: i <= step ? "#fff" : "#7f8c8d",
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>{i < step ? "✓" : i + 1}</div>
            <div style={{ marginInlineStart: 8, fontSize: 13, fontWeight: i === step ? 700 : 400, color: i <= step ? "#1a3c5e" : "#7f8c8d" }}>{s}</div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "#1a5276" : "#e0e8ef", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Client Details */}
      {step === 0 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a3c5e", marginBottom: 24, marginTop: 0 }}>{t("infratech.client.heading")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {([
              { label: t("infratech.client.name"), key: "clientName" as const, placeholder: t("infratech.client.namePlaceholder") },
              { label: t("infratech.client.callNumber"), key: "callNumber" as const, placeholder: t("infratech.client.callNumberPlaceholder") },
              { label: t("infratech.client.address"), key: "address" as const, placeholder: t("infratech.client.addressPlaceholder") },
              { label: t("infratech.client.date"), key: "date" as const, type: "date" },
            ]).map((f: { label: string; key: 'clientName' | 'callNumber' | 'address' | 'date'; placeholder?: string; type?: string }) => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#5b7a94", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type || "text"} placeholder={f.placeholder}
                  value={data[f.key] as string} onChange={e => update(f.key, e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #d6e9f8",
                    fontSize: 14, direction: dir, fontFamily: "inherit", outline: "none",
                    boxSizing: "border-box", transition: "border 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#1a5276"}
                  onBlur={e => e.target.style.borderColor = "#d6e9f8"}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5b7a94", display: "block", marginBottom: 6 }}>{t("infratech.client.buildingType")}</label>
              <select value={data.buildingType} onChange={e => update("buildingType", e.target.value)} style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #d6e9f8",
                fontSize: 14, direction: dir, fontFamily: "inherit", background: "#fff",
              }}>
                {[
                  { value: "דירה", key: "infratech.buildingType.apartment" },
                  { value: "בית פרטי", key: "infratech.buildingType.privateHouse" },
                  { value: "דו-משפחתי", key: "infratech.buildingType.duplex" },
                  { value: "קוטג' טורי", key: "infratech.buildingType.terraced" },
                  { value: "פנטהאוז", key: "infratech.buildingType.penthouse" },
                  { value: "מבנה מסחרי", key: "infratech.buildingType.commercial" },
                ].map(bt => (
                  <option key={bt.value} value={bt.value}>{t(bt.key)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5b7a94", display: "block", marginBottom: 6 }}>{t("infratech.client.expert")}</label>
              <select value={data.expert} onChange={e => update("expert", e.target.value)} style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #d6e9f8",
                fontSize: 14, direction: dir, fontFamily: "inherit", background: "#fff",
              }}>
                {EXPERTS.map(ex => <option key={ex.id} value={ex.id}>{t(`infratech.expert.${ex.id}.name`)} - {t(`infratech.expert.${ex.id}.role`)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={onCancel} style={{
              padding: "11px 28px", borderRadius: 10, border: "1.5px solid #d6e9f8",
              background: "#fff", color: "#7f8c8d", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>{t("infratech.client.cancel")}</button>
            <button onClick={() => setStep(1)} style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: "#1a5276", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{t("infratech.client.continue")}</button>
          </div>
        </div>
      )}

      {/* Step 1: Field Capture */}
      {step === 1 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a3c5e", marginBottom: 24, marginTop: 0 }}>{t("infratech.field.heading")}</h2>

          <VoiceRecorder onTranscript={(tx: string) => update("notes", (data.notes ? data.notes + " " : "") + tx)} />

          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#5b7a94", display: "block", marginBottom: 6 }}>
              {t("infratech.field.notesLabel")}
            </label>
            <textarea
              value={data.notes}
              onChange={e => update("notes", e.target.value)}
              placeholder={t("infratech.field.notesPlaceholder")}
              style={{
                width: "100%", minHeight: 140, padding: 16, borderRadius: 12,
                border: "1.5px solid #d6e9f8", fontSize: 14, direction: dir,
                fontFamily: "inherit", resize: "vertical", outline: "none",
                boxSizing: "border-box", lineHeight: 1.7,
              }}
              onFocus={e => e.target.style.borderColor = "#1a5276"}
              onBlur={e => e.target.style.borderColor = "#d6e9f8"}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#5b7a94", display: "block", marginBottom: 10 }}>{t("infratech.field.photosLabel")}</label>
            <PhotoManager
              photos={data.photos}
              onAdd={(ph: Photo) => update("photos", [...data.photos, ph])}
              onRemove={(id: number) => update("photos", data.photos.filter((p: Photo) => p.id !== id))}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={() => setStep(0)} style={{
              padding: "11px 28px", borderRadius: 10, border: "1.5px solid #d6e9f8",
              background: "#fff", color: "#7f8c8d", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>{t("infratech.field.back")}</button>
            <button onClick={() => { setStep(2); setTimeout(runAIProcessing, 300); }} disabled={!data.notes} style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: data.notes ? "#1a5276" : "#bdc3c7", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: data.notes ? "pointer" : "default", fontFamily: "inherit",
            }}>{t("infratech.field.sendAi")}</button>
          </div>
        </div>
      )}

      {/* Step 2: AI Processing */}
      {step === 2 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a3c5e", marginBottom: 24, marginTop: 0 }}>{t("infratech.ai.heading")}</h2>
          <div style={{
            background: "#0a1628", borderRadius: 14, padding: 24, minHeight: 300,
            fontFamily: "'Courier New', monospace", fontSize: 13, color: "#5dade2",
            direction: "ltr", textAlign: "left",
          }}>
            <div style={{ color: "#7f8c8d", marginBottom: 12 }}>INFRATECH AI ENGINE v2.0</div>
            <div style={{ color: "#7f8c8d", marginBottom: 16 }}>{'='	.repeat(40)}</div>
            {processLog.map((log: string, i: number) => (
              <div key={i} style={{ marginBottom: 8, color: log.startsWith("❌") ? "#e74c3c" : log.startsWith("✅") ? "#27ae60" : "#5dade2" }}>
                {'>'} {log}
              </div>
            ))}
            {processing && (
              <div style={{ marginTop: 8, color: "#f39c12" }}>
                <span style={{ animation: "blink 1s infinite" }}>▌</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Report Preview */}
      {step === 3 && data.findings && (
        <ReportPreview data={data} onApprove={(finalData: InspectionData) => {
          onComplete({ ...data, ...finalData, status: "ready" });
        }} onBack={() => setStep(1)} />
      )}
    </div>
  );
}

// Report Preview & Editor
function ReportPreview({ data, onApprove, onBack }: { data: InspectionData; onApprove: (d: InspectionData) => void; onBack: () => void }) {
  const { t } = useLanguage();
  const findings = data.findings;
  const expert = findings?.expert || EXPERTS[0];
  const approver = findings?.approver || EXPERTS[0];
  const expertName = expert?.id ? t(`infratech.expert.${expert.id}.name`) : expert?.name;
  const approverName = approver?.id ? t(`infratech.expert.${approver.id}.name`) : approver?.name;
  const expertEducation = expert?.id ? t(`infratech.expert.${expert.id}.education`) : expert?.education;
  const expertExperience = expert?.id ? t(`infratech.expert.${expert.id}.experience`) : expert?.experience;

  const totalCost = (findings?.cost_items || []).reduce((s: number, i: CostItem) => s + (i.estimated_cost || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a3c5e", margin: 0 }}>{t("infratech.report.heading")}</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBack} style={{
            padding: "10px 22px", borderRadius: 10, border: "1.5px solid #d6e9f8",
            background: "#fff", color: "#7f8c8d", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>{t("infratech.report.backToEdit")}</button>
          <button onClick={() => onApprove(data)} style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #27ae60, #2ecc71)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 15px rgba(39,174,96,0.3)",
          }}>{t("infratech.report.approve")}</button>
        </div>
      </div>

      {/* Report Document */}
      <div style={{
        background: "#fff", borderRadius: 4, padding: "48px 56px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)", maxWidth: 780, margin: "0 auto",
        fontFamily: "'Noto Sans Hebrew', 'David', serif",
        border: "1px solid #e0e0e0",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 20, borderBottom: "3px solid #1a3c5e" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1a3c5e" }}>{t("infratech.report.docTitle")}</div>
          <div style={{ fontSize: 12, color: "#7f8c8d", marginTop: 4 }}>{t("infratech.report.companyName")}</div>
        </div>

        {/* Client Info Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <tbody>
            {[
              [t("infratech.report.to"), data.clientName || "***"],
              [t("infratech.report.callNumber"), data.callNumber || "***"],
              [t("infratech.report.inspectionDate"), data.date],
              [t("infratech.report.siteAddress"), data.address || "***"],
              [t("infratech.report.expertName"), expertName],
              [t("infratech.report.approverName"), approverName],
            ].map(([k, v], i) => (
              <tr key={i}>
                <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 13, color: "#2c3e50", width: 160, borderBottom: "1px solid #eee" }}>{k}</td>
                <td style={{ padding: "8px 12px", fontSize: 13, color: "#2c3e50", borderBottom: "1px solid #eee" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Equipment */}
        <div style={{ background: "#f8fafe", borderRadius: 8, padding: 16, marginBottom: 24, border: "1px solid #e8f0f8" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3c5e", marginBottom: 8 }}>{t("infratech.report.equipmentTitle")}</div>
          <div style={{ fontSize: 12, color: "#5b7a94", lineHeight: 1.8 }}>
            {t("infratech.report.equipmentList")}
          </div>
        </div>

        {/* Expert Profile */}
        <div style={{ background: "#f8fafe", borderRadius: 8, padding: 16, marginBottom: 24, border: "1px solid #e8f0f8" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3c5e", marginBottom: 6 }}>{t("infratech.report.education")} <span style={{ fontWeight: 400 }}>{expertEducation}</span></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3c5e", marginBottom: 6 }}>{t("infratech.report.experience")} <span style={{ fontWeight: 400 }}>{expertExperience}</span></div>
          <div style={{ fontSize: 11, color: "#7f8c8d", marginTop: 10, lineHeight: 1.6, fontStyle: "italic" }}>
            {t("infratech.report.declaration")}
          </div>
        </div>

        {/* Section 1: Findings */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: "#1a3c5e", padding: "8px 0",
            borderBottom: "2px solid #1a3c5e", marginBottom: 16,
          }}>
            {t("infratech.report.section1")}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd", width: 40 }}>1.1</td>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd", width: 120 }}>{t("infratech.report.buildingDescription")}</td>
                <td style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #ddd" }}>{findings?.building_type || data.buildingType}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd" }}>1.2</td>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd" }}>{t("infratech.report.inspectedElements")}</td>
                <td style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #ddd" }}>{t("infratech.report.inspectedElementsValue")}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd" }}>1.3</td>
                <td style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #ddd" }}>{t("infratech.report.inspectionSubject")}</td>
                <td style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #ddd" }}>{t("infratech.report.inspectionSubjectValue")}</td>
              </tr>
            </tbody>
          </table>

          {/* Case Description */}
          <div style={{ fontSize: 13, color: "#2c3e50", lineHeight: 1.8, margin: "16px 0", padding: "12px 16px", background: "#fafbfc", borderRadius: 6, border: "1px solid #eee" }}>
            <span style={{ fontWeight: 700 }}>{t("infratech.report.caseDescriptionLabel")}</span>
            {findings?.case_description || t("infratech.report.caseDescriptionDefault")}
          </div>

          {/* Detailed Findings */}
          {(findings?.findings || []).map((f: Finding, i: number) => (
            <div key={i} style={{ marginBottom: 16, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#fafbfc", borderRadius: 6, border: "1px solid #eee" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#1a3c5e" }}>1.4.{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#2471a3" }}>{f.location}</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 10,
                  background: f.severity === "חמור" ? "#e74c3c20" : f.severity === "בינוני" ? "#f39c1220" : "#27ae6020",
                  color: f.severity === "חמור" ? "#e74c3c" : f.severity === "בינוני" ? "#f39c12" : "#27ae60",
                  fontWeight: 700,
                }}>{f.severity}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#2c3e50", lineHeight: 1.7 }}>{f.description}</div>
            </div>
          ))}
        </div>

        {/* Section 2: Conclusions & Recommendations */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: "#1a3c5e", padding: "8px 0",
            borderBottom: "2px solid #1a3c5e", marginBottom: 16,
          }}>
            {t("infratech.report.section2")}
          </div>

          {(findings?.recommendations || []).map((r: Recommendation, i: number) => (
            <div key={i} style={{ marginBottom: 14, padding: "10px 14px", background: "#f8fafe", borderRadius: 6, borderInlineEnd: "3px solid #2471a3" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a3c5e", marginBottom: 4 }}>2.2.{i + 1} {r.location}</div>
              <div style={{ fontSize: 12.5, color: "#2c3e50", lineHeight: 1.7 }}>{r.action}</div>
              {r.annex_needed && (
                <div style={{ fontSize: 11, color: "#2471a3", marginTop: 6, fontWeight: 600 }}>{t("infratech.report.annexAttached")}{r.annex_needed}</div>
              )}
            </div>
          ))}

          {/* Standard notes */}
          <div style={{ marginTop: 16, padding: 14, background: "#fef9e7", borderRadius: 6, border: "1px solid #f9e79f" }}>
            <div style={{ fontSize: 12, color: "#7d6608", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{t("infratech.report.generalInstructions")}</div>
              <div>{t("infratech.report.instruction1")}</div>
              <div>{t("infratech.report.instruction2")}</div>
              <div>{t("infratech.report.instruction3")}</div>
              <div>{t("infratech.report.instruction4")}</div>
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: "#1a3c5e", padding: "8px 0",
            borderBottom: "2px solid #1a3c5e", marginBottom: 16,
          }}>
            {t("infratech.report.costEstimateTitle")}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a3c5e" }}>
                <td style={{ padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, border: "1px solid #ccc" }}>{t("infratech.report.costCol.item")}</td>
                <td style={{ padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, border: "1px solid #ccc" }}>{t("infratech.report.costCol.detail")}</td>
                <td style={{ padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, border: "1px solid #ccc", width: 100, textAlign: "center" }}>{t("infratech.report.costCol.cost")}</td>
              </tr>
            </thead>
            <tbody>
              {(findings?.cost_items || []).map((c: CostItem, i: number) => (
                <tr key={i}>
                  <td style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd", fontWeight: 700 }}>{i + 1}.</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd" }}>{c.description}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #ddd", textAlign: "center", fontWeight: 700 }}>
                    {(c.estimated_cost || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ background: "#f0f6fb" }}>
                <td colSpan={2} style={{ padding: "10px 12px", fontSize: 13, fontWeight: 800, border: "1px solid #ddd", color: "#1a3c5e" }}>{t("infratech.report.costTotal")}</td>
                <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 800, border: "1px solid #ddd", textAlign: "center", color: "#1a3c5e" }}>
                  {totalCost.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "#7f8c8d", marginTop: 10, lineHeight: 1.7 }}>
            {t("infratech.report.costFootnote")}
          </div>
        </div>

        {/* Matched Annexes */}
        {(findings?.matchedAnnexes?.length ?? 0) > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontSize: 16, fontWeight: 800, color: "#1a3c5e", padding: "8px 0",
              borderBottom: "2px solid #1a3c5e", marginBottom: 16,
            }}>
              {t("infratech.report.annexesTitle")}
            </div>
            {(findings?.matchedAnnexes ?? []).map((a: Annex, i: number) => (
              <div key={i} style={{ padding: "10px 14px", background: "#f0f6fb", borderRadius: 6, marginBottom: 8, border: "1px solid #d6e9f8" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3c5e" }}>{t("infratech.report.annexPrefix")}{a.id ? t(`infratech.annex.${a.id}.name`) : a.name}</div>
                <div style={{ fontSize: 12, color: "#5b7a94", marginTop: 4 }}>{a.id ? t(`infratech.annex.${a.id}.steps`) : a.steps}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #ddd", fontSize: 10, color: "#7f8c8d", textAlign: "center", lineHeight: 1.6 }}>
          {t("infratech.report.footer")}
        </div>
      </div>
    </div>
  );
}

// Annex Library
function AnnexLibrary() {
  const { t, dir } = useLanguage();
  const [search, setSearch] = useState("");
  const filtered = ANNEXES.filter(a =>
    !search || a.name.includes(search) || a.keywords.some(k => k.includes(search)) || a.steps.includes(search)
  );
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a3c5e", marginBottom: 6, marginTop: 0 }}>{t("infratech.annexes.title")}</h1>
      <p style={{ fontSize: 14, color: "#7f8c8d", marginBottom: 24 }}>{t("infratech.annexes.subtitle")}</p>
      <input
        type="text" placeholder={t("infratech.annexes.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #d6e9f8",
          fontSize: 14, direction: dir, fontFamily: "inherit", marginBottom: 20,
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {filtered.map(a => (
          <div key={a.id} style={{
            background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            border: "1px solid #eef2f7", transition: "all 0.15s",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3c5e", marginBottom: 8 }}>📄 {t(`infratech.annex.${a.id}.name`)}</div>
            <div style={{ fontSize: 12, color: "#5b7a94", lineHeight: 1.7, marginBottom: 12 }}>{t(`infratech.annex.${a.id}.steps`)}</div>
            <div style={{ fontSize: 11, color: "#2471a3", fontWeight: 600 }}>{t("infratech.annexes.triggerLabel")}{t(`infratech.annex.${a.id}.trigger`)}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {a.keywords.map((k, i) => (
                <span key={i} style={{
                  padding: "2px 10px", borderRadius: 10, background: "#eef4fb",
                  color: "#1a5276", fontSize: 10, fontWeight: 600,
                }}>{k}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Price List
function PriceList() {
  const { t } = useLanguage();
  const priceKeys: Record<string, string> = {
    "טיפול מערכתי חדר רחצה ילדים": "infratech.price.childrenBathroom",
    "טיפול מערכתי חדר רחצה הורים": "infratech.price.parentsBathroom",
    "טיפול מערכתי חדר רחצה + כביסה": "infratech.price.bathroomLaundry",
    "טיפול מערכתי גג": "infratech.price.roof",
    "טיפול מערכתי מרפסת": "infratech.price.balcony",
    "תיקוני טיח וצבע": "infratech.price.plasterPaint",
    "תיקוני טיח וצבע (גרם מדרגות)": "infratech.price.plasterPaintStairs",
    "החלפת צנרת מים קרים": "infratech.price.coldWaterPipes",
    "החלפת צנרת מים חמים": "infratech.price.hotWaterPipes",
    "תיקון ניקוז כפול": "infratech.price.doubleDrain",
    "איטום קיר יסוד": "infratech.price.foundationWall",
    "איטום סף דלת": "infratech.price.doorThreshold",
  };
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a3c5e", marginBottom: 6, marginTop: 0 }}>{t("infratech.prices.title")}</h1>
      <p style={{ fontSize: 14, color: "#7f8c8d", marginBottom: 24 }}>{t("infratech.prices.subtitle")}</p>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", border: "1px solid #eef2f7" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a3c5e" }}>
              <td style={{ padding: "12px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>{t("infratech.prices.col.item")}</td>
              <td style={{ padding: "12px 18px", color: "#fff", fontSize: 13, fontWeight: 700, width: 140, textAlign: "center" }}>{t("infratech.prices.col.cost")}</td>
            </tr>
          </thead>
          <tbody>
            {Object.entries(PRICE_LIST).map(([k, v], i) => (
              <tr key={k} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafe" }}>
                <td style={{ padding: "12px 18px", fontSize: 13, color: "#2c3e50", borderBottom: "1px solid #eef2f7" }}>{priceKeys[k] ? t(priceKeys[k]) : k}</td>
                <td style={{ padding: "12px 18px", fontSize: 14, fontWeight: 700, color: "#1a3c5e", borderBottom: "1px solid #eef2f7", textAlign: "center" }}>
                  {v.toLocaleString()} ₪
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, padding: 16, background: "#fef9e7", borderRadius: 12, border: "1px solid #f9e79f", fontSize: 12, color: "#7d6608", lineHeight: 1.7 }}>
        <strong>{t("infratech.prices.notesLabel")}</strong> {t("infratech.prices.notes")}
      </div>
    </div>
  );
}

// Expert Profiles
function ExpertProfiles() {
  const { t } = useLanguage();
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a3c5e", marginBottom: 6, marginTop: 0 }}>{t("infratech.experts.title")}</h1>
      <p style={{ fontSize: 14, color: "#7f8c8d", marginBottom: 24 }}>{t("infratech.experts.subtitle")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {EXPERTS.map(ex => (
          <div key={ex.id} style={{
            background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            border: "1px solid #eef2f7",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #1a5276, #2471a3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 20, fontWeight: 800,
              }}>
                {t(`infratech.expert.${ex.id}.name`).charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a3c5e" }}>{t(`infratech.expert.${ex.id}.name`)}</div>
                <div style={{ fontSize: 12, color: "#2471a3", fontWeight: 600 }}>{t(`infratech.expert.${ex.id}.role`)}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#5b7a94", lineHeight: 1.7, marginBottom: 8 }}>
              <strong>{t("infratech.experts.educationLabel")}</strong> {t(`infratech.expert.${ex.id}.education`)}
            </div>
            <div style={{ fontSize: 12, color: "#5b7a94", lineHeight: 1.7 }}>
              <strong>{t("infratech.experts.experienceLabel")}</strong> {t(`infratech.expert.${ex.id}.experience`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== MAIN APP =====
export default function InfratechContent() {
  const { t, dir } = useLanguage();
  const [page, setPage] = useState("dashboard");
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<InspectionData | null>(null);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const res = typeof window !== "undefined" ? localStorage.getItem("infratech-inspections") : null;
        if (res) setInspections(JSON.parse(res));
      } catch {}
    })();
  }, []);

  // Save to storage
  const saveInspections = async (data: InspectionData[]) => {
    setInspections(data);
    try { if (typeof window !== "undefined") localStorage.setItem("infratech-inspections", JSON.stringify(data)); } catch {}
  };

  const handleNewComplete = (data: InspectionData) => {
    const newInsp: InspectionData = {
      ...data,
      id: Date.now(),
      date: data.date || new Date().toISOString().split("T")[0],
      expert: EXPERTS.find((e: Expert) => e.id === data.expert)?.name || t("infratech.experts.unknown"),
    };
    saveInspections([newInsp, ...inspections]);
    setPage("dashboard");
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", direction: dir,
      fontFamily: "'Noto Sans Hebrew', 'Segoe UI', sans-serif",
      background: "#f2f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c0c8d1; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { outline: none; }
      `}</style>

      <Sidebar active={page} onNav={setPage} inspectionCount={inspections.length} />

      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        {page === "dashboard" && (
          <Dashboard
            inspections={inspections}
            onSelect={(insp: InspectionData) => { setSelectedInspection(insp); setPage("view"); }}
            onNew={() => setPage("new")}
          />
        )}
        {page === "new" && (
          <NewInspection
            onComplete={handleNewComplete}
            onCancel={() => setPage("dashboard")}
          />
        )}
        {page === "view" && selectedInspection && (
          <ReportPreview
            data={selectedInspection}
            onApprove={() => {
              const updated: InspectionData[] = inspections.map((i: InspectionData) => i.id === selectedInspection?.id ? { ...i, status: "approved" } : i);
              saveInspections(updated);
              setPage("dashboard");
            }}
            onBack={() => setPage("dashboard")}
          />
        )}
        {page === "annexes" && <AnnexLibrary />}
        {page === "prices" && <PriceList />}
        {page === "experts" && <ExpertProfiles />}
      </main>
    </div>
  );
}
