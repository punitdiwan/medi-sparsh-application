"use client";

import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  AuserId: string | null;
  setUserId: (id: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  AuserId: null,
  setUserId: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [AuserId, setUserId] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ AuserId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
