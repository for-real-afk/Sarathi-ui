import { useState, useEffect } from "react";
import { C, inputStyle } from "../theme";
import { TextInput, Grid, Divider, Field } from "./UI";

const TX = {
  en: {
    portalTitle: "Volunteer Welfare Delivery Portal",
    noCases: "No cases assigned to your profile.",
    loading: "Loading portal details...",
    selectPrompt: "Select a welfare case from your list to schedule home visits and complete task checklists.",
    activeCases: "Active Cases",
    pendingVisits: "Pending Visits",
    resolvedCases: "Resolved Cases",
    rosterTitle: "Your Case Roster",
    caseDetail: "Case Verification & Checklists",
    tasksTitle: "Follow-up Task Checklist",
    scheduleTitle: "Schedule Home Visit",
    visitDate: "Upcoming Visit Date",
    saveDateBtn: "Schedule Visit",
    resolveCaseBtn: "Mark Case as Resolved",
    resolvedBadge: "Resolved",
    assignedBadge: "Assigned",
    scheduledBadge: "Visit Scheduled",
    beneficiaryInfo: "Beneficiary Demographics",
    addTaskPlaceholder: "Add custom follow-up task...",
    addTaskBtn: "Add Task",
    
    // Labels
    citizenName: "Citizen Name",
    phone: "Phone",
    village: "Village",
    district: "District",
    address: "Full Address",
    aadhaarRef: "Aadhaar Ref",
    caseTitle: "Target Scheme Case",
    status: "Case Status",
    desc: "Case Description",
  },
  te: {
    portalTitle: "స్వచ్ఛంద సంక్షేమ డెలివరీ పోర్టల్",
    noCases: "మీ ప్రొఫైల్‌కు కేసులు ఏవీ కేటాయించబడలేదు.",
    loading: "పోర్టల్ వివరాలను లోడ్ చేస్తోంది...",
    selectPrompt: "ఇంటి సందర్శనలను షెడ్యూల్ చేయడానికి మరియు టాస్క్ చెక్‌లిస్ట్‌లను పూర్తి చేయడానికి మీ జాబితా నుండి సంక్షేమ కేసును ఎంచుకోండి.",
    activeCases: "క్రియాశీల కేసులు",
    pendingVisits: "సందర్శించాల్సినవి",
    resolvedCases: "పరిష్కరించబడిన కేసులు",
    rosterTitle: "మీ కేసుల జాబితా",
    caseDetail: "కేసు ధృవీకరణ & చెక్‌లిస్ట్‌లు",
    tasksTitle: "ఫాలో-అప్ టాస్క్ చెక్‌లిస్ట్",
    scheduleTitle: "ఇంటి సందర్శనను షెడ్యూల్ చేయి",
    visitDate: "రాబోయే సందర్శన తేదీ",
    saveDateBtn: "సందర్శనను షెడ్యూల్ చేయి",
    resolveCaseBtn: "కేసు పరిష్కరించబడినట్లు గుర్తు చేయి",
    resolvedBadge: "పరిష్కరించబడింది",
    assignedBadge: "కేటాయించబడింది",
    scheduledBadge: "సందర్శన షెడ్యూల్ చేయబడింది",
    beneficiaryInfo: "లబ్ధిదారుల జనాభా వివరాలు",
    addTaskPlaceholder: "అదనపు టాస్క్ జోడించండి...",
    addTaskBtn: "టాస్క్ జోడించు",
    
    citizenName: "పౌరుడి పేరు",
    phone: "ఫోన్",
    village: "గ్రామం",
    district: "జిల్లా",
    address: "పూర్తి చిరునామా",
    aadhaarRef: "ఆధార్ రిఫరెన్స్",
    caseTitle: "సంక్షేమ పథకం కేసు",
    status: "కేసు స్థితి",
    desc: "కేసు వివరణ",
  }
};

export default function VolunteerDashboard({ lang, userToken }) {
  const t = TX[lang];
  const [profile, setProfile] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Case details
  const [selectedCase, setSelectedCase] = useState(null);
  const [loadingCaseDetail, setLoadingCaseDetail] = useState(false);

  // Custom task form
  const [customTask, setCustomTask] = useState("");
  const [visitDateText, setVisitDateText] = useState("");
  const [updatingCase, setUpdatingCase] = useState(false);

  const fetchPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current volunteer profile
      const profRes = await fetch("http://localhost:4000/api/volunteer-ops/volunteers/me", {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (!profRes.ok) {
        throw new Error("Failed to load volunteer profile.");
      }
      const profData = await profRes.json();
      setProfile(profData);

      // 2. Fetch assigned cases
      const casesRes = await fetch("http://localhost:4000/api/volunteer-ops/cases/assigned", {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData);
      }
    } catch (err) {
      setError(err.message || "Cannot retrieve volunteer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchPortalData();
    }
  }, [userToken]);

  const selectCase = (c) => {
    setSelectedCase(c);
    // Initialize visit date input
    if (c.upcoming_visit_date) {
      // Format as YYYY-MM-DDTHH:MM local for datetime-local input
      const d = new Date(c.upcoming_visit_date);
      const pad = (n) => String(n).padStart(2, "0");
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setVisitDateText(localStr);
    } else {
      setVisitDateText("");
    }
  };

  // Toggle tasks check status in database
  const handleToggleTask = async (taskIndex) => {
    if (updatingCase) return;
    const updatedTasks = selectedCase.follow_up_tasks.map((task, idx) => 
      idx === taskIndex ? { ...task, completed: !task.completed } : task
    );
    
    setUpdatingCase(true);
    try {
      const res = await fetch(`http://localhost:4000/api/volunteer-ops/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          follow_up_tasks: updatedTasks
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedCase(updatedData);
        // Refresh checklist in list state
        setCases(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCase(false);
    }
  };

  // Add a new custom follow-up task
  const handleAddCustomTask = async (e) => {
    e.preventDefault();
    if (!customTask.trim() || updatingCase) return;
    
    const newTask = { task_name: customTask.trim(), completed: false };
    const updatedTasks = [...selectedCase.follow_up_tasks, newTask];
    
    setUpdatingCase(true);
    try {
      const res = await fetch(`http://localhost:4000/api/volunteer-ops/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          follow_up_tasks: updatedTasks
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedCase(updatedData);
        setCases(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
        setCustomTask("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingCase(false);
    }
  };

  // Schedule a visit
  const handleSaveVisitDate = async (e) => {
    e.preventDefault();
    if (!visitDateText || updatingCase) return;

    setUpdatingCase(true);
    try {
      const res = await fetch(`http://localhost:4000/api/volunteer-ops/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          upcoming_visit_date: new Date(visitDateText).toISOString(),
          status: "Visit Scheduled"
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedCase(updatedData);
        setCases(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCase(false);
    }
  };

  // Mark case as resolved
  const handleMarkResolved = async () => {
    if (!window.confirm("Are you sure you want to mark this case as successfully resolved and close it?")) return;
    setUpdatingCase(true);
    try {
      const res = await fetch(`http://localhost:4000/api/volunteer-ops/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          status: "Resolved"
        })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setSelectedCase(updatedData);
        setCases(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
        // Refresh portal numbers
        fetchPortalData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCase(false);
    }
  };

  // Calculate quick metrics
  const activeCasesCount = cases.filter(c => c.status !== "Resolved").length;
  const pendingVisitsCount = cases.filter(c => c.status === "Visit Scheduled").length;
  const resolvedCasesCount = cases.filter(c => c.status === "Resolved").length;

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px 0", color: C.textMuted }}>🔄 {t.loading}</div>;
  }

  if (error) {
    return (
      <div style={{
        padding: 24, background: C.bgCard, border: `1px solid ${C.red}`, borderRadius: 12, color: C.red, textAlign: "center"
      }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Volunteer Hub Portal Header */}
      {profile && (
        <div style={{
          padding: "20px 24px", background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, color: C.accent }}>
              🤝 {t.portalTitle}
            </h2>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Volunteer Profile: <strong style={{ color: C.white }}>{profile.contact_phone || "Active"}</strong> · Hub: <strong style={{ color: C.white }}>{profile.hub?.name || "Local Hub"}</strong> · District: <strong style={{ color: C.white }}>{profile.district}</strong>
            </div>
          </div>
          <button onClick={fetchPortalData} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
          }}>
            🔄 Refresh Portal
          </button>
        </div>
      )}

      {/* Analytics Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { title: t.activeCases, count: activeCasesCount, color: C.accent, icon: "📋" },
          { title: t.pendingVisits, count: pendingVisitsCount, color: C.green, icon: "🏠" },
          { title: t.resolvedCases, count: resolvedCasesCount, color: C.white, icon: "🏆" }
        ].map((card, i) => (
          <div key={i} style={{
            background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
            display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
          }}>
            <div>
              <span style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", fontWeight: 700 }}>{card.title}</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: 26, fontWeight: 800, color: card.color }}>{card.count}</h3>
            </div>
            <span style={{ fontSize: 24, opacity: 0.65 }}>{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Roster & Details Split Panels */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        
        {/* Left Column: Roster list (40% width) */}
        <div style={{
          flex: "1 1 350px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 16, maxHeight: "calc(100vh - 250px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12
        }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 700, color: C.textLabel, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
            📋 {t.rosterTitle} ({cases.length})
          </h3>
          {cases.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>{t.noCases}</div>
          ) : (
            cases.map((c) => {
              const active = selectedCase && selectedCase.id === c.id;
              const isResolved = c.status === "Resolved";
              const isScheduled = c.status === "Visit Scheduled";
              const badgeCol = isResolved ? C.green : isScheduled ? C.accent : C.textMuted;
              const badgeBg = isResolved ? C.greenDim : isScheduled ? C.accentDim : "rgba(255,255,255,0.05)";

              return (
                <div
                  key={c.id}
                  onClick={() => selectCase(c)}
                  style={{
                    padding: 14, borderRadius: 10, background: active ? C.accentDim : C.bgInput,
                    border: `1px solid ${active ? C.accent : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 8
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.accent; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: active ? C.accent : C.white }}>
                      {c.citizen?.name}
                    </span>
                    <span style={{
                      padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                      background: badgeBg, border: `1px solid ${badgeCol}`, color: badgeCol
                    }}>
                      {c.status === "Resolved" ? t.resolvedBadge : c.status === "Visit Scheduled" ? t.scheduledBadge : t.assignedBadge}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>
                    💼 {c.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted }}>
                    <span>📍 {c.citizen?.village}</span>
                    {c.upcoming_visit_date && (
                      <span style={{ color: C.green }}>📅 {new Date(c.upcoming_visit_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case details & actions (60% width) */}
        <div style={{
          flex: "2 1 500px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, minHeight: 400, display: "flex", flexDirection: "column"
        }}>
          {!selectedCase ? (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", textAlign: "center", color: C.textMuted, padding: 40 }}>
              <div>
                <div style={{ fontSize: 44, marginBottom: 16 }}>📋</div>
                <div style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>{t.selectPrompt}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
              
              {/* Roster Details Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.white }}>
                    👤 {selectedCase.citizen?.name}
                  </h3>
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    Case ID: #{selectedCase.id} · Created: {new Date(selectedCase.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedCase.status !== "Resolved" && (
                  <button onClick={handleMarkResolved} disabled={updatingCase} style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: `linear-gradient(135deg, ${C.green}, #059669)`,
                    color: C.bg, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                  }}>
                    ✓ {t.resolveCaseBtn}
                  </button>
                )}
              </div>

              {/* Case Information details */}
              <Grid cols={2} gap={16}>
                <Field label={t.caseTitle}>
                  <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{selectedCase.title}</span>
                </Field>
                <Field label={t.status}>
                  <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{selectedCase.status}</span>
                </Field>
                {selectedCase.description && (
                  <Field label={t.desc} span={2}>
                    <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.4 }}>{selectedCase.description}</p>
                  </Field>
                )}
              </Grid>

              <Divider />

              {/* Citizen Details */}
              <div>
                <SectionLabel>📋 {t.beneficiaryInfo}</SectionLabel>
                <div style={{ marginTop: 10 }}>
                  <Grid cols={3} gap={12}>
                    <Field label={t.phone}>
                      <span style={{ fontSize: 12, color: C.white }}>{selectedCase.citizen?.phone || "-"}</span>
                    </Field>
                    <Field label={t.aadhaarRef}>
                      <span style={{ fontSize: 12, color: C.white }}>{selectedCase.citizen?.aadhaar_reference || "-"}</span>
                    </Field>
                    <Field label={t.village}>
                      <span style={{ fontSize: 12, color: C.white }}>{selectedCase.citizen?.village || "-"}</span>
                    </Field>
                    <Field label={t.address} span={3}>
                      <span style={{ fontSize: 12, color: C.white }}>{selectedCase.citizen?.address || "-"}</span>
                    </Field>
                  </Grid>
                </div>
              </div>

              <Divider />

              {/* Visit Scheduler */}
              {selectedCase.status !== "Resolved" && (
                <div>
                  <SectionLabel>📅 {t.scheduleTitle}</SectionLabel>
                  <form onSubmit={handleSaveVisitDate} style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: C.textLabel, display: "block", marginBottom: 6 }}>{t.visitDate}</label>
                      <input
                        type="datetime-local"
                        value={visitDateText}
                        onChange={e => setVisitDateText(e.target.value)}
                        required
                        style={{
                          ...inputStyle,
                          padding: "8px 12px"
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingCase || !visitDateText}
                      style={{
                        padding: "10px 20px", borderRadius: 8, border: "none",
                        background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                        color: C.bg, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
                      }}
                    >
                      {updatingCase ? "..." : t.saveDateBtn}
                    </button>
                  </form>
                </div>
              )}

              {/* Action Log List (Checklists) */}
              <div>
                <SectionLabel>✅ {t.tasksTitle}</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  {selectedCase.follow_up_tasks.map((task, idx) => (
                    <div
                      key={idx}
                      onClick={() => { if (selectedCase.status !== "Resolved") handleToggleTask(idx); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        background: task.completed ? "rgba(52,211,153,0.05)" : C.bgInput,
                        border: `1px solid ${task.completed ? C.green : "rgba(255,255,255,0.05)"}`,
                        borderRadius: 8,
                        cursor: selectedCase.status === "Resolved" ? "not-allowed" : "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      <span style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: `2px solid ${task.completed ? C.green : C.textMuted}`,
                        background: task.completed ? C.green : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: C.bg, fontWeight: 800
                      }}>
                        {task.completed ? "✓" : ""}
                      </span>
                      <span style={{
                        fontSize: 12, color: task.completed ? C.textMuted : C.white,
                        textDecoration: task.completed ? "line-through" : "none"
                      }}>
                        {task.task_name}
                      </span>
                    </div>
                  ))}

                  {/* Add Custom task inline */}
                  {selectedCase.status !== "Resolved" && (
                    <form onSubmit={handleAddCustomTask} style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <input
                        type="text"
                        value={customTask}
                        onChange={e => setCustomTask(e.target.value)}
                        placeholder={t.addTaskPlaceholder}
                        required
                        style={{
                          ...inputStyle,
                          padding: "8px 12px",
                          flex: 1
                        }}
                      />
                      <button
                        type="submit"
                        disabled={updatingCase || !customTask.trim()}
                        style={{
                          padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                          background: "transparent", color: C.accent, fontWeight: 700, fontSize: 12,
                          cursor: "pointer", fontFamily: "inherit"
                        }}
                      >
                        {t.addTaskBtn}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
