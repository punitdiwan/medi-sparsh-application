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

type RoleData = {
  id?: string
  role?: string
  permission?: Record<string, string[]>
}

export default function EditRolePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [role, setRole] = useState<RoleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchRole()
  }, [id])

  async function fetchRole() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/settings/roles/${id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch role")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setRole(mapRoleFromAPI(result.data))
      } else {
        setError("Role not found")
      }
    } catch (err) {
      console.error("Error fetching role:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch role")
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(payload: {
    roleId?: string
    name: string
    permissions: Permission[]
  }) {
    const permissionObject = buildPermissionObject(payload.permissions)

    try {
      const response = await fetch(`/api/settings/roles/${payload.roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: payload.name,
          permission: permissionObject,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      const result = await response.json()
      
      if (result.success) {
        router.push("/doctor/settings/roles")
      } else {
        console.error("Error updating role:", result.error)
      }
    } catch (err) {
      console.error("Error updating role:", err)
    }
  }

  if (loading) return <p>Loading...</p>
  
  if (error) return <p className="text-red-500">Error: {error}</p>
  
  if (!role) return <p>Role not found</p>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit Role</h1>
      <RoleForm role={role} onSubmit={updateRole} />
    </div>
  )
}

function mapRoleFromAPI(role: RoleFromAPI): RoleData {
  // Ensure permission keys are lowercase for proper matching in RolePermissionEditor
  const normalizedPermission: Record<string, string[]> = {}
  Object.entries(role.permission || {}).forEach(([key, value]) => {
    normalizedPermission[key.toLowerCase()] = value
  })
  
  return {
    id: role.id,
    role: role.role,
    permission: normalizedPermission,
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
