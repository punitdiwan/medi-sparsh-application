import fs from "fs"
import path from "path"
import { AbilityBuilder, AbilityClass, Ability } from "@casl/ability"
import type { AppAbility } from "./ability"

type Permission = {
  action: string
  subject: string
}

export function defineAbilityFromJSON(role: string) {
  const filePath = path.join(process.cwd(), "lib/data/permissions.json")
  const json = JSON.parse(fs.readFileSync(filePath, "utf-8"))

  const permissions: Permission[] = json.roles[role] ?? []

  const { can, build } = new AbilityBuilder<AppAbility>(
    Ability as AbilityClass<AppAbility>
  )

  permissions.forEach((p) => {
    can(p.action as any, p.subject as any)
  })

  return build()
}
