'use client'
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

type RoleData = {
  id: string
  role: string
  permission: Record<string, string[]>
}

function hasPermission(
  permissions: Record<string, string[]>,
  module: string,
  action: string
) {
  return permissions[module]?.includes(action)
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user?.hospital?.hospitalId) {
      fetchRoles()
    }
  }, [user])

  const fetchRoles = async () => {
    setLoading(true)

    const { data, error } =
      await authClient.organization.listRoles({
        query: {
          organizationId: user?.hospital?.hospitalId,
        },
      })

    if (error) {
      console.error("Failed to fetch roles", error)
    } else {
      setRoles(data ?? [])
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
     <Card>
        <CardHeader>
            <h1 className="text-2xl font-semibold">
                Roles & Permissions
            </h1>
        </CardHeader>
        <CardContent>
        <div className="flex justify-end mb-4">
            <div>

            </div>
            <Button
                onClick={() => {
                    router.push("/doctor/settings/roles/create")
                }}
                >
                Add Role
            </Button>
        </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading roles...
        </p>
      )}

      {/* Empty */}
      {!loading && roles.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No roles found.
        </p>
      )}

      <div className="space-y-6">
  {roles.map((role) => (
    <Card key={role.id}>
      {/* ===== HEADER ROW ===== */}
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <h2 className="text-lg font-semibold capitalize">
          {role.role}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(
              `/doctor/settings/roles/${role.id}/edit`
            )
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* ===== PERMISSION TABLE ===== */}
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="border px-3 py-2 text-left">
                  Module
                </th>
                {["create", "read", "update", "delete"].map(
                  (action) => (
                    <th
                      key={action}
                      className="border px-3 py-2 capitalize text-center"
                    >
                      {action}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {Object.entries(role.permission).map(
                ([module, actions]) => (
                  <tr key={module}>
                    <td className="border px-3 py-2 font-medium capitalize">
                      {module}
                    </td>

                    {["create", "read", "update", "delete"].map(
                      (action) => (
                        <td
                          key={action}
                          className="border px-3 py-2 text-center"
                        >
                          {hasPermission(
                            role.permission,
                            module,
                            action
                          ) ? (
                            <span className="text-green-600 font-semibold">
                              ✔
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

      </CardContent>
      </Card>
    </div>
  )
}