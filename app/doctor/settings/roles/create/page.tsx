"use client"

import { useRouter } from "next/navigation"
import { RoleForm } from "../RoleForm"
import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import BackButton from "@/Components/BackButton"

type Permission = {
  action: "create" | "read" | "update" | "delete"
  subject: string
}

export default function CreateRolePage() {
  const router = useRouter()
  const { user } = useAuth()

  async function createRole(payload: {
    name: string
    permissions: Permission[]
  }) {
    console.log("payload", payload)

    const permissionObject = buildPermissionObject(
      payload.permissions
    )
    console.log("permissionObject",permissionObject)

    // await authClient.organization.createRole({
    //   role: payload.name,
    //   permission: permissionObject,
    //   organizationId: user?.hospital?.hospitalId!,
    // })

    // router.back();
  }

  return (
    <div className="space-y-6 p-6 mt-4">
        <BackButton/>
        <Card>
            <CardHeader>
                <h1 className="text-2xl font-semibold">
                    Create Role
                </h1>
            </CardHeader>
            <CardContent>
                <RoleForm onSubmit={createRole} />
            </CardContent>
        </Card>
    </div>
  )
}

function buildPermissionObject(
  permissions: Permission[]
): Record<string, string[]> {
  const result: Record<string, Set<string>> = {}

  permissions.forEach(({ action, subject }) => {
    const module = subject.toLowerCase()

    if (!result[module]) {
      result[module] = new Set()
    }

    // direct save frontend action as-is
    result[module].add(action)
  })

  // convert Set → Array
  return Object.fromEntries(
    Object.entries(result).map(([k, v]) => [k, Array.from(v)])
  )
}

