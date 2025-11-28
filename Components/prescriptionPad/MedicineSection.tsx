"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { getMedicineCategories } from "@/lib/actions/medicineCategories";
import { getMedicines } from "@/lib/actions/medicines";
import { toast } from "sonner";

interface MedicineCategory {
  id: string;
  name: string;
}

interface MedicineData {
  id: string;
  name: string;
  categoryId: string;
}

interface Medicine {
  category: string; 
  name: string;
  frequency: string;
  timing: string;
  duration: string;
  instruction: string;
}

interface MedicineProps {
  value?: Medicine[];
  onChange?: (medicines: Medicine[]) => void;
}

function MedicineSection({ value = [], onChange }: MedicineProps) {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [allMedicines, setAllMedicines] = useState<MedicineData[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>(value);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Medicine>({
    category: "",
    name: "",
    frequency: "",
    timing: "",
    duration: "",
    instruction: "",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [catResult, medResult] = await Promise.all([
          getMedicineCategories(),
          getMedicines(),
        ]);

        if (catResult.error) {
          toast.error(catResult.error);
          return;
        }
        if (medResult.error) {
          toast.error(medResult.error);
          return;
        }

        setCategories(catResult.data || []);
        setAllMedicines(medResult.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    onChange?.(medicines);
  }, [medicines]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "category") {
      setForm((prev) => ({ ...prev, name: "" }));
    }
  };

  const resetForm = () =>
    setForm({
      category: "",
      name: "",
      frequency: "",
      timing: "",
      duration: "",
      instruction: "",
    });

  const handleAddOrUpdate = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!form.category || !form.name.trim()) {
      toast.error("Please select category and medicine");
      return;
    }

    if (editIndex !== null) {
      setMedicines((prev) =>
        prev.map((med, i) => (i === editIndex ? { ...form } : med))
      );
      setEditIndex(null);
    } else {
      setMedicines((prev) => [...prev, { ...form }]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setForm(medicines[index]);
    setEditIndex(index);
  };

  const handleRemove = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) resetForm();
  };

  const filteredMedicines = allMedicines.filter(
    (med) =>
      categories.find((cat) => cat.name === form.category)?.id === med.categoryId
  );

  return (
    <Card className="m-5 shadow-sm border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Medicines
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Add/Edit Medicine Form */}
        <form
          onSubmit={handleAddOrUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-5"
        >
          {/* Category */}
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medicine Name */}
          <div>
            <Label className="text-xs text-muted-foreground">Medicine Name</Label>
            <Select
              value={form.name}
              onValueChange={(value) => handleChange("name", value)}
              disabled={!form.category} // disable until category selected
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select medicine" />
              </SelectTrigger>
              <SelectContent>
                {filteredMedicines.map((med) => (
                  <SelectItem key={med.id} value={med.name}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Select
              value={form.frequency}
              onValueChange={(value) => handleChange("frequency", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-0-1">0-0-1</SelectItem>
                <SelectItem value="0-1-0">0-1-0</SelectItem>
                <SelectItem value="0-1-1">0-1-1</SelectItem>
                <SelectItem value="1-0-0">1-0-0</SelectItem>
                <SelectItem value="1-0-1">1-0-1</SelectItem>
                <SelectItem value="1-1-0">1-1-0</SelectItem>
                <SelectItem value="1-1-1">1-1-1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timing */}
          <div>
            <Label className="text-xs text-muted-foreground">Timing</Label>
            <Select
              value={form.timing}
              onValueChange={(value) => handleChange("timing", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Before Meal">Before Meal</SelectItem>
                <SelectItem value="After Meal">After Meal</SelectItem>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-xs text-muted-foreground">Day</Label>
            <Input
              name="duration"
              value={form.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder="e.g. 5 days"
            />
          </div>

          {/* Instruction */}
          <div>
            <Label className="text-xs text-muted-foreground">Instruction</Label>
            <Input
              name="instruction"
              value={form.instruction}
              onChange={(e) => handleChange("instruction", e.target.value)}
              placeholder="e.g. Take after breakfast"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 mb-5">
          <Button
            variant={editIndex !== null ? "default" : "secondary"}
            onClick={handleAddOrUpdate}
            type="button"
          >
            {editIndex !== null ? (
              <>
                <Pencil className="w-4 h-4 mr-2" /> Update Medicine
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Add Medicine
              </>
            )}
          </Button>

          {editIndex !== null && (
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setEditIndex(null);
              }}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Medicines Table */}
        {medicines.length > 0 ? (
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>#</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Instruction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {medicines.map((med, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell>{med.name}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell>{med.timing}</TableCell>
                    <TableCell>{med.duration}</TableCell>
                    <TableCell>{med.instruction}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(index)}
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No medicines added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicineSection;
