"use client"

import { AbilityContext } from "@/lib/casl/AbilityContext"
import { defineAbilityFor } from "@/lib/casl/ability"

export function AbilityProvider({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  const ability = defineAbilityFor(role)

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
