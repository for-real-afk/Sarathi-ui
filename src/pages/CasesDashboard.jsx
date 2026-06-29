import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

const DEFAULT_CASES = [
  { id: "case-101", name: "Venkata Rao", phone: "9848022338", status: "APPROVED", date: "2026-06-15", district: "Krishna", scheme: "Aasara Pension" },
  { id: "case-102", name: "Anusha G.", phone: "8897011223", status: "PENDING", date: "2026-06-20", district: "Anantapur", scheme: "Amma Vodi" },
  { id: "case-103", name: "Ramakrishnayya", phone: "9440155667", status: "REJECTED", date: "2026-06-25", district: "Kurnool", scheme: "Ujjwala Yojana" }
];

export default function CasesDashboard() {
  const { user, addNotification } = useAuth();
  const [cases, setCases] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    let stored = localStorage.getItem("sarathi_cases_db");
    if (!stored) {
      localStorage.setItem("sarathi_cases_db", JSON.stringify(DEFAULT_CASES));
      stored = JSON.stringify(DEFAULT_CASES);
    }
    setCases(JSON.parse(stored));
  }, []);

  const handleUpdateStatus = (caseId, newStatus) => {
    const updated = cases.map(c => {
      if (c.id === caseId) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    setCases(updated);
    localStorage.setItem("sarathi_cases_db", JSON.stringify(updated));
    addNotification(`Case ${caseId.toUpperCase()} status updated to ${newStatus}`, "success");
    setSelectedCase(null);
  };

  const filteredCases = cases.filter(c => {
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (c.scheme || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Welcome Widget */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <h2 style={{ margin: 0, fontSize: 20, color: C.accent, fontWeight: 800 }}>
          🏢 Hub Operations - Case Audits
        </h2>
        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.textMuted }}>
          Logged in as: {user?.name} ({user?.role}). Manage submitted welfare case files, verify documentation gaps, and sign off applications.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        {[
          { title: "Total Cases Received", value: cases.length, icon: "📁", color: C.white },
          { title: "Pending Hub Audit", value: cases.filter(c => c.status === "PENDING").length, icon: "⏳", color: C.accent },
          { title: "Approved Applications", value: cases.filter(c => c.status === "APPROVED").length, icon: "✅", color: C.green },
          { title: "Rejected / Deficit Files", value: cases.filter(c => c.status === "REJECTED").length, icon: "❌", color: C.red }
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                {kpi.title}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: "4px 0" }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 10, color: kpi.color, fontWeight: 600 }}>
                System File Status
              </div>
            </div>
            <div style={{ fontSize: 28 }}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter Roster & Main Grid */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Cases Directory Table */}
        <div style={{
          flex: "2 1 500px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: C.white }}>
            📋 Hub Auditing Roster
          </h3>

          {/* Filters Row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by name, case id, scheme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                background: C.bgInput,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                color: C.text,
                fontSize: 13,
                outline: "none"
              }}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: C.bgInput,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.text,
                padding: "8px 16px",
                fontSize: 13,
                outline: "none"
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: C.bgTable,
              borderRadius: 8,
              overflow: "hidden"
            }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, textAlign: "left" }}>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Case ID</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Citizen</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>District</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Scheme</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => {
                  let statusColor = C.accent;
                  if (c.status === "APPROVED") statusColor = C.green;
                  else if (c.status === "REJECTED") statusColor = C.red;

                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: 14, fontSize: 12, color: C.accent, fontWeight: 700 }}>{c.id.toUpperCase()}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.white, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.textMuted }}>{c.district}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.text }}>{c.scheme}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${statusColor}`,
                          color: statusColor,
                          fontSize: 9,
                          fontWeight: 800,
                          display: "inline-block"
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: 14, textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedCase(c)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            color: C.accent,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.accent;
                            e.currentTarget.style.background = C.accentDim;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Audit File
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Details Panel */}
        <div style={{
          flex: "1 1 300px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24,
          alignSelf: "flex-start"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: C.white }}>
            🔍 Case Audit Panel
          </h3>

          {selectedCase ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span style={{ fontSize: 10, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Citizen File Details</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.accent, marginTop: 4 }}>
                  {selectedCase.name}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  Case Ref: {selectedCase.id.toUpperCase()} · Phone: {selectedCase.phone}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Requested Welfare Discovery</span>
                <div style={{ fontSize: 13, color: C.white, marginTop: 4, fontWeight: 600 }}>
                  {selectedCase.scheme}
                </div>
              </div>

              <div style={{ padding: 12, background: C.bgInput, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, display: "block", marginBottom: 6 }}>Hub Action Verification</span>
                <p style={{ margin: "0 0 12px 0", fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>
                  Review documentation matches, verify household structure, and update file status:
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.id, "APPROVED")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: C.green,
                      border: "none",
                      color: C.bg,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.id, "REJECTED")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: C.red,
                      border: "none",
                      color: C.bg,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Reject Deficit
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.textMuted,
                  fontSize: 11,
                  cursor: "pointer"
                }}
              >
                Close Audit View
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontSize: 12 }}>
              Select a citizen case from the auditing roster to perform verification actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
