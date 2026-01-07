"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterField = {
  key: string;
  label: string;
  type: "text" | "date" | "select" | "switch";
  placeholder?: string;
  options?: FilterOption[];
};

interface FilterBarProps {
  fields: FilterField[];
  onFilter: (filters: Record<string, string>) => void;
}

export default function FilterBar({ fields, onFilter }: FilterBarProps) {
  const initialState = fields.reduce(
    (acc, field) => ({ ...acc, [field.key]: "" }),
    {}
  );
  const [filters, setFilters] = useState<Record<string, string>>(initialState);

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilter(updated); // send up to parent
  };

  const resetFilters = () => {
    setFilters(initialState);
    onFilter(initialState);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 rounded-xl shadow-lg border border-dialog bg-dialog-surface">
      {fields.map((field) => {
        switch (field.type) {
          case "text":
            return (
              <Input
                key={field.key}
                placeholder={field.placeholder || field.label}
                className="w-52"
                value={filters[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            );

          case "date":
            return (
              <Input
                key={field.key}
                type="date"
                className="w-44"
                value={filters[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            );

            case "switch":
            return (
              <div key={field.key} className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border border-dialog">
                  <Switch
                    id="show-deleted"
                    checked={filters[field.key] === "true"}
                    onCheckedChange={(checked) =>
                      {handleChange(field.key, checked ? "true" : "false")}
                    }
                    className="toggle toggle-sm"
                  />
                  <Label htmlFor="show-deleted" className="text-sm font-medium text-dialog cursor-pointer">
                    Show Deleted
                  </Label>
              </div>
            );
          // case "select":
          //   return (
          //     <Select
          //       key={field.key}
          //       value={filters[field.key]}
          //       onValueChange={(v) => handleChange(field.key, v)}
          //     >
          //       <SelectTrigger className="w-44">
          //         <SelectValue placeholder={field.label} />
          //       </SelectTrigger>
          //       <SelectContent>
          //         {field.options?.map((opt) => (
          //           <SelectItem key={opt.value} value={opt.value}>
          //             {opt.label}
          //           </SelectItem>
          //         ))}
          //       </SelectContent>
          //     </Select>
          //   );

          default:
            return null;
        }
      })}

      <Button variant="outline" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}
