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
import { getOperationCategories } from "@/lib/actions/operationCategories";
import { getOperationsByCategory, createIPDOperation, updateIPDOperation } from "@/lib/actions/operations";
import { getDoctors } from "@/lib/actions/doctorActions";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { MultiSelectDropdown } from "./multi-select-dropdown";

/* ---------------- Schema ---------------- */
const operationSchema = z.object({
  categoryId: z.string().min(1),
  category: z.string().min(1),
  operationId: z.string().min(1),
  name: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  doctor: z.array(z.string()).min(1, "Select at least one doctor"),
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
  ipdAdmissionId: string;
  onClose: () => void;
  onSubmit: () => void;
  defaultValues?: Partial<Operation>;
};

/* ---------------- Component ---------------- */
export function IPDOperationDialog({ open, ipdAdmissionId, onClose, onSubmit, defaultValues }: Props) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [operations, setOperations] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: useMemo(() => {
      if (!defaultValues) {
        return {
          categoryId: "",
          category: "",
          operationId: "",
          name: "",
          date: new Date().toISOString().split('T')[0],
          time: "",
          doctor: [],
        };
      }

      // Parse operation details
      const details = defaultValues.operationDetails || "";
      const lines = details.split('\n');
      const remarkLine = lines.find(l => l.startsWith('Remarks: '));
      const resultLine = lines.find(l => l.startsWith('Result: '));

      return {
        categoryId: defaultValues.categoryId || "",
        category: defaultValues.categoryName || "",
        operationId: defaultValues.operationId || "",
        name: defaultValues.operationName || "",
        date: defaultValues.operationDate ? new Date(defaultValues.operationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: defaultValues.operationTime ? new Date(defaultValues.operationTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
        doctor: defaultValues?.doctors || [],
        assistant1: defaultValues.supportStaff?.assistant1 || "",
        assistant2: defaultValues.supportStaff?.assistant2 || "",
        anesthetist: defaultValues.anaesthetist?.name || "",
        anesthesiaType: defaultValues.anaesthetiaType || "",
        technician: defaultValues.supportStaff?.technician || "",
        otAssistant: defaultValues.supportStaff?.otAssistant || "",
        remark: remarkLine ? remarkLine.replace('Remarks: ', '') : "",
        result: resultLine ? resultLine.replace('Result: ', '') : "",
      };
    }, [defaultValues]),
  });

  // Reset form when defaultValues changes
  useEffect(() => {
    if (open) {
      form.reset(form.control._defaultValues);
    }
  }, [open, form]);

  const categoryId = form.watch("categoryId");

  useEffect(() => {
    const fetchInitialData = async () => {
      const catRes = await getOperationCategories();
      if (catRes.data) setCategories(catRes.data as any);

      const docRes = await getDoctors();
      if (docRes.data) setDoctors(docRes.data as any);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (categoryId) {
      const fetchOperations = async () => {
        const opRes = await getOperationsByCategory(categoryId);
        if (opRes.data) setOperations(opRes.data as any);
      };
      fetchOperations();
    } else {
      setOperations([]);
    }
  }, [categoryId]);

  const handleSubmit = async (data: OperationFormValues) => {
    const supportStaffJson = {
      assistant1: data.assistant1 || "",
      assistant2: data.assistant2 || "",
      technician: data.technician || "",
      otAssistant: data.otAssistant || "",
    };

    const anaesthetistJson = {
      name: data.anesthetist || "",
    };

    const operationDetails = `Remarks: ${data.remark || ""}\nResult: ${data.result || ""}`;

    // Combine date and time into a Date object
    const [year, month, day] = data.date.split("-").map(Number);
    const [hours, minutes] = data.time.split(":").map(Number);
    const opDate = new Date(year, month - 1, day, hours, minutes);

    const payload = {
      operationId: data.operationId,
      operationDate: opDate,
      operationTime: opDate,
      doctors: data.doctor,
      anaesthetist: anaesthetistJson,
      anaesthetiaType: data.anesthesiaType || "",
      operationDetails,
      supportStaff: supportStaffJson,
    };

    let res;
    if (defaultValues?.id) {
      res = await updateIPDOperation(defaultValues.id, payload);
    } else {
      res = await createIPDOperation({
        ipdAdmissionId,
        ...payload,
      });
    }

    if (res.data) {
      toast.success(defaultValues?.id ? "Operation updated successfully" : "Operation saved successfully");
      onSubmit();
    } else {
      toast.error(res.error || "Failed to save operation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg flex flex-col"
        onInteractOutside={(e) => {
          // Allow interactions with popovers
          const target = e.target as HTMLElement;
          if (target.closest('[role="listbox"]') || target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog flex flex-row justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-dialog">
                {defaultValues?.id ? "Edit Operation" : "Add Operation"}
              </DialogTitle>
              <p className="text-xs text-dialog-muted">
                {defaultValues?.id ? "Update the operation details" : "Fill in the details to record a new operation"}
              </p>
            </div>
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
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh] bg-dialog-surface text-dialog">
          <div className="grid grid-cols-2 gap-4">

            {/* Category */}
            <SelectField
              label="Operation Category *"
              value={categoryId}
              onValueChange={(v: string) => {
                const cat = categories.find(c => c.id === v);
                form.setValue("categoryId", v);
                form.setValue("category", cat?.name || "");
                form.setValue("operationId", "");
                form.setValue("name", "");
              }}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />

            {/* Operation Name */}
            <SelectField
              label="Operation Name *"
              value={form.watch("operationId")}
              onValueChange={(v: string) => {
                const op = operations.find(o => o.id === v);
                form.setValue("operationId", v);
                form.setValue("name", op?.name || "");
              }}
              options={operations.map(op => ({ label: op.name, value: op.id }))}
              disabled={!categoryId}
            />

            {/* Date */}
            <InputField label="Operation Date *" type="date" {...form.register("date")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />

            {/* Time */}
            <InputField label="Operation Time *" type="time" {...form.register("time")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />

            {/* Consultant Doctor */}
            <div className="flex flex-col gap-1 w-full">
              <Label>Consultant Doctors *</Label>

              <MultiSelectDropdown
                options={doctors.map((d) => ({
                  label: d.name,
                  value: d.name, 
                }))}
                value={form.watch("doctor") || []}
                onChange={(val) => form.setValue("doctor", val)}
                placeholder="Select doctors"
              />

              {form.formState.errors.doctor && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.doctor.message as string}
                </p>
              )}
            </div>


            {/* Assistants / Anesthetist / Technician */}
            <InputField label="Assistant Consultant 1" {...form.register("assistant1")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="Assistant Consultant 2" {...form.register("assistant2")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="Anesthetist" {...form.register("anesthetist")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="Anesthesia Type" {...form.register("anesthesiaType")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="OT Technician" {...form.register("technician")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="OT Assistant" {...form.register("otAssistant")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="Remark" {...form.register("remark")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
            <InputField label="Result" {...form.register("result")} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />

          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-end gap-2 sticky bottom-0 z-10">
          <Button variant="outline" type="button" onClick={onClose} className="text-dialog-muted">Cancel</Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">
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
        <SelectTrigger className="w-full bg-dialog-input border-dialog-input text-dialog">
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


