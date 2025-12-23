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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Operation } from "./ipdOperationManager";
import { User, Users2, Stethoscope, ClipboardCheck, Calendar } from "lucide-react";
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
  {
    id: 1,
    name: "Gynecology",
    operations: ["Dilation and Curettage", "Hysterectomy"],
  },
  {
    id: 2,
    name: "Orthopedic",
    operations: ["Knee Replacement", "Hip Replacement"],
  },
];

const DOCTORS = ["Dr. Sharma", "Dr. Singh", "Dr. Verma"];

/* ---------------- Component ---------------- */

export function IPDOperationDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: Props) {
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
  const selectedCategory = OPERATION_CATEGORIES.find(
    (c) => c.id === categoryId
  );

  const handleSubmit = (data: OperationFormValues) => {
    onSubmit({
      id: defaultValues?.id ?? crypto.randomUUID(),
      ...data,
    } as Operation);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader >
          <DialogTitle className="text-xl font-semibold">
            {defaultValues ? "Edit Operation" : "Add Operation"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* ===== Core Details ===== */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <Label>Operation Category *</Label>
              <Select
                value={String(categoryId || "")}
                onValueChange={(v) => {
                  const cat = OPERATION_CATEGORIES.find(
                    (c) => c.id === Number(v)
                  );
                  form.setValue("categoryId", Number(v));
                  form.setValue("category", cat?.name || "");
                  form.setValue("name", "");
                }}
              >
                <SelectTrigger className="flex-1 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label>Operation Name *</Label>
              <Select
                disabled={!selectedCategory}
                value={form.watch("name")}
                onValueChange={(v) => form.setValue("name", v)}
              >
                <SelectTrigger className="flex-1 w-full">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.operations.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label>Operation Date *</Label>
              <Input type="date" {...form.register("date")} />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label>Consultant Doctor *</Label>
              <Select
                value={form.watch("consultant")}
                onValueChange={(v) => form.setValue("consultant", v)}
              >
                <SelectTrigger className="flex-1 w-full">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {DOCTORS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
            <div className="flex flex-col gap-1">
                <Label>Assistant Consultant 1</Label>
                <Input placeholder="Assistant Consultant 1" {...form.register("assistant1")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Assistant Consultant 2</Label>
                <Input placeholder="Assistant Consultant 2" {...form.register("assistant2")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Anesthetist</Label>
                <Input placeholder="Anesthetist" {...form.register("anesthetist")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Anesthesia Type</Label>
                <Input placeholder="Anesthesia Type" {...form.register("anesthesiaType")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>OT Technician</Label>
                <Input placeholder="OT Technician" {...form.register("technician")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>OT Assistant</Label>
                <Input placeholder="OT Assistant" {...form.register("otAssistant")} />
            </div>
          

            <div className="flex flex-col gap-1">
                <Label>Remark</Label>
                <Input placeholder="Remark" {...form.register("remark")} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Result</Label>
                <Input placeholder="Result" {...form.register("result")} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {defaultValues ? "Update Operation" : "Save Operation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
