"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"

const MODULES = [
  { key: "patient", label: "Patients" },
  { key: "appointment", label: "Appointments" },
  { key: "members", label: "Members" },            
  { key: "prescription", label: "Prescriptions" },
  { key: "services", label: "Services" },         
  { key: "payment", label: "Payments" },
  { key: "appSettings", label: "App Settings" },
  { key: "billing", label: "Pharmacy Billing"},
  { key: "pharmacyMedicine", label: "Pharmacy Medicines"},
  { key: "stock", label: "Pharmacy stock"},
  { key: "reports", label: "Reports" },
  { key: "hospitalCharger", label: "Hospital Charges" },
  { key: "vitals", label: "Vitals" },
  { key: "bed", label: "Bed Management" },
  { key: "bedStatus", label: "Bed Status" },
  { key: "shifts", label: "Shift Management" },
  { key: "role", label: "Roles" },                         
  { key: "medicineRedord", label: "Medicine Record" }, 
] as const


const ACTIONS = ["create", "read", "update", "delete"] as const
type Action = (typeof ACTIONS)[number]

export type Permission = {
  action: Action
  subject: string
}

type Props = {
  value: Permission[]
  onChange: (permissions: Permission[]) => void
}

export function RolePermissionEditor({
  value,
  onChange,
}: Props) {
  function hasPermission(
    action: Action,
    subject: string
  ) {
    return value.some(
      (p) =>
        p.action === action &&
        p.subject === subject
    )
  }

  function togglePermission(
    action: Action,
    subject: string
  ) {
    if (hasPermission(action, subject)) {
      onChange(
        value.filter(
          (p) =>
            !(
              p.action === action &&
              p.subject === subject
            )
        )
      )
    } else {
      onChange([
        ...value,
        { action, subject },
      ])
    }
  }

  return (
    <Card className="p-4 overflow-x-auto">
      <Table>
        {/* ---------- HEADER ---------- */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-64">
              Module
            </TableHead>
            {ACTIONS.map((action) => (
              <TableHead
                key={action}
                className="text-center capitalize"
              >
                {action}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* ---------- BODY ---------- */}
        <TableBody>
          {MODULES.map((module) => (
            <TableRow key={module.key}>
              {/* Module Name */}
              <TableCell className="font-medium">
                {module.label}
              </TableCell>

              {/* Permissions */}
              {ACTIONS.map((action) => (
                <TableCell
                  key={action}
                  className="text-center"
                >
                  <Checkbox
                    checked={hasPermission(
                      action,
                      module.key
                    )}
                    onCheckedChange={() =>
                      togglePermission(
                        action,
                        module.key
                      )
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
