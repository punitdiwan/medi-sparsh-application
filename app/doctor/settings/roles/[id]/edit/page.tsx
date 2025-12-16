"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import { RoleForm } from "../../RoleForm"
import { useAuth } from "@/context/AuthContext"
import { authClient } from "@/lib/auth-client"

type Permission = {
  action: "create" | "read" | "update" | "delete"
  subject: string
}

type RoleFromAPI = {
  id: string
  role: string
  permission: Record<string, string[]>
  organizationId: string
  createdAt: string
  updatedAt: string | null
}

type RoleFormData = {
  roleId?: string
  name: string
  permissions: Permission[]
}

export default function EditRolePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [role, setRole] = useState<RoleFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && user?.hospital?.hospitalId) fetchRole()
  }, [id, user])

  async function fetchRole() {
    setLoading(true)

    const { data } = await authClient.organization.getRole({
      query: {
        roleId: id as string,
        organizationId: user?.hospital?.hospitalId!,
      },
    })

    if (data) {
      setRole(mapRoleFromAPI(data))
    }

    setLoading(false)
  }

  async function updateRole(payload: RoleFormData) {
    const permissionObject = buildPermissionObject(payload.permissions)

    await authClient.organization.updateRole({
      role: payload.name,
      permission: permissionObject,
      organizationId: user?.hospital?.hospitalId!,
    })

    router.push("/admin/roles")
  }

  if (loading || !role) return <p>Loading...</p>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit Role</h1>
      <RoleForm role={role} onSubmit={updateRole} />
    </div>
  )
}

function mapRoleFromAPI(role: RoleFromAPI): RoleFormData {
  return {
    roleId: role.id,
    name: role.role,
    permissions: mapPermissionsFromDB(role.permission),
  }
}

function mapPermissionsFromDB(permission?: Record<string, string[]>): Permission[] {
  if (!permission) return []

  const result: Permission[] = []

  Object.entries(permission).forEach(([module, actions]) => {
    actions.forEach(action => {
      result.push({
        subject: module.toLowerCase(),
        action: action === "show" ? "read" : (action as Permission["action"]),
      })
    })
  })

  return result
}

// Convert editor permissions → API format for save
function buildPermissionObject(permissions: Permission[]): Record<string, string[]> {
  const result: Record<string, Set<string>> = {}

  permissions.forEach(({ subject, action }) => {
    const module = subject.toLowerCase()
    if (!result[module]) result[module] = new Set()
    result[module].add(action)
  })

  return Object.fromEntries(
    Object.entries(result).map(([k, v]) => [k, Array.from(v)])
  )
}
