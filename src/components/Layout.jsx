import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function Layout() {
  const { user, logout, refreshAccessToken, authNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine which links are visible based on roles
  const getNavLinks = () => {
    if (!user) return [];
    const role = user.role;
    const links = [];

    if (role === "ADMIN") {
      links.push({ path: "/admin", label: "⚙️ Admin Hub" });
      links.push({ path: "/cases", label: "📁 Cases" });
      links.push({ path: "/volunteers", label: "🤝 Field Ops" });
      links.push({ path: "/citizens", label: "👤 Citizen View" });
      links.push({ path: "/survey", label: "📝 Survey Wizard" });
    } else if (role === "CENTRAL_HUB") {
      links.push({ path: "/cases", label: "📁 Hub Cases" });
      links.push({ path: "/volunteers", label: "🤝 Field Ops" });
    } else if (role === "LOCAL_HUB") {
      links.push({ path: "/cases", label: "📁 Local Cases" });
    } else if (role === "VOLUNTEER") {
      links.push({ path: "/volunteers", label: "🤝 Volunteer Hub" });
      links.push({ path: "/survey", label: "📝 Survey Wizard" });
    } else if (role === "CITIZEN") {
      links.push({ path: "/citizens", label: "👤 My Portal" });
      links.push({ path: "/survey", label: "📝 Discovery Survey" });
    }

    return links;
  };

  // Determine role badge styling
  const getRoleBadgeStyle = (role) => {
    let color = C.accent;
    let bg = C.accentDim;
    if (role === "ADMIN") { color = "#fbbf24"; bg = "rgba(251,191,36,0.12)"; }
    else if (role === "VOLUNTEER") { color = C.green; bg = C.greenDim; }
    else if (role === "CITIZEN") { color = "#e2e8f0"; bg = "rgba(255,255,255,0.08)"; }
    else if (role === "CENTRAL_HUB") { color = "#60a5fa"; bg = "rgba(96,165,250,0.12)"; }
    else if (role === "LOCAL_HUB") { color = "#c084fc"; bg = "rgba(192,132,252,0.12)"; }

    return {
      padding: "3px 10px",
      borderRadius: 12,
      border: `1px solid ${color}`,
      color: color,
      background: bg,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.03em"
    };
  };

  const navLinks = getNavLinks();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* ══ STICKY NAVIGATION HEADER ════════════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: "rgba(14,17,23,0.96)",
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(12px)",
        padding: "0 28px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, gap: 20 }}>
          {/* Brand/Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.accent, letterSpacing: "0.02em" }}>
                SAARTHI
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>
                Identity Control
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", gap: 6, flex: 1, justifyContent: "center", overflowX: "auto", scrollbarWidth: "none" }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    color: isActive ? C.accent : C.textMuted,
                    textDecoration: "none",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    background: isActive ? C.accentDim : "transparent",
                    border: `1px solid ${isActive ? C.border : "transparent"}`,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = C.text;
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = C.textMuted;
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Account Controls */}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Profile Details */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>
                  {user.name}
                </span>
                <span style={getRoleBadgeStyle(user.role)}>
                  {user.role}
                </span>
              </div>

              {/* Force Refresh Trigger */}
              <button
                onClick={refreshAccessToken}
                title="Force Simulated Access Token Refresh"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.bgInput,
                  color: C.accent,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.background = C.accentDim;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.bgInput;
                }}
              >
                🔄 Refresh
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${C.red}`,
                  background: "rgba(248, 113, 113, 0.05)",
                  color: C.red,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.red;
                  e.currentTarget.style.color = C.bg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(248, 113, 113, 0.05)";
                  e.currentTarget.style.color = C.red;
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══ DYNAMIC TOAST NOTIFICATIONS ════════════════ */}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 320,
        width: "100%"
      }}>
        {authNotifications.map((toast) => {
          let borderCol = C.border;
          let textCol = C.text;
          let icon = "ℹ️";

          if (toast.type === "success") { borderCol = C.green; textCol = C.green; icon = "✅"; }
          else if (toast.type === "error") { borderCol = C.red; textCol = C.red; icon = "⚠️"; }
          else if (toast.type === "warning") { borderCol = C.accent; textCol = C.accent; icon = "⏳"; }

          return (
            <div
              key={toast.id}
              style={{
                padding: "14px 16px",
                background: C.bgCard,
                borderLeft: `4px solid ${borderCol}`,
                borderTop: "1px solid rgba(255,255,255,0.03)",
                borderRight: "1px solid rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                borderRadius: "0 8px 8px 0",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                animation: "slideIn 0.3s ease-out forwards"
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              <div style={{ fontSize: 12, color: textCol, fontWeight: 600, lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ VIEWPORT CONTENT AREA ═══════════════════════ */}
      <main style={{ maxWidth: 1000, width: "100%", margin: "0 auto", padding: "32px 24px 80px", flex: 1, boxSizing: "border-box" }}>
        <Outlet />
      </main>
    </div>
  );
}
