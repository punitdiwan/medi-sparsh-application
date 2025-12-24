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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserRound, PlusCircle, CalendarDays } from "lucide-react";

/* ---------------- Types ---------------- */
export interface ConsultantRegisterInput {
  appliedDate: string;
  consultantDate: string;
  consultantDoctorId: string;
  consultantDoctorName: string;
  instruction: string;
}

interface AddConsultantRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ConsultantRegisterInput) => void;
  initialData?: ConsultantRegisterInput | null;
  isLoading?: boolean;
}

/* ---------------- Dummy Doctors ---------------- */
const DOCTORS = [
  { id: "d1", name: "Dr. Amit Sharma" },
  { id: "d2", name: "Dr. Neha Verma" },
  { id: "d3", name: "Dr. Rakesh Singh" },
];

/* ---------------- Component ---------------- */
export default function AddConsultantRegisterDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}: AddConsultantRegisterDialogProps) {
  const isEdit = Boolean(initialData);

  const [appliedDate, setAppliedDate] = useState("");
  const [consultantDate, setConsultantDate] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [instruction, setInstruction] = useState("");

  /* ---------------- Populate Edit ---------------- */
  useEffect(() => {
    if (initialData) {
      setAppliedDate(initialData.appliedDate);
      setConsultantDate(initialData.consultantDate);
      setDoctorId(initialData.consultantDoctorId);
      setInstruction(initialData.instruction);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setAppliedDate("");
    setConsultantDate("");
    setDoctorId("");
    setInstruction("");
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = () => {
    if (!appliedDate) {
      toast.error("Applied Date is required");
      return;
    }
    if (!consultantDate) {
      toast.error("Consultant Date is required");
      return;
    }
    if (!doctorId) {
      toast.error("Consultant Doctor is required");
      return;
    }
    if (!instruction.trim()) {
      toast.error("Instruction is required");
      return;
    }

    const doctor = DOCTORS.find((d) => d.id === doctorId);

    onSubmit({
      appliedDate,
      consultantDate,
      consultantDoctorId: doctorId,
      consultantDoctorName: doctor?.name || "",
      instruction,
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden shadow-lg">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-brand-gradient text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <UserRound className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {isEdit ? "Edit Consultant Register" : "Add Consultant Register"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          {/* Applied Date */}
          <div className="space-y-1">
            <Label>
              Applied Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Consultant Date */}
          <div className="space-y-1">
            <Label>
              Consultant Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={consultantDate}
                onChange={(e) => setConsultantDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Consultant Doctor */}
          <div className="space-y-1">
            <Label>
              Consultant Doctor <span className="text-destructive">*</span>
            </Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Consultant Doctor" />
              </SelectTrigger>
              <SelectContent>
                {DOCTORS.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instruction */}
          <div className="space-y-1">
            <Label>
              Instruction <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Enter consultant instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {isLoading
              ? "Saving..."
              : isEdit
              ? "Update Register"
              : "Save Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
