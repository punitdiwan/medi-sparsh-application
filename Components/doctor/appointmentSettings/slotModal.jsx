"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";

const WEEK_DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export default function SlotModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    shiftRange,
    selectedDay,
    chargeCategories = [],
    charges = [],
}) {
    const [timeFrom, setTimeFrom] = useState("");
    const [timeTo, setTimeTo] = useState("");
    const [day, setDay] = useState("Monday");

    // Consultation Details state
    const [durationMins, setDurationMins] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [chargeId, setChargeId] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        setDay(selectedDay || "Monday");
        if (initialData) {
            setTimeFrom(initialData.timeFrom || "");
            setTimeTo(initialData.timeTo || "");
            setDurationMins(String(initialData.durationMins || ""));
            setCategoryId(initialData.categoryId || "");
            setChargeId(initialData.chargeId || "");
            setAmount(String(initialData.amount || ""));
        } else {
            setTimeFrom("");
            setTimeTo("");
            setDurationMins("");
            setCategoryId("");
            setChargeId("");
            setAmount("");
        }
    }, [isOpen, initialData, selectedDay]);

    // Update amount when charge is selected
    useEffect(() => {
        if (!chargeId) {
            setAmount("");
            return;
        }
        const selectedCharge = charges.find((c) => c.id === chargeId);
        if (selectedCharge) {
            setAmount(String(selectedCharge.standardCharge || selectedCharge.amount || ""));
        }
    }, [chargeId, charges]);

    const handleSubmit = () => {
        if (!timeFrom || !timeTo) return toast.error("Please select both times.");
        if (!durationMins) return toast.error("Please enter duration.");
        if (!chargeId) return toast.error("Please select a charge.");

        // Validate shift range
        if (shiftRange) {
            if (timeFrom < shiftRange.startTime || timeFrom > shiftRange.endTime) {
                return toast.error(`Time From must be between ${shiftRange.startTime} and ${shiftRange.endTime}`);
            }
            if (timeTo < shiftRange.startTime || (timeTo > shiftRange.endTime && timeTo !== shiftRange.endTime)) {
                if (timeTo > shiftRange.endTime) {
                    return toast.error(`Time To must be between ${shiftRange.startTime} and ${shiftRange.endTime}`);
                }
            }
        }

        if (timeFrom >= timeTo) {
            return toast.error("Time To must be greater than Time From");
        }

        onSave({
            day: day,
            timeFrom,
            timeTo,
            durationMins,
            chargeId,
            categoryId // included if needed by onSave
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg ">
                            <CalendarClock className="bg-dialog-header text-dialog-icon" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle>
                                {initialData ? "Edit Slot" : "Add New Slot"}
                                {shiftRange && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        - {shiftRange.name} ({shiftRange.startTime} - {shiftRange.endTime})
                                    </span>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-dialog-muted text-xs">
                                {initialData ? "Update existing slot details." : "Create a new time slot for appointments."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm mb-1 block">Day *</label>
                            <Select value={day} onValueChange={setDay}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {WEEK_DAYS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            {/* Empty space for grid alignment or add another field if needed */}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm mb-1 block">Time From *</label>
                            <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm mb-1 block">Time To *</label>
                            <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3 text-sm">Consultation Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Duration (mins) *</label>
                                <Input type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} placeholder="e.g. 15" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Charge Category *</label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {chargeCategories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Charge *</label>
                                <Select value={chargeId} disabled={!categoryId} onValueChange={setChargeId}>
                                    <SelectTrigger><SelectValue placeholder="Select charge" /></SelectTrigger>
                                    <SelectContent>
                                        {charges
                                            .filter(c => c.chargeCategoryId === categoryId)
                                            .map((x) => (
                                                <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Amount</label>
                                <Input value={amount} readOnly className="bg-muted" />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="text-dialog-muted">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
                    >
                        {initialData ? "Update Slot" : "Add Slot"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
