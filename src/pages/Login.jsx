import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C, inputStyle, labelStyle } from "../theme";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to correct page based on role
  if (user) {
    setTimeout(() => {
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "VOLUNTEER") navigate("/volunteers");
      else if (user.role === "CITIZEN") navigate("/citizens");
      else if (user.role === "CENTRAL_HUB" || user.role === "LOCAL_HUB") navigate("/cases");
      else navigate("/login");
    }, 50);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Handled by the redirect effect or check roles
      const mockDB = JSON.parse(localStorage.getItem("sarathi_users_db") || "[]");
      const matched = mockDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        if (matched.role === "ADMIN") navigate("/admin");
        else if (matched.role === "VOLUNTEER") navigate("/volunteers");
        else if (matched.role === "CITIZEN") navigate("/citizens");
        else navigate("/cases");
      }
    } else {
      setError(result.error || "Login failed. Check credentials.");
    }
  };

  const handleQuickFill = async (roleEmail) => {
    setEmail(roleEmail);
    setPassword("Password123");
    setError("");
    setLoading(true);
    const result = await login(roleEmail, "Password123");
    setLoading(false);
    if (result.success) {
      const mockDB = JSON.parse(localStorage.getItem("sarathi_users_db") || "[]");
      const matched = mockDB.find(u => u.email.toLowerCase() === roleEmail.toLowerCase());
      if (matched) {
        if (matched.role === "ADMIN") navigate("/admin");
        else if (matched.role === "VOLUNTEER") navigate("/volunteers");
        else if (matched.role === "CITIZEN") navigate("/citizens");
        else navigate("/cases");
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(circle at 50% 50%, #151c2c 0%, ${C.bg} 100%)`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: "24px",
      boxSizing: "border-box"
    }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        {/* Portal Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.accent, letterSpacing: "0.02em" }}>
            SAARTHI PORTAL
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 13, color: C.textMuted, letterSpacing: "0.05em" }}>
            Identity & Access Management Console
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle amber gradient line on top */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${C.accent}, #f59e0b)`
          }} />

          <h2 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 700, color: C.white }}>
            Sign In
          </h2>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(248, 113, 113, 0.1)",
              border: `1px solid ${C.red}`,
              borderRadius: 8,
              color: C.red,
              fontSize: 13,
              marginBottom: 20
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <Link to="/password-reset" style={{ fontSize: 11, color: C.accent, textDecoration: "none", fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: C.textMuted,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: "12px",
                borderRadius: 8,
                border: "none",
                background: `linear-gradient(135deg, ${C.accent}, #f59e0b)`,
                color: C.bg,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(251,191,36,0.25)",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Signing In..." : "Access Console →"}
            </button>
          </form>
        </div>

        {/* Quick Credentials Panel */}
        <div style={{
          marginTop: 24,
          background: "rgba(20, 26, 36, 0.4)",
          border: `1px solid rgba(251,191,36,0.08)`,
          borderRadius: 12,
          padding: 16,
          textAlign: "left"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, color: C.textLabel, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🔑 Mock Credentials Switcher
          </h4>
          <p style={{ margin: "0 0 12px 0", fontSize: 11, color: C.textMuted }}>
            Click any button below to instantly populate and authenticate with that specific user role:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { role: "ADMIN", email: "admin@sarathi.gov.in", label: "Admin Account" },
              { role: "CENTRAL_HUB", email: "centralhub@sarathi.gov.in", label: "Central Hub" },
              { role: "LOCAL_HUB", email: "localhub@sarathi.gov.in", label: "Local Hub" },
              { role: "VOLUNTEER", email: "volunteer@sarathi.gov.in", label: "Volunteer" },
              { role: "CITIZEN", email: "citizen@sarathi.gov.in", label: "Citizen Profile" }
            ].map((creds) => (
              <button
                key={creds.role}
                onClick={() => handleQuickFill(creds.email)}
                disabled={loading}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: C.bgInput,
                  color: C.text,
                  cursor: "pointer",
                  fontSize: 11,
                  textAlign: "left",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
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
                <strong style={{ color: C.accent, fontSize: 10 }}>{creds.role}</strong>
                <span style={{ fontSize: 10, color: C.textMuted }}>{creds.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
