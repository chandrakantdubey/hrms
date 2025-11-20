// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import api from "@/services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]); // <-- ADD ROLES STATE

  const [isLoading, setIsLoading] = useState(true);

  const processUserData = (userData) => {
    setUser(userData);
    setPermissions(userData.permissions || []);
    setRoles(userData.roles || []); // <-- POPULATE ROLES
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      const token = getCookie("token");
      if (token) {
        try {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          const response = await api.get("/user/profile");
          processUserData(response.data.data);
        } catch (error) {
          console.error("Failed to fetch user on load", error);
          removeCookie("token");
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    fetchUserOnLoad();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    const token = response.data.token;
    setCookie("token", token, 7);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    const userProfileResponse = await api.get("/user/profile");
    processUserData(userProfileResponse.data.data);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API call failed, logging out locally.", error);
    } finally {
      removeCookie("token");
      delete api.defaults.headers.Authorization;
      setUser(null);
      setPermissions([]);
      setRoles([]); // <-- CLEAR ROLES ON LOGOUT
      setIsAuthenticated(false);
    }
  };

  // --- ADD HELPER FUNCTION TO CHECK ROLES ---
  const hasRole = (roleOrRoles) => {
    if (!roles.length) return false;
    const rolesToCheck = Array.isArray(roleOrRoles)
      ? roleOrRoles
      : [roleOrRoles];
    return roles.some((userRole) => rolesToCheck.includes(userRole));
  };

  const value = {
    isAuthenticated,
    user,
    permissions,
    roles,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
