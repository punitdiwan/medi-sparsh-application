"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ALL_PERMISSIONS } from "@/lib/allPermissions";

type Resource = keyof typeof ALL_PERMISSIONS;
type Action = (typeof ALL_PERMISSIONS)[Resource][number];

export type Permission = {
  action: Action;
  subject: Resource;
};

type Props = {
  value: Permission[];
  onChange: (permissions: Permission[]) => void;
};

const ACTIONS = ["create", "read", "update", "delete"] as const;

export function RolePermissionEditor({ value, onChange }: Props) {
  const hasPermission = (action: Action, subject: Resource) =>
    value.some(
      (p) => p.action === action && p.subject === subject
    );

  const togglePermission = (
    action: Action,
    subject: Resource
  ) => {
    if (hasPermission(action, subject)) {
      onChange(
        value.filter(
          (p) =>
            !(p.action === action && p.subject === subject)
        )
      );
    } else {
      onChange([...value, { action, subject }]);
    }
  };

  function formatModuleName(key: string) {
    return key
      // camelCase → camel Case
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // first letter capital
      .replace(/^./, (char) => char.toUpperCase());
  }


  return (
    <Card className="p-4 overflow-x-auto table-custom-bg" >
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
          {(Object.keys(ALL_PERMISSIONS) as Resource[]).map(
            (module) => {
              const allowedActions =
                ALL_PERMISSIONS[module];

              return (
                <TableRow key={module}>
                  {/* Module name */}
                  <TableCell className="font-medium capitalize">
                    {formatModuleName(module)}
                  </TableCell>

                  {/* Permissions */}
                  {ACTIONS.map((action) => {
                    const isAllowed =
                      allowedActions.includes(action);

                    return (
                      <TableCell
                        key={action}
                        className="text-center"
                      >
                        <Checkbox
                          disabled={!isAllowed}
                          checked={
                            isAllowed &&
                            hasPermission(action, module)
                          }
                          onCheckedChange={() =>
                            isAllowed &&
                            togglePermission(action, module)
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
