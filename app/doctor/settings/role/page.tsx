'use client'
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { RxCross2 } from "react-icons/rx";
import { GiCheckMark } from "react-icons/gi";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export const dyanamic = "force-dynamic";
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
type SortOrder = "none" | "asc" | "desc";



export default function RolesPage() {
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const ability = useAbility();

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

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

  function formatModuleName(key: string) {
    return key
      // camelCase → camel Case
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // first letter capital
      .replace(/^./, (char) => char.toUpperCase());
  }

  return (
    <div className="m-6 space-y-6">
      <Card className="bg-custom-gradient">
        <CardHeader >
          <h1 className="text-2xl font-semibold">
            Roles & Permissions
          </h1>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <div>

            </div>
            <Can I="create" a="role" ability={ability}>
              <Button
                onClick={() => {
                  router.push("/doctor/settings/roles/create")
                }}
              >
                Add Role
              </Button>
            </Can>
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
            {roles.map((role) => {
              const permissionEntries = Object.entries(role.permission);

              const sortedPermissions =sortOrder === "none" ? permissionEntries : [...permissionEntries].sort(([a], [b]) =>
                    sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a));

              return (
                <Card key={role.id} className="bg-gradient-to-br dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
                  {/* ===== HEADER ROW ===== */}
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {role.role}'s Permissions
                    </h2>
                    <Can I="update" a="role" ability={ability}>
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/doctor/settings/roles/${role.id}/edit`
                          )
                        }
                      >
                        <Pencil size={24} />Edit
                      </Button>
                    </Can>
                  </CardHeader>

                  {/* ===== PERMISSION TABLE ===== */}
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm table-custom-bg">
                        <thead className="bg-gray-600 text-white dark:bg-gray-800">
                          <tr>
                            <th className="border px-3 py-2 text-left cursor-pointer select-none"
                              onClick={toggleSort}>
                              <div className="flex items-center gap-2">
                                Module
                                {sortOrder === "none" && <ArrowUpDown size={16} />}
                                {sortOrder === "asc" && <ArrowUp size={16} />}
                                {sortOrder === "desc" && <ArrowDown size={16} />}
                              </div>
                            </th>
                            {["create", "read", "update", "delete"].map(
                              (action) => (
                                <th
                                  key={action}
                                  className="border px-3 py-2 capitalize text-center "
                                >
                                  {action}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {sortedPermissions.map(([module, actions]) => (
                            <tr key={module}>
                              <td className="border px-3 py-2 font-medium capitalize ">
                                {formatModuleName(module)}
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
                                      <span className="text-green-600 font-semibold flex justify-center">
                                        <GiCheckMark />
                                      </span>
                                    ) : (
                                      <span className="text-red-500  flex justify-center">
                                        <RxCross2 size={18} />
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
              );})}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}