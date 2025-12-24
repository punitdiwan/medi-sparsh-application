"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pill, PlusCircle } from "lucide-react";

export type MedicationInput = {
  date: string;
  time: string;
  categoryId: string;
  categoryName: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  remarks?: string;
};

type Medication = MedicationInput & {
  id: string;
};


type Category = { id: string; name: string };
type Medicine = { id: string; name: string; categoryId: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationInput) => void;
  defaultValues?: Partial<Medication>;
};

/* ---------------- Static Demo Data ---------------- */
const CATEGORIES: Category[] = [
  { id: "1", name: "Antibiotic" },
  { id: "2", name: "Painkiller" },
  { id: "3", name: "Vitamin" },
];

const MEDICINES: Medicine[] = [
  { id: "m1", name: "Amoxicillin", categoryId: "1" },
  { id: "m2", name: "Cefixime", categoryId: "1" },
  { id: "m3", name: "Paracetamol", categoryId: "2" },
  { id: "m4", name: "Ibuprofen", categoryId: "2" },
  { id: "m5", name: "Vitamin C", categoryId: "3" },
];

/* ---------------- Component ---------------- */
export function MedicationDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [remarks, setRemarks] = useState("");

  const filteredMedicines = MEDICINES.filter(
    (m) => m.categoryId === category
  );

  /* ---------------- Populate Edit Data ---------------- */
  useEffect(() => {
    if (defaultValues) {
      setDate(defaultValues.date || "");
      setTime(defaultValues.time || "");
      setCategory(defaultValues.categoryId || "");
      setMedicine(defaultValues.medicineId || "");
      setDosage(defaultValues.dosage || "");
      setRemarks(defaultValues.remarks || "");
    } else {
      resetForm();
    }
  }, [defaultValues, open]);

  const resetForm = () => {
    setDate("");
    setTime("");
    setCategory("");
    setMedicine("");
    setDosage("");
    setRemarks("");
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = () => {
    if (!date || !time || !category || !medicine || !dosage) {
      alert("Please fill all required fields");
      return;
    }

    const categoryName =
      CATEGORIES.find((c) => c.id === category)?.name || "";
    const medicineName =
      MEDICINES.find((m) => m.id === medicine)?.name || "";

    onSubmit({
      date,
      time,
      categoryId: category,
      categoryName,
      medicineId: medicine,
      medicineName,
      dosage,
      remarks,
    });

    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-xl">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-brand-gradient text-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Pill className="h-5 w-5" />
                </div>
                <DialogTitle className="text-lg font-semibold">
                {defaultValues ? "Edit Medication" : "Add Medication"}
                </DialogTitle>
            </div>
        </DialogHeader>


        {/* BODY */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date *">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>

            <Field label="Time *">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>

            <Field label="Category *">
              <Select value={category} onValueChange={(v) => {
                setCategory(v);
                setMedicine("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Medicine *">
              <Select
                value={medicine}
                onValueChange={setMedicine}
                disabled={!category}
              >
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
            </Field>

            <Field label="Dosage *">
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
            </Field>

            <Field label="Remarks">
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-3 border-t bg-muted/30 sticky bottom-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-brand-gradient text-white flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            {defaultValues ? "Update Medication" : "Save Medication"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Small Helper ---------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
