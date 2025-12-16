'use client'
// import { RolePermissionEditor } from "@/Components/role/RolePermissionEditor";
import { authClient } from "@/lib/auth-client";
// export const dynamic = "force-dynamic";

// const page = () => {

//     return (
//         <>
//             {/* <div onClick={async () => {
//                 // const org = await authClient.organization.getFullOrganization({
//                 //     query: {
//                 //         organizationId: "XVeNOXOH6znV3vdz8R5SytTxcaKdcDgF",
//                 //     }
//                 // });
//                 // console.log("Organization details:", org);
//                 // const c = await authClient.organization.updateMemberRole({
//                 //     organizationId: org.data!.id,
//                 //     role: ["owner", "admin"],
//                 //     memberId: "zm3vxvR6XoQMZ6lYiWYjBhR1BH0G5bAT"
//                 // });

//                 // console.log("Update member role response:", c.data);

//                 // const hasPermission = await authClient.organization.hasPermission({
//                 //     permissions: {
//                 //         project: ["show"],
//                 //     }                  
//                 // });
//                 // console.log("Has permission:", hasPermission.data);

//                 // console.log("Roles page clicked");
//                 // const permission = {
//                 //     project: ["create", "update", "delete"]
//                 // }
//                 const permission = {
//                     project: ["create","show"],
//                      appointment: ["create","show", "hide"],
//                 }

//                 await authClient.organization.createRole({
//                     role: "test2", // required
//                     permission: permission,
//                     organizationId: "XVeNOXOH6znV3vdz8R5SytTxcaKdcDgF",
//                 });
//             }}>
//                 hello roles page
//             </div> */}
//             <RolePermissionEditor/>
//         </>
//     )
// }

// export default page



// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type RoleData = {
  id: string
  role: string
  permission: Record<string, string[]>
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

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="p-4 flex items-start justify-between gap-4"
          >
            {/* Left: Role + Permissions */}
            <div className="space-y-3">
              <h2 className="text-lg font-medium">
                {role.role}
              </h2>

              <div className="space-y-2">
                {Object.entries(role.permission).map(
                  ([module, actions]) => (
                    <div
                      key={module}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="text-sm font-semibold capitalize">
                        {module}
                      </span>

                      {actions.map((action) => (
                        <Badge
                          key={action}
                          variant="secondary"
                          className="capitalize"
                        >
                          {action === "show"
                            ? "read"
                            : action}
                        </Badge>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right: Edit Button */}
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/doctor/settings/roles/${role.id}/edit`
                )
              }
            >
              Edit
            </Button>
          </Card>
        ))}
      </div>
      </CardContent>
      </Card>
    </div>
  )
}