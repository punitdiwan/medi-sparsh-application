"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useSidebar } from "@/components/ui/sidebar";

type TableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
};

export function Table<TData>({ data, columns }: TableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <div
      className={`transition-all duration-200 rounded-md border bg-card shadow-sm overflow-x-auto ${
       isCollapsed  ? "w-[calc(100vw-100px)]" : "w-[calc(100vw-60px)] md:w-[calc(100vw-310px)]"
      } scrollbar-show`}
    >
      <table className="min-w-max w-full text-sm text-foreground border-collapse relative">
        <thead className="bg-muted text-xs uppercase tracking-wider font-medium text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const isLast = index === headerGroup.headers.length - 1;

                return (
                  <th
                    key={header.id}
                    className={`border-b px-6 py-3 text-left whitespace-nowrap ${
                      isLast ? "sticky right-0 bg-muted z-10 shadow-md" : ""
                    }`}
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

        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`${
                index % 2 === 0 ? "bg-background" : "bg-muted/50"
              } hover:bg-muted transition-colors`}
            >
              {row.getVisibleCells().map((cell, cellIndex) => {
                const isLast = cellIndex === row.getVisibleCells().length - 1;

                return (
                  <td
                    key={cell.id}
                    className={`border-b px-6 py-3 capitalize whitespace-nowrap ${
                      isLast
                        ? "sticky right-0 bg-background z-10 shadow-md"
                        : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { ColumnDef };
