"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        caption: "flex justify-center py-2 font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: "p-1 rounded hover:bg-accent",
        button_next: "p-1 rounded hover:bg-accent",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground font-normal w-10 text-center",
        row: "flex w-full",
        cell:
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: "h-10 w-10 p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
