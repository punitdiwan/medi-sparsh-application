"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Medicine {
  id: string;
  name: string;
  categoryId: string;
}

interface MedicineCategory {
  id: string;
  name: string;
}

export default function AddMedicationModal() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [remarks, setRemarks] = useState("");

  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    setCategories([
      { id: "1", name: "Antibiotic" },
      { id: "2", name: "Painkiller" },
      { id: "3", name: "Vitamin" },
    ]);

    setMedicines([
      { id: "m1", name: "Amoxicillin", categoryId: "1" },
      { id: "m2", name: "Cefixime", categoryId: "1" },
      { id: "m3", name: "Paracetamol", categoryId: "2" },
      { id: "m4", name: "Ibuprofen", categoryId: "2" },
      { id: "m5", name: "Vitamin C", categoryId: "3" },
    ]);
  }, []);

  useEffect(() => {
    if (category) {
      setFilteredMedicines(medicines.filter((m) => m.categoryId === category));
      setMedicine("");
    } else {
      setFilteredMedicines([]);
    }
  }, [category, medicines]);

  const handleSubmit = () => {
    const payload = { date, time, category, medicine, dosage, remarks };
    console.log("Add Medication Payload:", payload);
    setOpen(false);
    setDate("");
    setTime("");
    setCategory("");
    setMedicine("");
    setDosage("");
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Medication</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medication Dose</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="date">Date *</Label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1">
            <Label htmlFor="time">Time *</Label>
            <Input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1">
            <Label htmlFor="category">Medicine Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1">
            <Label htmlFor="medicine">Medicine Name *</Label>
            <Select value={medicine} onValueChange={setMedicine} disabled={!category}>
              <SelectTrigger>
                <SelectValue placeholder="Select Medicine" />
              </SelectTrigger>
              <SelectContent>
                {filteredMedicines.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1">
            <Label htmlFor="dosage">Dosage *</Label>
            <Select value={dosage} onValueChange={setDosage}>
              <SelectTrigger>
                <SelectValue placeholder="Select Dosage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 Tablet">1 Tablet</SelectItem>
                <SelectItem value="2 Tablet">2 Tablet</SelectItem>
                <SelectItem value="1 ml">1 ml</SelectItem>
                <SelectItem value="2 ml">2 ml</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Add remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Add Medication</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
