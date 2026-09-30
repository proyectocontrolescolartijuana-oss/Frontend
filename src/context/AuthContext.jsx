import { useCallback, useContext, useEffect, useState } from "react";

import { AuthContext } from "./authStore";
import {
  SESSION_EXPIRED_EVENT,
  clearSessionExpiredMessage,
  clearStoredAuth,
  getStoredToken,
  getTokenExpiration,
  markSessionExpired,
} from "../services/session";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser || savedUser === "undefined") {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Error parsing user:", error);

      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const login = (jwt, userData) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    clearSessionExpiredMessage();
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    clearSessionExpiredMessage();
    clearAuthState();
  };

  const expireSession = useCallback(() => {
    markSessionExpired();
    clearAuthState();
  }, [clearAuthState]);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, clearAuthState);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, clearAuthState);
    };
  }, [clearAuthState]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const tokenExpiration = getTokenExpiration(token);

    if (!tokenExpiration) {
      return undefined;
    }

    const timeUntilExpiration = tokenExpiration - Date.now();
    const timeoutId = window.setTimeout(
      expireSession,
      Math.max(timeUntilExpiration, 0),
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [expireSession, token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
