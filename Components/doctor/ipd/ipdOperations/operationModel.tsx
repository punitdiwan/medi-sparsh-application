"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operation } from "./ipdOperationManager";
import { PlusCircle, Users2, X } from "lucide-react";

/* ---------------- Schema ---------------- */
const operationSchema = z.object({
  categoryId: z.number(),
  category: z.string().min(1),
  name: z.string().min(1),
  date: z.string().min(1),
  consultant: z.string().min(1),
  assistant1: z.string().optional(),
  assistant2: z.string().optional(),
  anesthetist: z.string().optional(),
  anesthesiaType: z.string().optional(),
  technician: z.string().optional(),
  otAssistant: z.string().optional(),
  remark: z.string().optional(),
  result: z.string().optional(),
});

type OperationFormValues = z.infer<typeof operationSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Operation) => void;
  defaultValues?: Partial<Operation>;
};

/* ---------------- Static Data ---------------- */
const OPERATION_CATEGORIES = [
  { id: 1, name: "Gynecology", operations: ["Dilation and Curettage", "Hysterectomy"] },
  { id: 2, name: "Orthopedic", operations: ["Knee Replacement", "Hip Replacement"] },
];

const DOCTORS = ["Dr. Sharma", "Dr. Singh", "Dr. Verma"];

/* ---------------- Component ---------------- */
export function IPDOperationDialog({ open, onClose, onSubmit, defaultValues }: Props) {
  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      categoryId: 0,
      category: "",
      name: "",
      date: "",
      consultant: "",
      ...defaultValues,
    },
  });

  const categoryId = form.watch("categoryId");
  const selectedCategory = OPERATION_CATEGORIES.find(c => c.id === categoryId);

  const handleSubmit = (data: OperationFormValues) => {
    onSubmit({
      id: defaultValues?.id ?? crypto.randomUUID(),
      ...data,
    } as Operation);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-xl border-muted/40 bg-background p-0 overflow-hidden shadow-lg flex flex-col">
        
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-brand-gradient text-white flex flex-row justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Users2 className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {defaultValues ? "Edit Operation" : "Add Operation"}
            </DialogTitle>
          </div>

          {/* CROSS BUTTON */}
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 rounded-full p-1" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* SCROLLABLE BODY */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">

            {/* Category */}
            <SelectField 
              label="Operation Category *"
              value={String(categoryId || "")}
              onValueChange={(v: string) => {
                const cat = OPERATION_CATEGORIES.find(c => c.id === Number(v));
                form.setValue("categoryId", Number(v));
                form.setValue("category", cat?.name || "");
                form.setValue("name", "");
              }}
              options={OPERATION_CATEGORIES.map(c => ({ label: c.name, value: String(c.id) }))}
            />

            {/* Operation Name */}
            <SelectField 
              label="Operation Name *"
              value={form.watch("name")}
              onValueChange={(v: string) => form.setValue("name", v)}
              options={selectedCategory?.operations.map(op => ({ label: op, value: op })) || []}
              disabled={!selectedCategory}
            />

            {/* Date */}
            <InputField label="Operation Date *" type="date" {...form.register("date")} />

            {/* Consultant */}
            <SelectField 
              label="Consultant Doctor *"
              value={form.watch("consultant")}
              onValueChange={(v: string) => form.setValue("consultant", v)}
              options={DOCTORS.map(d => ({ label: d, value: d }))}
            />

            {/* Assistants / Anesthetist / Technician */}
            <InputField label="Assistant Consultant 1" {...form.register("assistant1")} />
            <InputField label="Assistant Consultant 2" {...form.register("assistant2")} />
            <InputField label="Anesthetist" {...form.register("anesthetist")} />
            <InputField label="Anesthesia Type" {...form.register("anesthesiaType")} />
            <InputField label="OT Technician" {...form.register("technician")} />
            <InputField label="OT Assistant" {...form.register("otAssistant")} />
            <InputField label="Remark" {...form.register("remark")} />
            <InputField label="Result" {...form.register("result")} />

          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-2 border-t bg-muted/30 flex justify-end gap-2 sticky bottom-0 z-10">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90">
            <PlusCircle className="h-4 w-4" />
            {defaultValues ? "Update Operation" : "Save Operation"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Helper Components ---------------- */
function InputField({ label, ...props }: { label: string } & any) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}

function SelectField({ label, options, value, onValueChange, disabled }: { 
  label: string; 
  options: { label: string; value: string }[]; 
  value: string; 
  onValueChange: (v: string) => void; 
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
