import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!user) {
      navigate("/login");
    } else {
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "VOLUNTEER") navigate("/volunteers");
      else if (user.role === "CITIZEN") navigate("/citizens");
      else navigate("/cases");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: "24px",
      textAlign: "center"
    }}>
      <div style={{ maxWidth: 480, padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: C.red, letterSpacing: "0.05em" }}>
          403 - FORBIDDEN
        </h1>
        <h2 style={{ margin: "12px 0 20px 0", fontSize: 18, fontWeight: 700, color: C.white }}>
          Insufficient Permissions
        </h2>
        <p style={{ margin: "0 0 32px 0", fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
          You do not have administrative clearance or matching roles to view this directory. Endpoint routes are strictly segmented under Saarthi access policies.
        </p>

        {user && (
          <div style={{
            marginBottom: 32,
            padding: 14,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 12
          }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>Current Account:</span>
            <strong style={{ fontSize: 12, color: C.accent }}>{user.name}</strong>
            <span style={{
              padding: "2px 8px",
              background: "rgba(248, 113, 113, 0.15)",
              border: `1px solid ${C.red}`,
              color: C.red,
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 800
            }}>{user.role}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleReturn}
            style={{
              padding: "12px 28px",
              borderRadius: 8,
              border: `1px solid ${C.accent}`,
              background: C.accentDim,
              color: C.accent,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.accent;
              e.currentTarget.style.color = C.bg;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = C.accentDim;
              e.currentTarget.style.color = C.accent;
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
