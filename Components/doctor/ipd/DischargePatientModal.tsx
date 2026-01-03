"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { AlertTriangle, X, LogOut } from "lucide-react";
import { toast } from "sonner";

type Status = "NORMAL" | "REFERRAL" | "DEATH";

export function DischargePatientModal({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [status, setStatus] = useState<Status>("NORMAL");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState<any>({
        dischargeDate: "",
        note: "",
        operation: "",
        diagnosis: "",
        investigation: "",
        treatmentHome: "",

        // death
        deathDate: "",
        guardianName: "",
        attachment: null,
        report: "",

        // referral
        referralDate: "",
        referralHospital: "",
        referralReason: "",
    });

    if (!open) return null;

    /* ---------------- Validation ---------------- */
    const validate = () => {
  const messages: string[] = [];

  if (!form.dischargeDate) messages.push("Discharge Date is required");

  if (status === "DEATH") {
    if (!form.deathDate) messages.push("Death Date is required");
    if (!form.guardianName) messages.push("Guardian Name is required");
  }

  if (status === "REFERRAL") {
    if (!form.referralDate) messages.push("Referral Date is required");
    if (!form.referralHospital) messages.push("Referral Hospital Name is required");
    if (!form.referralReason) messages.push("Reason for Referral is required");
  }

  if (messages.length > 0) {
        toast.error(
            <div className="flex flex-col">
            {messages.map((msg, i) => (
                <div key={i}>{msg}</div>
            ))}
            </div>
        );
        return false;
    }

  return true;
};


    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({ ...form, dischargeStatus: status });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-dialog-surface w-[95vw] max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

                <div className="px-6 py-4 bg-dialog-header border-b border-dialog flex justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Patient Discharge</h2>
                        <p className="text-sm text-muted-foreground">
                            Complete discharge information carefully
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X />
                    </Button>
                </div>

                <div className="mx-6 mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 flex gap-3">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm">
                        <strong>Please note:</strong> Before discharging, check patient bill.
                    </p>
                </div>
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto px-6 py-6 ">
                    <div className="flex gap-4 md:flex-row md:items-end md:space-y-0 space-y-4 mb-2 md:mb-0">
                        <div className="flex flex-col gap-2">
                            <Label>
                                Discharge Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={form.dischargeDate}
                                onChange={(e) =>
                                    setForm({ ...form, dischargeDate: e.target.value })
                                }
                            />
                            {errors.dischargeDate && (
                                <p className="text-sm text-destructive">{errors.dischargeDate}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Discharge Status <span className="text-red-500">*</span>
                            </Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="REFERRAL">Referral</SelectItem>
                                    <SelectItem value="DEATH">Death</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Note</Label>
                        <Textarea
                            rows={4}
                            placeholder="Enter discharge note..."
                            onChange={(e) =>
                                setForm({ ...form, note: e.target.value })
                            }
                        />
                    </div>
                    <div className="flex flex-wrap gap-4 w-full">
                        <div className="flex-1 space-y-2">
                            <Label>Operation</Label>
                            <Input
                                placeholder="Operation details (if any)"
                                onChange={(e) =>
                                    setForm({ ...form, operation: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Diagnosis</Label>
                            <Input
                                placeholder="Diagnosis details"
                                onChange={(e) =>
                                    setForm({ ...form, diagnosis: e.target.value })
                                }
                            />
                        </div>

                    </div>
                    <div className="flex flex-wrap gap-4 w-full">
                        <div className="flex-1 space-y-2">
                            <Label>Investigation</Label>
                            <Input
                                placeholder="Investigation details"
                                onChange={(e) =>
                                    setForm({ ...form, investigation: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Treatment at Home</Label>
                            <Input
                                placeholder="Home care / medication instructions"
                                onChange={(e) =>
                                    setForm({ ...form, treatmentHome: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Death Fields */}
                    {status === "DEATH" && (
                        <div className="border rounded-xl p-4 space-y-4 ">
                            <h4 className="font-semibold ">
                                Death Details
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>
                                        Death Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input type="date" onChange={(e) => setForm({ ...form, deathDate: e.target.value })} />
                                    {errors.deathDate && (
                                        <p className="text-sm text-destructive">
                                            {errors.deathDate}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label>
                                        Guardian Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input placeholder="Enter guardian name" onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
                                    {errors.guardianName && (
                                        <p className="text-sm text-destructive">
                                            {errors.guardianName}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label>Attachment</Label>
                                    <Input type="file" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })} />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Report</Label>
                                    <Textarea placeholder="Enter death report details" onChange={(e) => setForm({ ...form, report: e.target.value })} />
                                </div>

                            </div>
                        </div>

                    )}

                    {/* Referral Fields */}
                    {status === "REFERRAL" && (
                        <div className="border rounded-xl p-4 space-y-4">
                            <h4 className="font-semibold">
                                Referral Details
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>
                                        Referral Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-1">
                                    <Label>
                                        Referral Hospital Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input placeholder="Enter hospital name" />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>
                                        Reason for Referral <span className="text-red-500">*</span>
                                    </Label>
                                    <Input placeholder="Reason for referral" />
                                </div>

                            </div>
                        </div>

                    )}
                </div>
                <div className="px-6 py-4 bg-dialog-header border-t border-dialog flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-dialog-primary text-dialog-btn flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Discharge Patient
                    </Button>
                </div>
            </div>
        </div>
    );
}
