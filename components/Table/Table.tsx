"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useSidebar } from "@/components/ui/sidebar";
import clsx from "clsx";

type TableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  fallback?: React.ReactNode;

  /** Optional text color controls */
  headerTextClassName?: string;
  bodyTextClassName?: string;
};

export function Table<TData>({
  data,
  columns,
  fallback,
  headerTextClassName,
  bodyTextClassName,
}: TableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      className={clsx(
        "transition-all duration-200 rounded-md bg-overview-card border-overview-strong shadow-sm overflow-x-auto scrollbar-show",
        isCollapsed
          ? "w-[calc(100vw-100px)]"
          : "w-[calc(100vw-60px)] md:w-[calc(100vw-310px)]"
      )}
    >
      <table className="min-w-max w-full text-sm bg-overview-card border-overview-strong border-collapse relative">
        {/* ================= HEADER ================= */}
        <thead
          className={clsx(
            "bg-overview-card text-xs uppercase tracking-wider font-medium",
            headerTextClassName ?? "text-muted-foreground"
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const isLast = index === headerGroup.headers.length - 1;

                return (
                  <th
                    key={header.id}
                    className={clsx(
                      "border-b bg-overview-card px-6 py-3 text-left whitespace-nowrap",
                      isLast && "sticky right-0 bg-muted z-[1] shadow-md"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* ================= BODY ================= */}
        <tbody
          className={clsx(
            bodyTextClassName ?? "text-foreground"
          )}
        >
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={clsx(
                  index % 2 === 0 ? "bg-background" : "bg-muted/50",
                  "hover:bg-muted transition-colors"
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isLast =
                    cellIndex === row.getVisibleCells().length - 1;

                  return (
                    <td
                      key={cell.id}
                      className={clsx(
                        "border-b px-6 py-3 capitalize whitespace-nowrap",
                        isLast && "sticky right-0 bg-background z-[1] shadow-md"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : fallback ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-muted-foreground"
              >
                {fallback}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export type { ColumnDef };
