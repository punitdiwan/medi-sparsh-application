"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select options",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen((p) => !p)}
      >
        {value.length ? `${value.length} selected` : placeholder}
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList className="max-h-60 overflow-auto">
              <CommandEmpty>No item found.</CommandEmpty>

              <CommandGroup>
                {options
                  .filter((o) =>
                    o.label.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((opt) => {
                    const isSelected = value.includes(opt.value);

                    return (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          if (isSelected) {
                            onChange(value.filter((v) => v !== opt.value));
                          } else {
                            onChange([...value, opt.value]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                          />
                          <span>{opt.label}</span>
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {/* Selected chips */}
      {/* <div className="flex flex-wrap gap-2 mt-2">
        {value.map((v) => {
          const label = options.find((o) => o.value === v)?.label || v;
          return (
            <span
              key={v}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {label}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="text-red-500"
              >
                ✕
              </button>
            </span>
          );
        })}
      </div> */}
    </div>
  );
}
