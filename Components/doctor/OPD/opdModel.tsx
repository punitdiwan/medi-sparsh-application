// Updated OpdModal with all fixes applied

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PatientSearchBox from "../appointment/searchPatient";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { z } from "zod";
interface Patient {
    id: string;
    name: string;
}

const DoctorSchema = z.object({
    id: z.string(),
    name: z.string(),
});
const DoctorArraySchema = z.array(DoctorSchema);

interface ChargeItem {
    id: string;
    name: string;
    standard: number;
    tax: number;
}

interface OpdModalProps {
    open: boolean;
    onClose: () => void;
}
const ChargeCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
});
const ChargeCategoryArraySchema = z.array(ChargeCategorySchema);

const FormSchema = z.object({
    appointmentDate: z.string().nonempty("Appointment date is required"),
    case: z.string().nonempty("Case is required"),
    casualty: z.enum(["yes", "no"]),
    oldPatient: z.enum(["yes", "no"]),
    reference: z.string().optional(),
    patientId: z.string().nonempty("Patient is required"),
    doctorId: z.string().nonempty("Doctor is required"),
    chargeCategoryId: z.string().nonempty("Charge category is required"),
    chargeId: z.string().nonempty("Charge is required"),
    standardCharge: z.number().optional(),
    tax: z.number().optional(),
    amount: z.number().optional(),
    paymentMode: z.enum(["cash", "card", "upi"]).optional(),
    liveConsultation: z.enum(["yes", "no"]).optional(),
    symptoms: z.string().optional(),
    note: z.string().optional(),
});

type ChargeCategory = z.infer<typeof ChargeCategorySchema>;
type Doctor = z.infer<typeof DoctorSchema>;
type FormData = z.infer<typeof FormSchema>;
export default function OpdModal({ open, onClose }: OpdModalProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [categories, setCategories] = useState<ChargeCategory[]>([]);
    const [charges, setCharges] = useState<ChargeItem[]>([]);

    const [form, setForm] = useState<FormData>({
        appointmentDate: "",
        case: "",
        casualty: "no",
        oldPatient: "no",
        reference: "",
        patientId: "",
        doctorId: "",
        chargeCategoryId: "",
        chargeId: "",
        standardCharge: undefined,
        tax: undefined,
        amount: undefined,
        paymentMode: undefined,
        liveConsultation: undefined,
        symptoms: "",
        note: "",
    });

    const fetchChargeCategory = async () => {
        try {
            const res = await fetch("/api/charge-categories");
            const data = await res.json();
            const parsed = ChargeCategoryArraySchema.safeParse(Array.isArray(data) ? data : data.data);
            if (parsed.success) {
                setCategories(parsed.data);
            } else {
                setCategories([]);
                console.error(parsed.error);
                toast.error("Failed to load categories");
            }
        } catch (err) {
            setCategories([]);
            toast.error("Error loading categories");
        }
    };


    useEffect(() => {
        if (open) {
            setForm((prev) => ({ ...prev, chargeCategoryId: "" }));
            fetchChargeCategory();
        }
    }, [open])

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch("/api/employees");
                const result = await res.json();
                const filteredDoctors = result.data
                    .filter((emp: any) => emp.doctorData)
                    .map((emp: any) => ({
                        id: emp.doctorData.id || "",
                        name: emp.user?.name || "Unknown Doctor",
                    }));
                const parsed = DoctorArraySchema.safeParse(filteredDoctors);
                if (parsed.success) {
                    setDoctors(parsed.data);
                } else {
                    setDoctors([]);
                    console.error(parsed.error);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoctors();
    }, []);

    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
    const [doctorSearch, setDoctorSearch] = useState("");

    const handleSubmit = () => {
        const parsed = FormSchema.safeParse(form);

        if (!parsed.success) {
            // parsed.error.issues contains an array of errors
            parsed.error.issues.forEach((issue) => {
                toast.error(issue.message); // shows each error
            });
            return;
        }

        const payload = {
            ...parsed.data,
            standardCharge: Number(parsed.data.standardCharge),
            tax: Number(parsed.data.tax),
            amount: Number(parsed.data.amount),
            paidAmount: Number(parsed.data.amount),
        };

        console.log("Final Payload:", payload);
        toast.success("OPD Created Successfully!");
        onClose();
    };




    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl rounded-2xl p-0"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}  >
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-lg font-semibold">Add OPD</DialogTitle>
                    <DialogDescription>Fill patient and billing details.</DialogDescription>
                </DialogHeader>

                <div className="p-6 h-[70vh] overflow-y-auto">
                    <div className="flex flex-col gap-4">

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {/* Patient */}
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Search Patient *</Label>

                                    <PatientSearchBox
                                        onSelect={(patient) => {
                                            setForm({
                                                ...form,
                                                patientId: patient.id.toString(),
                                            });
                                        }}
                                    />
                                </div>

                                {/* Appointment Date */}
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Appointment Date *</Label>
                                    <Input
                                        type="date"
                                        value={form.appointmentDate}
                                        onChange={(e) =>
                                            setForm({ ...form, appointmentDate: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Symptoms + Note */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Symptoms</Label>
                                    <Input
                                        value={form.symptoms}
                                        onChange={(e) =>
                                            setForm({ ...form, symptoms: e.target.value })
                                        }
                                        placeholder="Enter symptoms"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Note</Label>
                                    <Input
                                        value={form.note}
                                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                                        placeholder="Enter note"
                                    />
                                </div>
                            </div>

                            {/* Case + Casualty */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-4 flex-1">
                                    <Label>Case</Label>
                                    <Input
                                        placeholder="Enter case"
                                        value={form.case}
                                        onChange={(e) => setForm({ ...form, case: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-4 flex-1">
                                    <Label>Casualty</Label>
                                    <Select
                                        value={form.casualty}
                                        onValueChange={(v) =>
                                            setForm({ ...form, casualty: v as "yes" | "no" })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Old Patient + Reference */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Old Patient</Label>
                                    <Select
                                        value={form.oldPatient}
                                        onValueChange={(v) => setForm({ ...form, oldPatient: v as "yes" | "no" })}
                                    >

                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Reference</Label>
                                    <Input
                                        placeholder="Enter reference"
                                        value={form.reference}
                                        onChange={(e) =>
                                            setForm({ ...form, reference: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {/* Doctor Dropdown */}
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Consultant Doctor *</Label>

                                    <div className="relative">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between"
                                            onClick={() =>
                                                setShowDoctorDropdown(!showDoctorDropdown)
                                            }
                                        >
                                            {doctors.find((d) => d.id === form.doctorId)?.name ||
                                                "Select doctor"}
                                        </Button>

                                        {showDoctorDropdown && (
                                            <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search doctor..."
                                                        className="h-9 px-3 text-sm"
                                                        value={doctorSearch}
                                                        onValueChange={setDoctorSearch}
                                                    />

                                                    <CommandList className="max-h-60 overflow-auto">
                                                        <CommandEmpty>No doctors found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {doctors
                                                                .filter((doc) =>
                                                                    doc.name
                                                                        .toLowerCase()
                                                                        .includes(doctorSearch.toLowerCase())
                                                                )
                                                                .map((doc) => (
                                                                    <CommandItem
                                                                        key={doc.id}
                                                                        value={doc.id}
                                                                        onSelect={() => {
                                                                            setForm({
                                                                                ...form,
                                                                                doctorId: doc.id.toString(),
                                                                            });
                                                                            setShowDoctorDropdown(false);
                                                                            setDoctorSearch("");
                                                                        }}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">
                                                                                {doc.name}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                General Doctor
                                                                            </span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Charge Category */}
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Charge Category</Label>
                                    <Select
                                        value={form.chargeCategoryId || ""}
                                        onValueChange={(v: string) => {
                                            setForm({
                                                ...form,
                                                chargeCategoryId: v,
                                                chargeId: "",
                                                standardCharge: undefined,
                                                tax: undefined,
                                                amount: undefined,
                                            });

                                            setCharges([
                                                { id: "1", name: "OPD Fee", standard: 300, tax: 18 },
                                                { id: "2", name: "Consultation", standard: 500, tax: 18 },
                                            ]);
                                        }}
                                    >

                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Charges + Standard Charge */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Charges</Label>
                                    <Select
                                        value={form.chargeId}
                                        onValueChange={(v) => {
                                            const ch = charges.find((c) => c.id === v);
                                            if (ch) {
                                                const total = ch.standard + (ch.standard * ch.tax) / 100;
                                                setForm({
                                                    ...form,
                                                    chargeId: v,
                                                    standardCharge: ch.standard,
                                                    tax: ch.tax,
                                                    amount: total,
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Charge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {charges?.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Standard Charge</Label>
                                    <Input readOnly value={form.standardCharge || ""} />
                                </div>
                            </div>

                            {/* Tax + Total */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Tax (%)</Label>
                                    <Input readOnly value={form.tax || ""} />
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Total Amount</Label>
                                    <Input readOnly value={form.amount || ""} />
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Payment Mode</Label>
                                    <Select
                                        value={form.paymentMode}
                                        onValueChange={(v) =>
                                            setForm({ ...form, paymentMode: v as "cash" | "card" | "upi" })
                                        }
                                    >

                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 flex-1">
                                    <Label>Paid Amount</Label>
                                    <Input readOnly value={form.amount || ""} />
                                </div>
                            </div>

                            {/* Live Consultation */}
                            <div className="flex flex-col gap-2">
                                <Label>Live Consultation</Label>
                                <Select
                                    value={form.liveConsultation}
                                    onValueChange={(v) =>
                                        setForm({ ...form, liveConsultation: v as "yes" | "no" })
                                    }
                                >

                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full mt-6" onClick={handleSubmit}>
                        Save OPD
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
