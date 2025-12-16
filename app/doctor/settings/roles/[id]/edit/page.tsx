"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { RoleForm, } from "../../RoleForm"
import { useAuth } from "@/context/AuthContext"
import { authClient } from "@/lib/auth-client"
type Permission = {
  action: "create" | "read" | "update" | "delete"
  subject: string
}
export default function EditRolePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [role, setRole] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && user?.hospital?.hospitalId) fetchRole()
  }, [id, user])

  async function fetchRole() {
    setLoading(true)
    const { data } = await authClient.organization.getRole({
      query: { roleId: id as string, organizationId: user?.hospital?.hospitalId },
    })
    setRole(data)
    setLoading(false)
  }

  async function updateRole(payload: { name: string; permissions: Permission[] }) {
    const permissionObject: Record<string, string[]> = buildPermissionObject(payload.permissions)

    await authClient.organization.updateRole({
      role: payload.name,
      permission: permissionObject,
      organizationId: user?.hospital?.hospitalId!,
    })

    router.back()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit Role</h1>

      <RoleForm role={role} onSubmit={updateRole} />
    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function buildPermissionObject(permissions: Permission[]): Record<string, string[]> {
  const result: Record<string, Set<string>> = {}

  permissions.forEach(({ subject, action }) => {
    const module = subject.toLowerCase()
    if (!result[module]) result[module] = new Set()
    // Save as 'read' for Better Auth DB
    result[module].add(action)
  })

  return Object.fromEntries(Object.entries(result).map(([k, v]) => [k, Array.from(v)]))
}


