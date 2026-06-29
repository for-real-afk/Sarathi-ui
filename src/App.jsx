import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import CasesDashboard from "./pages/CasesDashboard";
import SurveyWizard from "./pages/SurveyWizard";

// Re-export validateSection to ensure backwards compatibility with existing App tests
export { validateSection } from "./pages/SurveyWizard";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0e1117",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ fontSize: 24, animation: "spin 2s linear infinite" }}>⏳</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "VOLUNTEER") return <Navigate to="/volunteers" replace />;
  if (user.role === "CITIZEN") return <Navigate to="/citizens" replace />;
  if (user.role === "CENTRAL_HUB" || user.role === "LOCAL_HUB") return <Navigate to="/cases" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes nested inside Layout shell */}
          <Route element={<Layout />}>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/volunteers" element={<ProtectedRoute allowedRoles={["VOLUNTEER", "CENTRAL_HUB", "ADMIN"]}><VolunteerDashboard /></ProtectedRoute>} />
            <Route path="/citizens" element={<ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]}><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute allowedRoles={["CENTRAL_HUB", "LOCAL_HUB", "ADMIN"]}><CasesDashboard /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute allowedRoles={["VOLUNTEER", "CITIZEN", "ADMIN"]}><SurveyWizard /></ProtectedRoute>} />
          </Route>

          {/* Root and fallback redirects */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
