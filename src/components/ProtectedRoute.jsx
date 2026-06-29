import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'IBM Plex Sans', sans-serif"
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 16,
          animation: "spin 2s linear infinite"
        }}>
          ⏳
        </div>
        <div style={{ fontSize: 16, color: C.accent, fontWeight: 700 }}>
          Authenticating Session...
        </div>
      </div>
    );
  }

  if (!user) {
    // Save attempted URL or redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}
