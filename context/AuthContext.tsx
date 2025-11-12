"use client";
import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  user: Record<string, any> | null; // koi bhi JSON object
  setUser: (user: Record<string, any> | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: Record<string, any> | null;
}

export const AuthProvider = ({ children, initialUser = null }: AuthProviderProps) => {
  const [user, setUserState] = useState<Record<string, any> | null>(initialUser);

  const setUser = (userData: Record<string, any> | null) => {
    setUserState(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
