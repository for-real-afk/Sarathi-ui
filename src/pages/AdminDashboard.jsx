import { useState, useEffect } from "react";
import { useAuth, getUsersDB, saveUsersDB } from "../context/AuthContext";
import { C } from "../theme";

export default function AdminDashboard() {
  const { user, addNotification } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [tempRole, setTempRole] = useState("");
  const [kpis, setKpis] = useState({
    citizens: 142,
    volunteers: 18,
    hubs: 6,
    health: "99.8%"
  });

  useEffect(() => {
    setUsers(getUsersDB());
  }, []);

  // Update a user's role
  const handleRoleChange = (userId, newRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUsers(updated);
    saveUsersDB(updated);
    
    // If we changed the role of the currently logged-in user, notify them
    if (user && user.id === userId) {
      addNotification("You updated your own role. Refresh or re-log to apply permissions.", "warning");
    } else {
      addNotification("User role updated successfully!", "success");
    }
    setEditingUserId(null);
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Top Welcome Widget */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <h2 style={{ margin: 0, fontSize: 20, color: C.accent, fontWeight: 800 }}>
          ⚙️ Admin Console Dashboard
        </h2>
        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: C.textMuted }}>
          Welcome back, {user?.name}. You hold complete administrative clearance across all hub routes, system roles, and cases.
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
          { title: "Audited Citizens", value: kpis.citizens, icon: "👥", change: "+12 this week" },
          { title: "Active Volunteers", value: kpis.volunteers, icon: "🤝", change: "4 regions covered" },
          { title: "Integrated Hubs", value: kpis.hubs, icon: "🏢", change: "2 State, 4 District" },
          { title: "System Gateway Health", value: kpis.health, icon: "⚡", change: "Latency < 45ms" }
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
              <div style={{ fontSize: 10, color: C.green }}>
                {kpi.change}
              </div>
            </div>
            <div style={{ fontSize: 28 }}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Interactive User Role Management */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 800, color: C.white }}>
          👥 Identity & Access Control List
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: 12, color: C.textMuted }}>
          The active roster of registered system operators. Modify roles below to test dynamic route clearance changes.
        </p>

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
                <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Name</th>
                <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Email Address</th>
                <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700 }}>Assigned Role</th>
                <th style={{ padding: 14, fontSize: 11, color: C.textLabel, textTransform: "uppercase", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingUserId === u.id;
                const isCurrentUser = user && user.id === u.id;

                let roleColor = C.accent;
                if (u.role === "ADMIN") roleColor = "#f59e0b"; // Darker amber
                else if (u.role === "VOLUNTEER") roleColor = C.green;
                else if (u.role === "CITIZEN") roleColor = C.textLabel;
                else if (u.role === "CENTRAL_HUB") roleColor = "#60a5fa"; // blue-400
                else if (u.role === "LOCAL_HUB") roleColor = "#c084fc"; // purple-400

                return (
                  <tr key={u.id} style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: 14, fontSize: 13, color: C.white, fontWeight: 600 }}>
                      {u.name} {isCurrentUser && <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 11 }}>(You)</span>}
                    </td>
                    <td style={{ padding: 14, fontSize: 13, color: C.textMuted }}>{u.email}</td>
                    <td style={{ padding: 14 }}>
                      {isEditing ? (
                        <select
                          value={tempRole}
                          onChange={(e) => setTempRole(e.target.value)}
                          style={{
                            background: C.bgInput,
                            border: `1px solid ${C.accent}`,
                            borderRadius: 6,
                            color: C.text,
                            padding: "4px 8px",
                            fontSize: 12,
                            outline: "none"
                          }}
                        >
                          {["ADMIN", "CENTRAL_HUB", "LOCAL_HUB", "VOLUNTEER", "CITIZEN"].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: `rgba(255,255,255,0.05)`,
                          border: `1px solid ${roleColor}`,
                          color: roleColor,
                          fontSize: 10,
                          fontWeight: 800,
                          display: "inline-block"
                        }}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 14, textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleRoleChange(u.id, tempRole)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 4,
                              background: C.green,
                              border: "none",
                              color: C.bg,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 4,
                              background: "transparent",
                              border: `1px solid ${C.border}`,
                              color: C.textMuted,
                              fontSize: 11,
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setTempRole(u.role);
                          }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            color: C.accent,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s"
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
                          Modify Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
