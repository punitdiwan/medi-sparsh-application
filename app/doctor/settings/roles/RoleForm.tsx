"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RolePermissionEditor } from "@/Components/role/RolePermissionEditor"
import { Label } from "@/components/ui/label"
import { Permission } from "@/Components/role/RolePermissionEditor"

type RoleData = {
  id?: string
  role?: string
  permission?: Record<string, string[]>
}

type Props = {
  role?: RoleData
  onSubmit: (payload: {
    roleId?: string
    name: string
    permissions: Permission[]
  }) => Promise<void>
}

export function RoleForm({ role, onSubmit }: Props) {
  const isEdit = Boolean(role?.id)

  const [roleName, setRoleName] = useState("")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  // Prefill for edit
  useEffect(() => {
    if (role) {
      setRoleName(role.role ?? "")
      setPermissions(normalizeToEditor(role.permission))
    }
  }, [role])

  async function handleSubmit() {
    setLoading(true)

    await onSubmit({
      roleId: role?.id,
      name: roleName,
      permissions,
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6 ">

    <div className="space-y-2 max-w-sm ">
        <Label htmlFor="roleName">
            Role Name
        </Label>

        <Input
            id="roleName"
            placeholder="Role name (doctor, nurse...)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={isEdit}
        />
    </div>
      <RolePermissionEditor
        value={permissions}
        onChange={setPermissions}
      />

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

/* ---------- helpers ---------- */

function normalizeToEditor(
  permission?: Record<string, string[]>
): Permission[] {
  if (!permission) return []

  const result: Permission[] = []

  Object.entries(permission).forEach(
    ([module, actions]) => {
      actions.forEach((action) => {
        result.push({
          action: action === "show" ? "read" : (action as any),
          subject: module,
        })
      })
    }
  )

  return result
}

