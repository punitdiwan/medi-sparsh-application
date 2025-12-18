"use client";

import { createContext, useContext, useMemo } from "react";
import type { MongoAbility } from "@casl/ability";
import { defineAbilityFromJSON } from "@/lib/casl/defineAbilityFromDB";

type PermissionJSON = Record<string, string[]>;

export const AbilityContext = createContext<MongoAbility | null>(null);

export function AbilityProvider({
  permissions,
  children,
}: {
  permissions: PermissionJSON;
  children: React.ReactNode;
}) {

  const ability = useMemo(
    () => defineAbilityFromJSON(permissions),
    [permissions]
  );

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used inside AbilityProvider");
  }
  return ability;
}
