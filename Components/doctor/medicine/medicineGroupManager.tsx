"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MedicineGroupModal from "./medicineGroupModel";

export default function MedicineGroupManager() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editValue, setEditValue] = useState("");
  const [search, setSearch] = useState("");

  // SAMPLE DATA (replace with API data later)
  const [groups, setGroups] = useState([
    "Antibiotics",
    "Painkillers",
    "Antiseptics",
    "Vitamins",
  ]);

  // Open Add Modal
  const handleAdd = () => {
    setMode("add");
    setEditValue("");
    setOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (name: string) => {
    setMode("edit");
    setEditValue(name);
    setOpen(true);
  };

  // Save Data (Add / Edit)
  const handleSubmit = (value: string) => {
    if (mode === "add") {
      setGroups((prev) => [...prev, value]);
    } else {
      setGroups((prev) =>
        prev.map((g) => (g === editValue ? value : g))
      );
    }
  };

  // Delete Row
  const handleDelete = (name: string) => {
    setGroups((prev) => prev.filter((g) => g !== name));
  };

  // Filter groups
  const filteredGroups = groups.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="w-full mt-4">
        <CardHeader>
                <CardTitle>Medicine Group Manager</CardTitle>
                <CardDescription>Manage medicine groups here.</CardDescription>
              </CardHeader>
        <CardContent className="p-4 space-y-4">

        {/* Top Row */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <Input
            placeholder="Search group..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button onClick={handleAdd}>
            + Add Medicine Group
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
                <thead>
                <tr>
                    <th className="text-left p-3 border-b">S.No</th>
                    <th className="text-left p-3 border-b">Group Name</th>
                    <th className="text-right p-3 border-b">Actions</th>
                </tr>
                </thead>

                <tbody>
                {filteredGroups.map((name, idx) => (
                    <tr key={idx} className="border-b">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{name}</td>

                    {/* RIGHT ALIGNED ACTIONS */}
                    <td className="p-3">
                        <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(name)}
                        >
                            Edit
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(name)}
                        >
                            Delete
                        </Button>
                        </div>
                    </td>
                    </tr>
                ))}

                {filteredGroups.length === 0 && (
                    <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                        No groups found
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

      </CardContent>

      {/* Modal */}
      <MedicineGroupModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        defaultValue={editValue}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
