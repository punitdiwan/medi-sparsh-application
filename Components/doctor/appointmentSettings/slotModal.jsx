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
import { toast } from "sonner";

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
    durationMins,
    chargeId
}) {
    const [timeFrom, setTimeFrom] = useState("");
    const [timeTo, setTimeTo] = useState("");
    const [day, setDay] = useState(selectedDay || "Monday");

    useEffect(() => {
        if (isOpen) {
            setDay(selectedDay || "Monday");
            if (initialData) {
                setTimeFrom(initialData.timeFrom || "");
                setTimeTo(initialData.timeTo || "");
            } else {
                // Reset for new slot
                setTimeFrom("");
                setTimeTo("");
            }
        }
    }, [isOpen, initialData, selectedDay]);

    const handleSubmit = () => {
        if (!timeFrom || !timeTo) return toast.error("Please select both times.");
        if (!durationMins) return toast.error("Please enter duration in Consultation Details.");
        if (!chargeId) return toast.error("Please select a charge in Consultation Details.");

        // Validate shift range
        if (shiftRange) {
            if (timeFrom < shiftRange.startTime || timeFrom > shiftRange.endTime) {
                return toast.error(`Time From must be between ${shiftRange.startTime} and ${shiftRange.endTime}`);
            }
            if (timeTo < shiftRange.startTime || (timeTo > shiftRange.endTime && timeTo !== shiftRange.endTime)) {
                // Allow to be exactly endTime
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
            timeTo
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Slot" : "Add New Slot"}
                        {shiftRange && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                - {shiftRange.name} ({shiftRange.startTime} - {shiftRange.endTime})
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Day *</Label>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Time From *</Label>
                            <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Time To *</Label>
                            <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{initialData ? "Update" : "Save"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
