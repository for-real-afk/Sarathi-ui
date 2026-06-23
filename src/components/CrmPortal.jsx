import { useState, useEffect } from "react";
import { C } from "../theme";
import {
  TextInput,
  SelectInput,
  Field,
  Grid,
  Divider,
  SectionLabel
} from "./UI";

const TX = {
  en: {
    crmTitle: "NGO Citizen Registry & Household CRM",
    searchPlaceholder: "Search by Name...",
    phonePlaceholder: "Search by Phone...",
    villagePlaceholder: "Search by Village...",
    searchBtn: "Search",
    clearBtn: "Clear",
    citizenList: "Beneficiaries List",
    noCitizens: "No beneficiaries found.",
    loading: "Loading beneficiaries...",
    selectPrompt: "Select a beneficiary from the list to view their CRM file, household profile, and timeline history.",
    tabRegistry: "Demographics & Household",
    tabTimeline: "Timeline Logs",
    editBtn: "Edit Profile",
    saveBtn: "Save Changes",
    cancelBtn: "Cancel",
    deleteBtn: "Delete Beneficiary",
    timelineTitle: "Progress Timeline",
    logEventTitle: "Log Timeline Event",
    eventType: "Event Type",
    eventDescription: "Description / Notes",
    addEventBtn: "Add Event",
    profileTitle: "Citizen Profile Information",
    householdTitle: "Household Characteristics",
    familyMembersTitle: "Family Members Details",
    
    // Fields
    name: "Full Name",
    phone: "Phone Number",
    aadhaarRef: "Aadhaar Reference",
    gender: "Gender",
    age: "Age",
    address: "Residential Address",
    state: "State",
    district: "District",
    mandal: "Mandal",
    village: "Village",
    
    income: "Household Income",
    housing: "Housing Status",
    land: "Land Ownership",
    occupation: "Primary Occupation",
    poverty: "Poverty Classification",
    
    memName: "Name",
    memRelation: "Relation",
    memAge: "Age",
    memGender: "Gender",
    memEdu: "Education",
    memEmp: "Occupation",
    memDisability: "Disability",
    memIllness: "Illness",
  },
  te: {
    crmTitle: "ఎన్జీఓ సిటిజన్ రిజిస్ట్రీ & హౌస్ హోల్డ్ CRM",
    searchPlaceholder: "పేరుతో శోధించండి...",
    phonePlaceholder: "ఫోన్ ద్వారా శోధించండి...",
    villagePlaceholder: "గ్రామం ద్వారా శోధించండి...",
    searchBtn: "శోధన",
    clearBtn: "క్లియర్",
    citizenList: "లబ్ధిదారుల జాబితా",
    noCitizens: "లబ్ధిదారులు ఎవరూ కనుగొనబడలేదు.",
    loading: "లోడ్ అవుతోంది...",
    selectPrompt: "వారి CRM ఫైల్, గృహ ప్రొఫైల్ మరియు కాలక్రమ చరిత్రను వీక్షించడానికి జాబితా నుండి లబ్ధిదారుని ఎంచుకోండి.",
    tabRegistry: "జనాభా వివరాలు & గృహం",
    tabTimeline: "టైమ్‌లైన్ లాగ్‌లు",
    editBtn: "ప్రొఫైల్ సవరించు",
    saveBtn: "మార్పులను సేవ్ చేయి",
    cancelBtn: "రద్దు చేయి",
    deleteBtn: "లబ్ధిదారుని తొలగించు",
    timelineTitle: "పురోగతి టైమ్‌లైన్",
    logEventTitle: "టైమ్‌లైన్ ఈవెంట్‌ను లాగ్ చేయి",
    eventType: "ఈవెంట్ రకం",
    eventDescription: "వివరణ / గమనికలు",
    addEventBtn: "ఈవెంట్ జోడించు",
    profileTitle: "సిటిజన్ ప్రొఫైల్ సమాచారం",
    householdTitle: "గృహ లక్షణాలు",
    familyMembersTitle: "కుటుంబ సభ్యుల వివరాలు",
    
    name: "పూర్తి పేరు",
    phone: "ఫోన్ నంబర్",
    aadhaarRef: "ఆధార్ రిఫరెన్స్",
    gender: "లింగం",
    age: "వయస్సు",
    address: "నివాస చిరునామా",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    mandal: "మండలం",
    village: "గ్రామం",
    
    income: "గృహ ఆదాయం",
    housing: "గృహ స్థితి",
    land: "భూమి యాజమాన్యం",
    occupation: "ప్రాథమిక వృత్తి",
    poverty: "పేదరికం వర్గీకరణ",
    
    memName: "పేరు",
    memRelation: "సంబంధం",
    memAge: "వయస్సు",
    memGender: "లింగం",
    memEdu: "విద్య",
    memEmp: "ఉపాధి",
    memDisability: "వికలాంగత",
    memIllness: "అనారోగ్యం",
  }
};

export default function CrmPortal({ lang, userToken }) {
  const t = TX[lang];
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search filter states
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchVillage, setSearchVillage] = useState("");

  // Details states
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState("profile"); // "profile" | "timeline"

  // Edit states
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Log event states
  const [eventType, setEventType] = useState("Volunteer Visit");
  const [eventDesc, setEventDesc] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  const fetchCitizens = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (searchName) q.append("name", searchName);
      if (searchPhone) q.append("phone", searchPhone);
      if (searchVillage) q.append("village", searchVillage);

      const res = await fetch(`http://localhost:4000/api/citizens?${q.toString()}`, {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCitizens(data);
      } else {
        setError(lang === "en" ? "Failed to retrieve registry data." : "రిజిస్ట్రీ డేటాను తిరిగి పొందడంలో విఫలమైంది.");
      }
    } catch (e) {
      setError(lang === "en" ? "Cannot connect to CRM backend." : "CRM బ్యాకెండ్‌కి కనెక్ట్ కాలేదు.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchCitizens();
    }
  }, [userToken]);

  const selectCitizen = async (id) => {
    setLoadingDetail(true);
    setEditing(false);
    try {
      const res = await fetch(`http://localhost:4000/api/citizens/${id}`, {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCitizen(data);
        // Pre-fill form
        setEditForm({
          name: data.name,
          phone: data.phone || "",
          aadhaar_reference: data.aadhaar_reference || "",
          gender: data.gender || "",
          age: data.age || "",
          address: data.address || "",
          state: data.state || "",
          district: data.district || "",
          mandal: data.mandal || "",
          village: data.village || "",
          household_income: data.household?.income || "",
          household_housing: data.household?.housing_status || "",
          household_land: data.household?.land_ownership || "",
          household_occupation: data.household?.occupation || "",
          household_poverty: data.household?.poverty_classification || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`http://localhost:4000/api/citizens/${selectedCitizen.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          aadhaar_reference: editForm.aadhaar_reference,
          gender: editForm.gender,
          age: editForm.age ? parseInt(editForm.age, 10) : null,
          address: editForm.address,
          state: editForm.state,
          district: editForm.district,
          mandal: editForm.mandal,
          village: editForm.village,
          household: selectedCitizen.household ? {
            income: editForm.household_income,
            housing_status: editForm.household_housing,
            land_ownership: editForm.household_land,
            occupation: editForm.household_occupation,
            poverty_classification: editForm.household_poverty
          } : null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCitizen(data);
        setEditing(false);
        // Refresh registry list
        fetchCitizens();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(lang === "en" ? "Delete this citizen profile?" : "ఈ సిటిజన్ ప్రొఫైల్‌ను తొలగించాలా?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/citizens/${selectedCitizen.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (res.ok) {
        setSelectedCitizen(null);
        fetchCitizens();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventDesc.trim() || savingEvent) return;
    setSavingEvent(true);
    try {
      const res = await fetch(`http://localhost:4000/api/citizens/${selectedCitizen.id}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          event_type: eventType,
          description: eventDesc
        })
      });
      if (res.ok) {
        const newEv = await res.json();
        setSelectedCitizen(prev => ({
          ...prev,
          timeline: [newEv, ...prev.timeline]
        }));
        setEventDesc("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvent(false);
    }
  };

  // Color mapper for timeline event tags
  const getEventTagStyle = (type) => {
    switch (type) {
      case "Profile Creation":
        return { bg: "rgba(59,130,246,0.12)", border: "#3b82f6", color: "#60a5fa" };
      case "Eligibility Runs":
        return { bg: "rgba(168,85,247,0.12)", border: "#a855f7", color: "#c084fc" };
      case "Case Created":
        return { bg: "rgba(245,158,11,0.12)", border: "#f59e0b", color: "#fbbf24" };
      case "Volunteer Visit":
        return { bg: "rgba(16,185,129,0.12)", border: "#10b981", color: "#34d399" };
      case "Resolution":
        return { bg: "rgba(234,88,12,0.12)", border: "#ea580c", color: "#f97316" };
      default:
        return { bg: "rgba(100,116,139,0.12)", border: "#64748b", color: "#94a3b8" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search Header panel */}
      <div style={{
        padding: "20px 24px",
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800, color: C.accent }}>
          👥 {t.crmTitle}
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <TextInput value={searchName} onChange={setSearchName} placeholder={t.searchPlaceholder} />
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <TextInput value={searchPhone} onChange={setSearchPhone} placeholder={t.phonePlaceholder} />
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <TextInput value={searchVillage} onChange={setSearchVillage} placeholder={t.villagePlaceholder} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchCitizens} style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
              color: C.bg, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
            }}>
              🔍 {t.searchBtn}
            </button>
            <button onClick={() => { setSearchName(""); setSearchPhone(""); setSearchVillage(""); setCitizens([]); }} style={{
              padding: "10px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
            }}>
              🧹 {t.clearBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split CRM View */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        
        {/* Left Side: Citizen List (38% width) */}
        <div style={{
          flex: "1 1 340px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 16,
          maxHeight: "calc(100vh - 240px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 700, color: C.textLabel, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
            📋 {t.citizenList} ({citizens.length})
          </h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>{t.loading}</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "20px 10px", color: C.red, fontSize: 13 }}>⚠️ {error}</div>
          ) : citizens.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>{t.noCitizens}</div>
          ) : (
            citizens.map((citizen) => {
              const active = selectedCitizen && selectedCitizen.id === citizen.id;
              return (
                <div
                  key={citizen.id}
                  onClick={() => selectCitizen(citizen.id)}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: active ? C.accentDim : C.bgInput,
                    border: `1px solid ${active ? C.accent : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.accent; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: active ? C.accent : C.white }}>
                      {citizen.name}
                    </span>
                    <span style={{
                      padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                      background: citizen.household?.poverty_classification === "BPL" ? C.greenDim : "rgba(255,255,255,0.05)",
                      color: citizen.household?.poverty_classification === "BPL" ? C.green : C.textMuted
                    }}>
                      {citizen.household?.poverty_classification || "APL"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted }}>
                    <span>📞 {citizen.phone || "No phone"}</span>
                    <span>📍 {citizen.village || "No village"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Profile Viewer (62% width) */}
        <div style={{
          flex: "2 1 500px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
          minHeight: 450,
          display: "flex",
          flexDirection: "column"
        }}>
          {loadingDetail ? (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite" }}>🔄</div>
              <div style={{ color: C.textMuted }}>{lang === "en" ? "Retrieving case file..." : "కేసు ఫైల్‌ను తిరిగి పొందుతోంది..."}</div>
            </div>
          ) : !selectedCitizen ? (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", textAlign: "center", color: C.textMuted, padding: 40 }}>
              <div>
                <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
                <div style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>{t.selectPrompt}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
              
              {/* Profile Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.white }}>
                    👤 {selectedCitizen.name}
                  </h3>
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    ID: #{selectedCitizen.id} · Registered: {new Date(selectedCitizen.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!editing ? (
                    <>
                      <button onClick={() => setEditing(true)} style={{
                        padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                        background: "transparent", color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                      }}>{t.editBtn}</button>
                      <button onClick={handleDelete} style={{
                        padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.red}`,
                        background: "transparent", color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                      }}>{t.deleteBtn}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSaveEdit} disabled={savingEdit} style={{
                        padding: "6px 12px", borderRadius: 6, border: "none",
                        background: C.green, color: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                      }}>{savingEdit ? "..." : t.saveBtn}</button>
                      <button onClick={() => setEditing(false)} style={{
                        padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                        background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                      }}>{t.cancelBtn}</button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs Switcher */}
              <div style={{ display: "flex", gap: 8, borderBottom: `1px solid rgba(255,255,255,0.05)`, paddingBottom: 8 }}>
                <button
                  onClick={() => setDetailTab("profile")}
                  style={{
                    padding: "6px 16px", borderRadius: 6, border: "none",
                    background: detailTab === "profile" ? C.accentDim : "transparent",
                    color: detailTab === "profile" ? C.accent : C.textMuted,
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  🏡 {t.tabRegistry}
                </button>
                <button
                  onClick={() => setDetailTab("timeline")}
                  style={{
                    padding: "6px 16px", borderRadius: 6, border: "none",
                    background: detailTab === "timeline" ? C.accentDim : "transparent",
                    color: detailTab === "timeline" ? C.accent : C.textMuted,
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  ⏱️ {t.tabTimeline} ({selectedCitizen.timeline.length})
                </button>
              </div>

              {/* Profile Details Tab */}
              {detailTab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* Demographic info card */}
                  <div>
                    <SectionLabel>📋 {t.profileTitle}</SectionLabel>
                    <div style={{ marginTop: 10 }}>
                      <Grid cols={3} gap={16}>
                        <Field label={t.name}>
                          {editing ? (
                            <TextInput value={editForm.name} onChange={v => setEditForm(p => ({ ...p, name: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{selectedCitizen.name}</span>
                          )}
                        </Field>
                        <Field label={t.phone}>
                          {editing ? (
                            <TextInput value={editForm.phone} onChange={v => setEditForm(p => ({ ...p, phone: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.phone || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.aadhaarRef}>
                          {editing ? (
                            <TextInput value={editForm.aadhaar_reference} onChange={v => setEditForm(p => ({ ...p, aadhaar_reference: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{selectedCitizen.aadhaar_reference || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.gender}>
                          {editing ? (
                            <SelectInput value={editForm.gender} onChange={v => setEditForm(p => ({ ...p, gender: v }))} options={[["Male","Male"],["Female","Female"],["Other","Other"]]} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.gender || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.age}>
                          {editing ? (
                            <TextInput value={editForm.age} type="number" onChange={v => setEditForm(p => ({ ...p, age: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.age || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.village}>
                          {editing ? (
                            <TextInput value={editForm.village} onChange={v => setEditForm(p => ({ ...p, village: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.village || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.mandal}>
                          {editing ? (
                            <TextInput value={editForm.mandal} onChange={v => setEditForm(p => ({ ...p, mandal: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.mandal || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.district}>
                          {editing ? (
                            <TextInput value={editForm.district} onChange={v => setEditForm(p => ({ ...p, district: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.district || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.state}>
                          {editing ? (
                            <TextInput value={editForm.state} onChange={v => setEditForm(p => ({ ...p, state: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.state || "-"}</span>
                          )}
                        </Field>
                        <Field label={t.address} span={3}>
                          {editing ? (
                            <TextInput value={editForm.address} onChange={v => setEditForm(p => ({ ...p, address: v }))} />
                          ) : (
                            <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.address || "-"}</span>
                          )}
                        </Field>
                      </Grid>
                    </div>
                  </div>

                  <Divider />

                  {/* Household attributes */}
                  {selectedCitizen.household ? (
                    <div>
                      <SectionLabel>🏡 {t.householdTitle}</SectionLabel>
                      <div style={{ marginTop: 10 }}>
                        <Grid cols={3} gap={16}>
                          <Field label={t.income}>
                            {editing ? (
                              <TextInput value={editForm.household_income} onChange={v => setEditForm(p => ({ ...p, household_income: v }))} />
                            ) : (
                              <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.household.income || "-"}</span>
                            )}
                          </Field>
                          <Field label={t.housing}>
                            {editing ? (
                              <TextInput value={editForm.household_housing} onChange={v => setEditForm(p => ({ ...p, household_housing: v }))} />
                            ) : (
                              <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.household.housing_status || "-"}</span>
                            )}
                          </Field>
                          <Field label={t.land}>
                            {editing ? (
                              <TextInput value={editForm.household_land} onChange={v => setEditForm(p => ({ ...p, household_land: v }))} />
                            ) : (
                              <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.household.land_ownership || "-"}</span>
                            )}
                          </Field>
                          <Field label={t.occupation}>
                            {editing ? (
                              <TextInput value={editForm.household_occupation} onChange={v => setEditForm(p => ({ ...p, household_occupation: v }))} />
                            ) : (
                              <span style={{ fontSize: 13, color: C.white }}>{selectedCitizen.household.occupation || "-"}</span>
                            )}
                          </Field>
                          <Field label={t.poverty}>
                            {editing ? (
                              <SelectInput value={editForm.household_poverty} onChange={v => setEditForm(p => ({ ...p, household_poverty: v }))} options={[["APL","APL"],["BPL","BPL"]]} />
                            ) : (
                              <span style={{
                                fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4, display: "inline-block",
                                background: selectedCitizen.household.poverty_classification === "BPL" ? C.greenDim : "rgba(255,255,255,0.05)",
                                color: selectedCitizen.household.poverty_classification === "BPL" ? C.green : C.textMuted
                              }}>{selectedCitizen.household.poverty_classification || "-"}</span>
                            )}
                          </Field>
                        </Grid>
                      </div>

                      {/* Family members sub-table */}
                      {selectedCitizen.household.family_members && selectedCitizen.household.family_members.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                          <SectionLabel>👨‍👩‍👧 {t.familyMembersTitle}</SectionLabel>
                          <div style={{ marginTop: 10, overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" }}>
                              <thead>
                                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.border}` }}>
                                  {["Name", "Relation", "Age", "Gender", "Education", "Occupation", "Disability", "Illness"].map(h => (
                                    <th key={h} style={{ padding: "8px 12px", fontWeight: 700, color: C.accent }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedCitizen.household.family_members.map((member, mIdx) => (
                                  <tr key={mIdx} style={{ borderBottom: mIdx < selectedCitizen.household.family_members.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                                    <td style={{ padding: "8px 12px", color: C.white, fontWeight: 600 }}>{member.name}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.relationship}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.age}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.gender}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.education || "-"}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.occupation || "-"}</td>
                                    <td style={{ padding: "8px 12px", color: member.disability === "Yes" ? C.red : C.text }}>{member.disability}</td>
                                    <td style={{ padding: "8px 12px" }}>{member.illness || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Timeline Tab */}
              {detailTab === "timeline" && (
                <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 20 }}>
                  
                  {/* Event creation form */}
                  <form onSubmit={handleAddEvent} style={{
                    padding: 14,
                    background: C.bgInput,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.accent }}>📝 {t.logEventTitle}</h4>
                    <Grid cols={2} gap={12}>
                      <Field label={t.eventType}>
                        <SelectInput value={eventType} onChange={setEventType} options={[
                          ["Volunteer Visit", "Volunteer Visit"],
                          ["Case Created", "Case Created"],
                          ["Eligibility Runs", "Eligibility Runs"],
                          ["Resolution", "Resolution"]
                        ]} />
                      </Field>
                      <Field label={t.eventDescription}>
                        <input
                          type="text"
                          value={eventDesc}
                          onChange={e => setEventDesc(e.target.value)}
                          placeholder="e.g. Discussed scheme applications..."
                          style={{
                            ...inputStyle,
                            padding: "9px 12px"
                          }}
                        />
                      </Field>
                    </Grid>
                    <button
                      type="submit"
                      disabled={savingEvent || !eventDesc.trim()}
                      style={{
                        padding: "8px 16px", borderRadius: 6, border: "none",
                        background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                        color: C.bg, fontWeight: 800, fontSize: 12, cursor: "pointer",
                        alignSelf: "flex-end", fontFamily: "inherit"
                      }}
                    >
                      {savingEvent ? "..." : t.addEventBtn}
                    </button>
                  </form>

                  {/* Vertical Timeline logs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textLabel }}>⏱️ {t.timelineTitle}</h4>
                    <div style={{
                      position: "relative",
                      paddingLeft: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 20
                    }}>
                      {/* Central vertical line */}
                      <div style={{
                        position: "absolute", left: 5, top: 8, bottom: 8, width: 2,
                        background: "rgba(255,255,255,0.06)"
                      }} />

                      {selectedCitizen.timeline.map((event, idx) => {
                        const styleConfig = getEventTagStyle(event.event_type);
                        return (
                          <div key={event.id || idx} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
                            {/* Dot indicator */}
                            <div style={{
                              position: "absolute", left: -19, top: 4, width: 10, height: 10, borderRadius: "50%",
                              background: styleConfig.color, border: `2px solid ${C.bgCard}`,
                              boxShadow: `0 0 8px ${styleConfig.color}`
                            }} />

                            {/* Event header info */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{
                                padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 800,
                                background: styleConfig.bg, border: `1px solid ${styleConfig.border}`, color: styleConfig.color
                              }}>
                                {event.event_type}
                              </span>
                              <span style={{ fontSize: 11, color: C.textMuted }}>
                                {new Date(event.event_date || event.created_at).toLocaleString()}
                              </span>
                            </div>

                            {/* Event Description */}
                            {event.description && (
                              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.text, lineHeight: 1.4 }}>
                                {event.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
