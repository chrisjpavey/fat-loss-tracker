import { useState } from "react";

const CALORIE_TARGET = 2150;
const PROTEIN_TARGET = 140;
const GOAL_WEIGHT = 171;
const START_WEIGHT = 189;

const todayStr = () => new Date().toISOString().split("T")[0];

const formatDateShort = (dateStr) => {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  } catch { return dateStr; }
};

const lbsToStone = (lbs) => {
  if (!lbs || isNaN(lbs)) return "";
  const st = Math.floor(lbs / 14);
  const lb = (lbs % 14).toFixed(1);
  return `${st}st ${lb}lb`;
};

const calcAvg = (arr) => {
  const v = arr.map(parseFloat).filter((x) => !isNaN(x) && x > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

const readLogs = () => {
  try { return JSON.parse(localStorage.getItem("flt_logs") || "{}"); } catch { return {}; }
};

const writeLogs = (data) => {
  try { localStorage.setItem("flt_logs", JSON.stringify(data)); } catch {}
};

const emptyDay = () => ({
  weight: "", calories: "", protein: "",
  hunger: 5, energy: 5, trainingQuality: "Stable", unplannedSnacks: 0
});

export default function App() {
  const [saved, setSaved] = useState(() => readLogs());
  const [tab, setTab] = useState("today");
  const [day, setDay] = useState(() => {
    const existing = readLogs()[todayStr()];
    return existing ? { ...emptyDay(), ...existing } : emptyDay();
  });
  const [flashSave, setFlashSave] = useState(false);
  const [flashCopy, setFlashCopy] = useState(false);

  const handleSave = () => {
    const t = todayStr();
    const next = { ...saved, [t]: { ...day, date: t } };
    setSaved(next);
    writeLogs(next);
    setFlashSave(true);
    setTimeout(() => setFlashSave(false), 1800);
  };

  const handleCopy = () => {
    try { navigator.clipboard.writeText(generateReport()); } catch {}
    setFlashCopy(true);
    setTimeout(() => setFlashCopy(false), 1800);
  };

  // Last 7 days with entries
  const sortedDates = Object.keys(saved).sort().slice(-7);
  const recent = sortedDates.map((d) => saved[d]);

  const avgWeight = calcAvg(recent.map((d) => d.weight));
  const avgCal    = calcAvg(recent.map((d) => d.calories));
  const avgProt   = calcAvg(recent.map((d) => d.protein));
  const avgHunger = calcAvg(recent.map((d) => d.hunger));
  const avgEnergy = calcAvg(recent.map((d) => d.energy));

  const weights = recent.map((d) => parseFloat(d.weight)).filter((x) => x > 0);
  const minW = weights.length ? Math.min(...weights) : null;
  const maxW = weights.length ? Math.max(...weights) : null;
  const totalSnacks = recent.reduce((s, d) => s + (parseInt(d.unplannedSnacks) || 0), 0);

  const tqCounts = {};
  recent.forEach((d) => { if (d.trainingQuality) tqCounts[d.trainingQuality] = (tqCounts[d.trainingQuality] || 0) + 1; });
  const tq = Object.entries(tqCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Stable";

  const goalPct  = avgWeight ? Math.min(100, ((START_WEIGHT - avgWeight) / (START_WEIGHT - GOAL_WEIGHT)) * 100) : 0;
  const calPct   = day.calories ? Math.min(110, (parseFloat(day.calories) / CALORIE_TARGET) * 100) : 0;
  const protPct  = day.protein  ? Math.min(110, (parseFloat(day.protein)  / PROTEIN_TARGET)  * 100) : 0;
  const calDiff  = day.calories ? Math.round(CALORIE_TARGET - parseFloat(day.calories)) : null;
  const protDiff = day.protein  ? Math.round(PROTEIN_TARGET - parseFloat(day.protein))  : null;
  const calStatus = day.calories
    ? Math.abs(parseFloat(day.calories) - CALORIE_TARGET) <= 100 ? "ok"
    : parseFloat(day.calories) > CALORIE_TARGET + 100 ? "over" : "under"
    : "empty";

  const generateReport = () => {
    const f = (v, d = 1) => v != null ? v.toFixed(d) : "—";
    return [
      "WEEK X CHECK-IN",
      "",
      `7-day average weight: ${avgWeight ? lbsToStone(parseFloat(f(avgWeight))) + " / " + f(avgWeight) + " lbs" : "—"}`,
      `Lowest weight: ${minW ? lbsToStone(minW) + " / " + minW.toFixed(1) + " lbs" : "—"}`,
      `Highest weight: ${maxW ? lbsToStone(maxW) + " / " + maxW.toFixed(1) + " lbs" : "—"}`,
      "",
      `Average daily calories: ${avgCal ? Math.round(avgCal) + " kcal" : "—"}`,
      `Average protein: ${avgProt ? Math.round(avgProt) + "g" : "—"}`,
      "",
      `Hunger (1–10): ${f(avgHunger)}`,
      `Energy (1–10): ${f(avgEnergy)}`,
      `Training quality: ${tq}`,
      "",
      `Unplanned snack episodes: ${totalSnacks}`,
    ].join("\n");
  };

  // ── Design tokens ──────────────────────────────────────
  const G    = "#4ade80";
  const mono = "'DM Mono', monospace";
  const syne = "'Syne', sans-serif";

  const card  = { background: "#0f0f0f", border: "1px solid #1c1c1c", borderRadius: 16, padding: 16, marginBottom: 10 };
  const lbl   = { fontFamily: mono, fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", display: "block", marginBottom: 8 };
  const bigIn = { background: "transparent", border: "none", color: "#f0f0f0", fontSize: 38, fontFamily: syne, fontWeight: 800, width: "100%", outline: "none" };
  const bar   = { height: 5, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", marginTop: 10 };
  const big   = { fontFamily: syne, fontWeight: 800, fontSize: 40, lineHeight: 1 };
  const row   = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0e0e0e" };
  const navS  = (a) => ({ flex: 1, padding: "12px 0 calc(12px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", borderTop: a ? `2px solid ${G}` : "2px solid transparent", cursor: "pointer", fontFamily: mono, fontSize: 9, letterSpacing: 2, color: a ? G : "#333", transition: "all .2s" });
  const bClr  = (p) => p > 105 ? "#ef4444" : p >= 95 ? G : "#3b82f6";
  const tqBn  = (a, t) => ({ flex: 1, padding: "10px 4px", borderRadius: 10, fontFamily: mono, fontSize: 10, letterSpacing: 1, border: "none", cursor: "pointer", transition: "all .2s", background: a ? (t === "Declining" ? "#7f1d1d" : t === "Improving" ? "#14532d" : "#1e3a5f") : "#131313", color: a ? (t === "Declining" ? "#fca5a5" : t === "Improving" ? "#86efac" : "#93c5fd") : "#444" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        html,body,#root{min-height:100%;background:#0a0a0a}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#1e1e1e;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#4ade80;cursor:pointer;border:2px solid #0a0a0a}
        ::-webkit-scrollbar{width:0}
        .bf{transition:width .5s cubic-bezier(.23,1,.32,1)}
        .ps{animation:ps 1.5s ease-in-out}
        @keyframes ps{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100dvh", maxWidth: 430, margin: "0 auto", fontFamily: syne, color: "#f0f0f0", paddingBottom: "calc(80px + env(safe-area-inset-bottom))", paddingTop: "env(safe-area-inset-top)" }}>

        {/* ── Header ── */}
        <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1c1c1c", padding: "16px 20px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 4, color: G }}>FAT LOSS TRACKER</div>
              <div style={{ fontFamily: syne, fontWeight: 600, fontSize: 12, color: "#555", marginTop: 3 }}>{formatDateShort(todayStr())}</div>
            </div>
            {avgWeight && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "#333" }}>7-DAY AVG</div>
                <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 17, color: G, marginTop: 2 }}>{avgWeight.toFixed(1)} lbs</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#333", marginTop: 1 }}>{lbsToStone(avgWeight)}</div>
              </div>
            )}
          </div>
          {goalPct > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "#222" }}>GOAL PROGRESS</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: G }}>{goalPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: 3, background: "#141414", borderRadius: 2, overflow: "hidden" }}>
                <div className="bf" style={{ height: "100%", width: `${goalPct}%`, background: "linear-gradient(90deg,#3b82f6,#4ade80)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: "#1e1e1e" }}>13st 7 · 189lbs</span>
                <span style={{ fontFamily: mono, fontSize: 8, color: "#1e1e1e" }}>12st 3 · 171lbs</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "14px 14px 0" }}>

          {/* TODAY */}
          {tab === "today" && (
            <div>
              <div style={card}>
                <span style={lbl}>Morning Weight (lbs)</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <input type="number" style={bigIn} step="0.1" placeholder="188.0"
                    value={day.weight} onChange={(e) => setDay({ ...day, weight: e.target.value })} />
                  {day.weight && <span style={{ fontFamily: mono, fontSize: 11, color: "#444", whiteSpace: "nowrap" }}>{lbsToStone(parseFloat(day.weight))}</span>}
                </div>
                {avgWeight && day.weight && (
                  <div style={{ marginTop: 6, fontFamily: mono, fontSize: 9, letterSpacing: 1, color: parseFloat(day.weight) <= avgWeight ? G : "#f97316" }}>
                    {parseFloat(day.weight) < avgWeight ? "▼" : "▲"} {Math.abs(parseFloat(day.weight) - avgWeight).toFixed(1)} lbs vs 7-day avg
                  </div>
                )}
              </div>

              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={lbl}>Calories</span>
                  <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, color: "#222", marginBottom: 8 }}>TARGET 2,150</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <input type="number" style={bigIn} placeholder="0"
                    value={day.calories} onChange={(e) => setDay({ ...day, calories: e.target.value })} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#333" }}>kcal</span>
                </div>
                <div style={bar}>
                  <div className="bf" style={{ height: "100%", width: `${calPct}%`, background: bClr(calPct), borderRadius: 3 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, marginTop: 6, letterSpacing: 1, color: calStatus === "ok" ? G : calStatus === "over" ? "#ef4444" : "#f97316" }}>
                  {calDiff === null ? "No entry yet"
                    : calDiff > 100 ? `${calDiff} kcal remaining`
                    : calDiff >= -100 ? "✓ Within ±100 kcal"
                    : `${Math.abs(calDiff)} kcal over target`}
                </div>
              </div>

              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={lbl}>Protein</span>
                  <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, color: "#222", marginBottom: 8 }}>MIN 140g</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <input type="number" style={bigIn} placeholder="0"
                    value={day.protein} onChange={(e) => setDay({ ...day, protein: e.target.value })} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#333" }}>g</span>
                </div>
                <div style={bar}>
                  <div className="bf" style={{ height: "100%", width: `${protPct}%`, background: protPct >= 100 ? G : "#f97316", borderRadius: 3 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, marginTop: 6, letterSpacing: 1, color: protDiff === null ? "#333" : protDiff <= 0 ? G : "#f97316" }}>
                  {protDiff === null ? "No entry yet" : protDiff <= 0 ? "✓ Target hit" : `${protDiff}g still needed`}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[["hunger","Hunger",8,"high"],["energy","Energy",3,"low"]].map(([k, lb2, thresh, dir]) => (
                  <div key={k} style={card}>
                    <span style={lbl}>{lb2}</span>
                    <div style={{ ...big, color: (dir==="high"&&day[k]>=thresh)||(dir==="low"&&day[k]<=thresh) ? "#fb923c" : "#f0f0f0" }}>{day[k]}</div>
                    <input type="range" min="1" max="10" value={day[k]} style={{ marginTop: 12 }}
                      onChange={(e) => setDay({ ...day, [k]: parseInt(e.target.value) })} />
                    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:8, color:"#222", marginTop:4 }}>
                      <span>1</span><span>10</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <span style={lbl}>Training Quality</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Declining","Stable","Improving"].map((q) => (
                    <button key={q} style={tqBn(day.trainingQuality===q, q)} onClick={() => setDay({ ...day, trainingQuality: q })}>
                      {q.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={card}>
                <span style={lbl}>Unplanned Snacks</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button style={{ width:44,height:44,borderRadius:12,background:"#181818",border:"1px solid #242424",color:"#f0f0f0",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
                    onClick={() => setDay({ ...day, unplannedSnacks: Math.max(0,(day.unplannedSnacks||0)-1) })}>−</button>
                  <div style={{ ...big, color:(day.unplannedSnacks||0)>0?"#fb923c":"#f0f0f0", minWidth:48, textAlign:"center" }}>{day.unplannedSnacks||0}</div>
                  <button style={{ width:44,height:44,borderRadius:12,background:"#181818",border:"1px solid #242424",color:"#f0f0f0",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
                    onClick={() => setDay({ ...day, unplannedSnacks: (day.unplannedSnacks||0)+1 })}>+</button>
                  <div style={{ fontFamily:mono, fontSize:9, color:"#222", letterSpacing:1, lineHeight:1.6 }}>LOG BEFORE<br/>EATING</div>
                </div>
                {totalSnacks > 3 && (
                  <div style={{ marginTop:10, fontFamily:mono, fontSize:9, color:"#ef4444", letterSpacing:1 }}>
                    ⚠ WEEK TOTAL {totalSnacks} — CONSTRAINT TRIGGERED
                  </div>
                )}
              </div>

              <button
                className={flashSave ? "ps" : ""}
                style={{ width:"100%", padding:"16px 0", borderRadius:14, fontFamily:syne, fontWeight:700, fontSize:15, letterSpacing:2, border:"none", cursor:"pointer", background:flashSave?"#14532d":G, color:flashSave?"#86efac":"#0a0a0a", transition:"all .3s" }}
                onClick={handleSave}
              >
                {flashSave ? "✓  SAVED" : "SAVE TODAY"}
              </button>
            </div>
          )}

          {/* WEEK */}
          {tab === "week" && (
            <div>
              <div style={{ fontFamily:mono, fontSize:10, letterSpacing:4, color:"#333", textTransform:"uppercase", marginBottom:10, marginTop:4 }}>7-Day Rolling Averages</div>
              <div style={card}>
                {[
                  { l:"Avg Weight",    v: avgWeight ? avgWeight.toFixed(1)+" lbs" : "—",  sub: avgWeight ? lbsToStone(avgWeight) : null, a: false },
                  { l:"Low / High",    v: (minW&&maxW) ? `${minW.toFixed(1)} / ${maxW.toFixed(1)} lbs` : "—", a: false },
                  { l:"Avg Calories",  v: avgCal  ? Math.round(avgCal)+" kcal" : "—",    a: avgCal  != null && Math.abs(avgCal-CALORIE_TARGET)>100 },
                  { l:"Avg Protein",   v: avgProt ? Math.round(avgProt)+"g"    : "—",    a: avgProt != null && avgProt<PROTEIN_TARGET },
                  { l:"Avg Hunger",    v: avgHunger ? avgHunger.toFixed(1)     : "—",    a: avgHunger != null && avgHunger>=8 },
                  { l:"Avg Energy",    v: avgEnergy ? avgEnergy.toFixed(1)     : "—",    a: avgEnergy != null && avgEnergy<=3 },
                  { l:"Training",      v: tq,                                             a: tq==="Declining" },
                  { l:"Snack Episodes",v: String(totalSnacks),                            a: totalSnacks>3 },
                ].map(({ l, v, sub, a }) => (
                  <div key={l} style={row}>
                    <span style={{ fontFamily:mono, fontSize:10, letterSpacing:2, color:"#444" }}>{l.toUpperCase()}</span>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:syne, fontWeight:700, fontSize:14, color: a?"#fb923c":"#f0f0f0" }}>{v}</div>
                      {sub && <div style={{ fontFamily:mono, fontSize:9, color:"#444", marginTop:2 }}>{sub}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily:mono, fontSize:10, letterSpacing:4, color:"#333", textTransform:"uppercase", marginBottom:10, marginTop:18 }}>Daily Log</div>
              <div style={card}>
                {sortedDates.length === 0
                  ? <div style={{ fontFamily:mono, fontSize:10, color:"#222", textAlign:"center", padding:"24px 0" }}>NO ENTRIES YET</div>
                  : [...sortedDates].reverse().map((date) => {
                      const d = saved[date];
                      const calOk  = d.calories && Math.abs(parseFloat(d.calories)-CALORIE_TARGET)<=100;
                      const protOk = d.protein  && parseFloat(d.protein)>=PROTEIN_TARGET;
                      return (
                        <div key={date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #0e0e0e" }}>
                          <div>
                            <div style={{ fontFamily:syne, fontWeight:600, fontSize:13, color:"#d0d0d0" }}>{formatDateShort(date)}</div>
                            {d.weight && <div style={{ fontFamily:mono, fontSize:10, color:"#444", marginTop:2 }}>{parseFloat(d.weight).toFixed(1)} lbs · {lbsToStone(parseFloat(d.weight))}</div>}
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:mono, fontSize:11, color: calOk?G:d.calories?"#fb923c":"#1a1a1a" }}>{d.calories?`${d.calories} kcal`:"—"}</div>
                            <div style={{ fontFamily:mono, fontSize:10, color: protOk?G:d.protein?"#f97316":"#1a1a1a", marginTop:2 }}>{d.protein?`${d.protein}g prot`:"—"}</div>
                            {(d.unplannedSnacks||0)>0 && <div style={{ fontFamily:mono, fontSize:9, color:"#fb923c", marginTop:2 }}>{d.unplannedSnacks} snack{d.unplannedSnacks!==1?"s":""}</div>}
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          )}

          {/* REPORT */}
          {tab === "report" && (
            <div>
              <div style={{ fontFamily:mono, fontSize:10, letterSpacing:4, color:"#333", textTransform:"uppercase", marginBottom:10, marginTop:4 }}>Sunday Check-In</div>
              <div style={card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ fontFamily:mono, fontSize:9, letterSpacing:2, color:"#222" }}>COPY TO AI COACH</span>
                  <button onClick={handleCopy} style={{ padding:"8px 18px", borderRadius:10, fontFamily:mono, fontSize:10, letterSpacing:2, border:"none", cursor:"pointer", background:flashCopy?"#14532d":G, color:flashCopy?"#86efac":"#0a0a0a", transition:"all .3s" }}>
                    {flashCopy?"✓ COPIED":"COPY"}
                  </button>
                </div>
                <pre style={{ fontFamily:mono, fontSize:11, lineHeight:1.9, color:"#9ca3af", background:"#070707", borderRadius:12, padding:16, border:"1px solid #131313", whiteSpace:"pre-wrap" }}>{generateReport()}</pre>
                <div style={{ marginTop:10, fontFamily:mono, fontSize:9, color:"#222", letterSpacing:1 }}>Replace "WEEK X" with your week number</div>
              </div>

              <div style={{ fontFamily:mono, fontSize:10, letterSpacing:4, color:"#333", textTransform:"uppercase", marginBottom:10, marginTop:18 }}>Status</div>
              <div style={card}>
                {[
                  { l:"Calorie compliance", ok: avgCal!=null && Math.abs(avgCal-CALORIE_TARGET)<=100, msg: avgCal ? `${Math.abs(Math.round(avgCal-CALORIE_TARGET))} kcal ${avgCal>CALORIE_TARGET?"over":"under"} avg` : "Log more days" },
                  { l:"Protein target",     ok: avgProt!=null && avgProt>=PROTEIN_TARGET,             msg: avgProt ? `Avg ${Math.round(avgProt)}g/day` : "Log more days" },
                  { l:"Snack protocol",     ok: totalSnacks<=3,                                       msg: `${totalSnacks} episode${totalSnacks!==1?"s":""} this week` },
                  { l:"Training quality",   ok: tq!=="Declining",                                     msg: tq },
                ].map(({ l, ok, msg }) => (
                  <div key={l} style={row}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:ok?G:"#ef4444", display:"inline-block", flexShrink:0 }} />
                      <span style={{ fontFamily:mono, fontSize:10, letterSpacing:2, color:"#444" }}>{l.toUpperCase()}</span>
                    </div>
                    <span style={{ fontFamily:mono, fontSize:10, color:ok?G:"#fb923c" }}>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Nav ── */}
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#0a0a0a", borderTop:"1px solid #1c1c1c", display:"flex", zIndex:100 }}>
          {[{id:"today",icon:"◉",label:"TODAY"},{id:"week",icon:"▦",label:"WEEK"},{id:"report",icon:"↑",label:"REPORT"}].map(({id,icon,label}) => (
            <button key={id} style={navS(tab===id)} onClick={() => setTab(id)}>
              <span style={{ fontSize:18, lineHeight:1 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
