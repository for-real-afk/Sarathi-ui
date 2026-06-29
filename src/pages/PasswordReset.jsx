import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C, inputStyle, labelStyle } from "../theme";

export default function PasswordReset() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to trigger password reset.");
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
      <div style={{ maxWidth: 400, width: "100%" }}>
        {/* Portal Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🔑</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.accent, letterSpacing: "0.02em" }}>
            PASSWORD RESET
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 13, color: C.textMuted, letterSpacing: "0.05em" }}>
            Recover Access to your Saarthi Profile
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative"
        }}>
          {/* Top amber accent border */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${C.accent}, #f59e0b)`,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }} />

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📨</div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 18, color: C.green, fontWeight: 700 }}>
                Reset Email Dispatched!
              </h3>
              <p style={{ margin: "0 0 24px 0", fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                We have transmitted an access recovery link to <strong>{email}</strong>. Please check your inbox and spam folders to finish updating your password.
              </p>
              <Link
                to="/login"
                style={{
                  display: "block",
                  padding: "12px",
                  borderRadius: 8,
                  background: C.bgInput,
                  border: `1px solid ${C.border}`,
                  color: C.accent,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 700, color: C.white }}>
                Request Reset Link
              </h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                Enter the email address registered under your Saarthi account. We will transmit a token to reset your password.
              </p>

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
                    placeholder="e.g. volunteer@sarathi.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
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
                  {loading ? "Transmitting..." : "Send Recovery Link"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Link to="/login" style={{ fontSize: 12, color: C.textMuted, textDecoration: "none", fontWeight: 600 }}>
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
