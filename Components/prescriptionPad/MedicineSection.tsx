"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface Medicine {
  name: string;
  frequency: string;
  timing: string;
  duration: string;
  instruction: string;
}

interface MedicineProps {
  onChange?: (medicines: Medicine[]) => void;
}

function MedicineSection({ onChange }: MedicineProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [form, setForm] = useState<Medicine>({
    name: "",
    frequency: "",
    timing: "",
    duration: "",
    instruction: "",
  });

  useEffect(() => {
    onChange && onChange(medicines); // notify parent whenever medicines change
  }, [medicines]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setMedicines((prev) => [...prev, form]);
    setForm({ name: "", frequency: "", timing: "", duration: "", instruction: "" });
  };

  const handleRemove = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 p-6 m-5 rounded-lg shadow-md border">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Medicines</h2>

      {/* Add Medicine Form */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4"
      >
        <div>
          <Label className="text-xs">Medicine Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} />
        </div>

        <div>
          <Label className="text-xs">Frequency</Label>
          <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm dark:bg-black">
            <option value="">Select</option>
            <option value="0-0-1">0-0-1</option>
            <option value="0-1-0">0-1-0</option>
            <option value="0-1-1">0-1-1</option>
            <option value="1-0-0">1-0-0</option>
            <option value="1-0-1">1-0-1</option>
            <option value="1-1-0">1-1-0</option>
            <option value="1-1-1">1-1-1</option>
          </select>
        </div>

        <div>
          <Label className="text-xs">Timing</Label>
          <select name="timing" value={form.timing} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm dark:bg-black">
            <option value="">Select</option>
            <option value="Before Meal">Before Meal</option>
            <option value="After Meal">After Meal</option>
            <option value="Morning">Morning</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div>
          <Label className="text-xs">Duration</Label>
          <Input name="duration" value={form.duration} onChange={handleChange} />
        </div>

        <div>
          <Label className="text-xs">Instruction</Label>
          <Input name="instruction" value={form.instruction} onChange={handleChange} />
        </div>
      </form>

      <Button variant="outline" onClick={handleAdd} type="button" className="mb-4">
        <Plus className="w-4 h-4 mr-2" /> Add Medicine
      </Button>

      {/* Medicines Table */}
      {medicines.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-md">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Frequency</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Timing</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Duration</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Instruction</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med, index) => (
                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{index + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{med.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{med.frequency}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{med.timing}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{med.duration}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{med.instruction}</td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No medicines added yet.</p>
      )}
    </div>
  );
}

export default MedicineSection;
