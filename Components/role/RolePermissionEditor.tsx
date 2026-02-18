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
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Resource = keyof typeof ALL_PERMISSIONS;
type Action = (typeof ALL_PERMISSIONS)[Resource][number];
type SortOrder = "none" | "asc" | "desc";



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
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
    );
  };

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

  const {user} = useAuth();
  const modules = Object.keys(user?.permissions || {}) as Resource[];

  const sortedModules =
    sortOrder === "none"
      ? modules
      : [...modules].sort((a, b) =>
          sortOrder === "asc"
            ? a.localeCompare(b)
            : b.localeCompare(a)
        );


  return (
    <Card className="p-4 overflow-x-auto table-custom-bg" >
      <Table>
        {/* ---------- HEADER ---------- */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-64 cursor-pointer select-none"
            onClick={toggleSort}>
              <div className="flex items-center gap-2">
                Module
                {sortOrder === "none" && <ArrowUpDown size={16} />}
                {sortOrder === "asc" && <ArrowUp size={16} />}
                {sortOrder === "desc" && <ArrowDown size={16} />}
              </div>
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
          {sortedModules.map(
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
