import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Standard mock users
const MOCK_USERS = [
  { id: "u-1", email: "admin@sarathi.gov.in", password: "Password123", role: "ADMIN", name: "Ramesh Kumar (Admin)" },
  { id: "u-2", email: "centralhub@sarathi.gov.in", password: "Password123", role: "CENTRAL_HUB", name: "Vijayawada Central Hub" },
  { id: "u-3", email: "localhub@sarathi.gov.in", password: "Password123", role: "LOCAL_HUB", name: "Anantapur Local Hub" },
  { id: "u-4", email: "volunteer@sarathi.gov.in", password: "Password123", role: "VOLUNTEER", name: "Srinivas Raju (Volunteer)" },
  { id: "u-5", email: "citizen@sarathi.gov.in", password: "Password123", role: "CITIZEN", name: "Nirmala Yerragondu (Citizen)" },
];

// Initialize mock users database in localStorage if not exists
if (!localStorage.getItem("sarathi_users_db")) {
  localStorage.setItem("sarathi_users_db", JSON.stringify(MOCK_USERS));
}

// Helper to get users database
export const getUsersDB = () => JSON.parse(localStorage.getItem("sarathi_users_db") || "[]");
export const saveUsersDB = (users) => localStorage.setItem("sarathi_users_db", JSON.stringify(users));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authNotifications, setAuthNotifications] = useState([]);

  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setAuthNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAuthNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  // Simulates JWT creation with expiration time
  const createMockToken = (userObj, durationSeconds = 90) => {
    const expiresAt = Date.now() + durationSeconds * 1000;
    return {
      token: `mock-jwt-header.${btoa(JSON.stringify({ ...userObj, exp: expiresAt }))}.mock-signature`,
      expiresAt,
    };
  };

  // Verifies and decodes mock JWT token
  const decodeMockToken = (tokenStr) => {
    try {
      const parts = tokenStr.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (e) {
      return null;
    }
  };

  // Perform token refresh
  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem("sarathi_refresh_token");
    if (!currentRefreshToken) {
      logout();
      return null;
    }

    addNotification("Attempting to refresh access token...", "info");

    try {
      // Backend integration attempt
      const res = await fetch("http://localhost:4000/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("sarathi_access_token", data.accessToken);
        localStorage.setItem("sarathi_refresh_token", data.refreshToken);
        const decoded = decodeMockToken(data.accessToken) || data.user;
        setUser(decoded);
        addNotification("Access token refreshed via backend API!", "success");
        return decoded;
      }
    } catch (err) {
      // API down or missing, fallback to mock refresh
    }

    // Mock Token Refresh logic
    const tokenPayload = decodeMockToken(currentRefreshToken);
    if (!tokenPayload || Date.now() > tokenPayload.exp) {
      addNotification("Refresh token expired. Please login again.", "error");
      logout();
      return null;
    }

    // Generate new short-lived access token (90 seconds for easy testing of auto-refresh)
    const newAccess = createMockToken({ id: tokenPayload.id, email: tokenPayload.email, role: tokenPayload.role, name: tokenPayload.name }, 90);
    // Generate new longer refresh token (5 mins mock expiry)
    const newRefresh = createMockToken({ id: tokenPayload.id, email: tokenPayload.email, role: tokenPayload.role, name: tokenPayload.name }, 300);

    localStorage.setItem("sarathi_access_token", newAccess.token);
    localStorage.setItem("sarathi_refresh_token", newRefresh.token);
    
    const freshUser = { ...tokenPayload, exp: newAccess.expiresAt };
    setUser(freshUser);
    addNotification("Access token refreshed successfully (simulated)!", "success");
    return freshUser;
  }, [addNotification]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("sarathi_access_token");
    localStorage.removeItem("sarathi_refresh_token");
    setUser(null);
    addNotification("Successfully logged out.", "info");
  }, [addNotification]);

  // Initial token verification
  useEffect(() => {
    async function initAuth() {
      const accessToken = localStorage.getItem("sarathi_access_token");
      if (accessToken) {
        const decoded = decodeMockToken(accessToken);
        if (decoded && Date.now() < decoded.exp) {
          setUser(decoded);
          addNotification(`Welcome back, ${decoded.name}!`, "success");
        } else {
          // Access token expired, try refresh
          await refreshAccessToken();
        }
      }
      setLoading(false);
    }
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background token checker & auto refresh
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const accessToken = localStorage.getItem("sarathi_access_token");
      if (accessToken) {
        const decoded = decodeMockToken(accessToken);
        if (decoded) {
          const timeLeft = decoded.exp - Date.now();
          // If less than 15 seconds remaining, auto-refresh
          if (timeLeft > 0 && timeLeft < 15000) {
            addNotification("Access token expiring soon. Auto-refreshing...", "warning");
            refreshAccessToken();
          } else if (timeLeft <= 0) {
            addNotification("Token expired. Auto-logging out...", "error");
            logout();
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, refreshAccessToken, logout, addNotification]);

  // Login function
  const login = async (email, password) => {
    try {
      // Backend integration attempt
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("sarathi_access_token", data.accessToken);
        localStorage.setItem("sarathi_refresh_token", data.refreshToken);
        const decoded = decodeMockToken(data.accessToken) || data.user;
        setUser(decoded);
        addNotification("Logged in via Backend API!", "success");
        return { success: true };
      }
    } catch (err) {
      // API down or missing, fallback to mock login
    }

    // Mock Login Logic
    const users = getUsersDB();
    const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (matchedUser) {
      // Short access token (90 seconds for demonstration)
      const access = createMockToken({ id: matchedUser.id, email: matchedUser.email, role: matchedUser.role, name: matchedUser.name }, 90);
      // Refresh token (300 seconds)
      const refresh = createMockToken({ id: matchedUser.id, email: matchedUser.email, role: matchedUser.role, name: matchedUser.name }, 300);

      localStorage.setItem("sarathi_access_token", access.token);
      localStorage.setItem("sarathi_refresh_token", refresh.token);

      const userObj = { id: matchedUser.id, email: matchedUser.email, role: matchedUser.role, name: matchedUser.name, exp: access.expiresAt };
      setUser(userObj);
      addNotification(`Logged in as ${matchedUser.name}`, "success");
      return { success: true };
    }

    addNotification("Invalid email or password.", "error");
    return { success: false, error: "Invalid email or password" };
  };

  // Password Reset simulation
  const resetPassword = async (email) => {
    try {
      // Backend integration attempt
      const res = await fetch("http://localhost:4000/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        addNotification("Password reset email sent (via backend)!", "success");
        return { success: true };
      }
    } catch (err) {
      // Fallback
    }

    // Simulated email send
    const users = getUsersDB();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      addNotification(`Reset link dispatched to ${email}`, "success");
      return { success: true };
    }

    addNotification("Email address not found.", "error");
    return { success: false, error: "Email address not found" };
  };

  // Role Checker helper
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        resetPassword,
        refreshAccessToken,
        hasRole,
        authNotifications,
        addNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
