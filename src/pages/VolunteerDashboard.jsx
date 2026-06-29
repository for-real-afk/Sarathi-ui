import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

const DEFAULT_CASES = [
  { id: "case-101", name: "Venkata Rao", phone: "9848022338", status: "APPROVED", date: "2026-06-15", district: "Krishna", scheme: "Aasara Pension" },
  { id: "case-102", name: "Anusha G.", phone: "8897011223", status: "PENDING", date: "2026-06-20", district: "Anantapur", scheme: "Amma Vodi" },
  { id: "case-103", name: "Ramakrishnayya", phone: "9440155667", status: "REJECTED", date: "2026-06-25", district: "Kurnool", scheme: "Ujjwala Yojana" }
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    let stored = localStorage.getItem("sarathi_cases_db");
    if (!stored) {
      localStorage.setItem("sarathi_cases_db", JSON.stringify(DEFAULT_CASES));
      stored = JSON.stringify(DEFAULT_CASES);
    }
    setCases(JSON.parse(stored));
  }, []);

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Welcome Widget */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: C.accent, fontWeight: 800 }}>
            🤝 Volunteer Field Operations
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.textMuted }}>
            Welcome, {user?.name}. Execute field audits, capture household welfare surveys, and view eligibility statuses.
          </p>
        </div>
        <button
          onClick={handleStartSurvey}
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
            color: C.bg,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(251,191,36,0.3)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          📝 Start Household Survey Wizard
        </button>
      </div>

      {/* Field Progress KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        {[
          { title: "Surveys Completed", value: cases.length, icon: "📊", color: C.green },
          { title: "Pending Hub Audit", value: cases.filter(c => c.status === "PENDING").length, icon: "⏳", color: C.accent },
          { title: "Assigned Households", value: 12, icon: "🏠", color: C.textLabel },
          { title: "Target Deficit", value: Math.max(0, 12 - cases.length), icon: "🎯", color: C.red }
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
                Field Metric
              </div>
            </div>
            <div style={{ fontSize: 28 }}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Cases History List */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 800, color: C.white }}>
          📋 Audited Household Registrations
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: 12, color: C.textMuted }}>
          Review the list of citizen files you have successfully submitted and their current hub verification statuses.
        </p>

        <div style={{ overflowX: "auto" }}>
          {cases.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.textMuted, fontSize: 13 }}>
              No surveys captured yet. Launch the survey wizard to insert records.
            </div>
          ) : (
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
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>District</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Matched Scheme</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  let statusBg = "rgba(251,191,36,0.1)";
                  let statusBorder = C.accent;
                  let statusText = C.accent;

                  if (c.status === "APPROVED") {
                    statusBg = "rgba(52,211,153,0.1)";
                    statusBorder = C.green;
                    statusText = C.green;
                  } else if (c.status === "REJECTED") {
                    statusBg = "rgba(248,113,113,0.1)";
                    statusBorder = C.red;
                    statusText = C.red;
                  }

                  return (
                    <tr key={c.id} style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <td style={{ padding: 14, fontSize: 12, color: C.accent, fontWeight: 700 }}>{c.id.toUpperCase()}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.white, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.textMuted }}>{c.phone}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.textMuted }}>{c.district}</td>
                      <td style={{ padding: 14, fontSize: 13, color: C.text }}>{c.scheme || "None / General"}</td>
                      <td style={{ padding: 14, fontSize: 12, color: C.textMuted }}>{c.date}</td>
                      <td style={{ padding: 14, textAlign: "right" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: statusBg,
                          border: `1px solid ${statusBorder}`,
                          color: statusText,
                          fontSize: 9,
                          fontWeight: 800,
                          display: "inline-block"
                        }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
