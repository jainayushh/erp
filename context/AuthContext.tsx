import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (v: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  setAuthenticated: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    try {
      const entries = await AsyncStorage.multiGet([
        "token",
        "isLoggedIn",
        "loginAt",
      ]);

      const token = entries.find(e => e[0] === "token")?.[1];
      const isLoggedIn = entries.find(e => e[0] === "isLoggedIn")?.[1];
      const loginAt = entries.find(e => e[0] === "loginAt")?.[1];

      if (!token || isLoggedIn !== "true" || !loginAt) {
        setIsAuthenticated(false);
        return;
      }

      // ⏱ SESSION VALIDITY (example: 24 hours)
      const SESSION_DURATION = 24 * 60 * 60 * 1000;
      const isExpired =
        Date.now() - Number(loginAt) > SESSION_DURATION;

      if (isExpired) {
        await AsyncStorage.multiRemove([
          "token",
          "isLoggedIn",
          "loginAt",
        ]);
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  initAuth();
}, []);


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        setAuthenticated: setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
