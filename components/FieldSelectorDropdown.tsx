"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

interface FieldSelectorDropdownProps<TData> {
  columns: ColumnDef<TData>[];
  visibleFields: string[];
  onToggle: (key: string, checked: boolean) => void;
  label?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "ghost";
}

export function FieldSelectorDropdown<TData>({
  columns,
  visibleFields,
  onToggle,
  label = "Visible Columns",
  buttonLabel = "Select Fields",
  buttonVariant = "outline",
}: FieldSelectorDropdownProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant}
          className="bg-white/20 border border-white/20 text-gray-300"
        >{buttonLabel}</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {columns.map((col, i) => {
          // ✅ Safe way to get column key
          const key =
            "accessorKey" in col && typeof col.accessorKey === "string"
              ? col.accessorKey
              : `col-${i}`;

          // ✅ Safe way to handle header text
          let headerText: string;
          if (typeof col.header === "string") {
            headerText = col.header;
          } else if (typeof col.header === "function") {
            headerText = "Custom Header";
          } else if (
            col.header &&
            typeof col.header === "object" &&
            "props" in col.header
          ) {
            headerText = "Header Element";
          } else {
            headerText = "Unnamed";
          }

          return (
            <DropdownMenuCheckboxItem
              key={key}
              checked={visibleFields.includes(key)}
              onCheckedChange={(checked:any) => onToggle(key, Boolean(checked))}
            >
              {headerText}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
