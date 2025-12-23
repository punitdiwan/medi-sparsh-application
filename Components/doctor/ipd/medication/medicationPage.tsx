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
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Edit } from "lucide-react";

interface Medicine {
  id: string;
  date: string;
  time: string;
  categoryId: string;
  categoryName: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  remarks: string;
}

interface MedicineCategory {
  id: string;
  name: string;
}

interface MedicineName {
  id: string;
  name: string;
  categoryId: string;
}

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [medicines, setMedicines] = useState<MedicineName[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [remarks, setRemarks] = useState("");

  const [filteredMedicines, setFilteredMedicines] = useState<MedicineName[]>([]);

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

  // Filter medicines when category changes
  useEffect(() => {
    if (category) {
      setFilteredMedicines(medicines.filter((m) => m.categoryId === category));
      setMedicine(""); // reset medicine selection
    } else {
      setFilteredMedicines([]);
    }
  }, [category, medicines]);

  const openAddModal = () => {
    setEditingMedicine(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setDate(med.date);
    setTime(med.time);
    setCategory(med.categoryId);
    setMedicine(med.medicineId);
    setDosage(med.dosage);
    setRemarks(med.remarks);
    setModalOpen(true);
  };

  const resetForm = () => {
    setDate("");
    setTime("");
    setCategory("");
    setMedicine("");
    setDosage("");
    setRemarks("");
  };

  const handleSubmit = () => {
    if (!date || !time || !category || !medicine || !dosage) {
      alert("Please fill all required fields");
      return;
    }

    const categoryName = categories.find((c) => c.id === category)?.name || "";
    const medicineName = medicines.find((m) => m.id === medicine)?.name || "";

    if (editingMedicine) {
      // Edit existing
      setMedications((prev) =>
        prev.map((m) =>
          m.id === editingMedicine.id
            ? { ...m, date, time, categoryId: category, categoryName, medicineId: medicine, medicineName, dosage, remarks }
            : m
        )
      );
    } else {
      // Add new
      setMedications((prev) => [
        ...prev,
        {
          id: `med-${Date.now()}`,
          date,
          time,
          categoryId: category,
          categoryName,
          medicineId: medicine,
          medicineName,
          dosage,
          remarks,
        },
      ]);
    }

    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-6 space-y-4">
        <div className="flex justify-between flex-warp items-center">
            <h2 className="text-2xl font-semibold">Medication List</h2>
            <Button onClick={openAddModal}>Add Medication</Button>
        </div>
      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Medicine</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No medications added
                  </TableCell>
                </TableRow>
              )}
              {medications.map((med) => (
                <TableRow key={med.id}>
                  <TableCell>{med.date}</TableCell>
                  <TableCell>{med.time}</TableCell>
                  <TableCell>{med.categoryName}</TableCell>
                  <TableCell>{med.medicineName}</TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>{med.remarks}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(med)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Edit Medication" : "Add Medication"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid w-full items-center gap-1">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1">
              <Label>Time *</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1">
              <Label>Medicine Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1">
              <Label>Medicine Name *</Label>
              <Select value={medicine} onValueChange={setMedicine} disabled={!category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Medicine" />
                </SelectTrigger>
                <SelectContent>
                  {filteredMedicines.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1">
              <Label>Dosage *</Label>
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
              <Label>Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit}>{editingMedicine ? "Update Medication" : "Add Medication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
