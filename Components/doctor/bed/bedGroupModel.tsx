"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// SHADCN COMBOBOX IMPORTS
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";

type BedGroupModalProps = {
  bedGroup?: { id?: string; name: string; floor: string; description: string };
  onSave: (bedGroup: { id?: string; name: string; floor: string; description: string }) => void;
};

export function BedGroupModal({ bedGroup, onSave }: BedGroupModalProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");

  // Floors from API (dummy for now)
  const [floors, setFloors] = useState<string[]>([]);

  useEffect(() => {
    // Fetch floors from API
    async function fetchFloors() {
      // Replace with real API call
      const data = ["Ground Floor", "First Floor", "Second Floor", "ICU Floor"];
      setFloors(data);
    }

    fetchFloors();
  }, []);

  useEffect(() => {
    if (bedGroup) {
      setName(bedGroup.name || "");
      setFloor(bedGroup.floor || "");
      setDescription(bedGroup.description || "");
    }
  }, [bedGroup]);

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!floor.trim()) return toast.error("Floor is required");

    onSave({ id: bedGroup?.id, name, floor, description });
    setOpen(false);
    setName("");
    setFloor("");
    setDescription("");
  };

  return (
    <>
      <Button variant={bedGroup ? "outline" : "default"} onClick={() => setOpen(true)}>
        {bedGroup ? "Edit" : "Add Bed Group"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-background p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {bedGroup ? "Edit Bed Group" : "Add Bed Group"}
            </h2>

            <div className="space-y-4">

              {/* Name */}
              <div className="grid gap-1">
                <label className="font-medium">Name</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bed Group Name"
                />
              </div>

              {/* Floor Combobox */}
              <div className="grid gap-1">
                <label className="font-medium">Floor</label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {floor ? floor : "Select Floor"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search floor..." />
                      <CommandList>
                        <CommandEmpty>No floor found.</CommandEmpty>

                        {floors.map((f) => (
                          <CommandItem
                            key={f}
                            onSelect={() => {
                              setFloor(f);
                            }}
                          >
                            {f}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <label className="font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {bedGroup ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
