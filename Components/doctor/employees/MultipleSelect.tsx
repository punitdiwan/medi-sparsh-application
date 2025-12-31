"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select options",
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const toggleValue = (value: string) => {
    const currentSelected = selected || [];
    if (currentSelected.includes(value)) {
      onChange(currentSelected.filter((v) => v !== value));
    } else {
      onChange([...currentSelected, value]);
    }
  };

  const removeValue = (value: string) => {
    const currentSelected = selected || [];
    onChange(currentSelected.filter((v) => v !== value));
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Dropdown Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-dialog-input border-dialog-input text-dialog"
          >
            {(selected || []).length > 0 ? `${(selected || []).length} selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* Dropdown List */}
        <PopoverContent
          className="w-[300px] p-2 z-[9999] bg-dialog-surface border-dialog shadow-xl"
          align="start"
          side="bottom"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-dialog-input border-dialog-input text-dialog"
              autoFocus
            />
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 && (
                <div className="p-2 text-sm text-dialog-muted text-center">No result found.</div>
              )}
              {filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md text-sm transition-colors",
                    (selected || []).includes(opt.value)
                      ? "bg-dialog-primary/20 text-dialog"
                      : "hover:bg-dialog-input text-dialog"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-dialog-primary",
                    (selected || []).includes(opt.value) ? "bg-dialog-primary text-white" : "bg-transparent"
                  )}>
                    {(selected || []).includes(opt.value) && <Check className="h-3 w-3" />}
                  </div>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Items Display */}
      {(selected || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {(selected || []).map((value) => {
            const item = options.find((opt) => opt.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className="flex items-center gap-1 bg-dialog-primary/10 text-dialog border-dialog-primary/20"
              >
                {item?.label || value}
                <X
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(value);
                  }}
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
