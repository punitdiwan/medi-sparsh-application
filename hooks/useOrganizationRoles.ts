import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/context/AuthContext"

export type SimpleRole = {
  id: string
  role: string
}

export function useOrganizationRoles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<SimpleRole[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.hospital?.hospitalId) return

    const fetchRoles = async () => {
      setLoading(true)

      const { data, error } =
        await authClient.organization.listRoles({
          query: {
            organizationId: user.hospital.hospitalId,
          },
        })

      if (!error && data) {
        setRoles(
          data.map((r) => ({
            id: r.id,
            role: r.role,
          }))
        )
      }

      setLoading(false)
    }

    fetchRoles()
  }, [user?.hospital?.hospitalId])

  return { roles, loading }
}