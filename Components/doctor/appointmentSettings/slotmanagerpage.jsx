"use client";

import { useEffect, useState } from "react";
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
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from "sonner";

const WEEK_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export default function SlotManagerPage() {
  const [doctors, setDoctors] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [chargeCategories, setChargeCategories] = useState([]);
  const [charges, setCharges] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [chargeId, setChargeId] = useState("");
  const [amount, setAmount] = useState("");

  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  const [showWeekPanel, setShowWeekPanel] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const [filteredShifts, setFilteredShifts] = useState([]);
  const [slotsByDay, setSlotsByDay] = useState(() => {
    const init = {};
    WEEK_DAYS.forEach((d) => (init[d] = []));
    return init;
  });

  const [editingSlotId, setEditingSlotId] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch doctors and their shifts
        const docRes = await fetch("/api/doctorShifts");
        if (docRes.ok) {
          const data = await docRes.json();
          setDoctors(data.doctors);
          setShifts(data.shifts);
        }

        // Fetch charge categories
        const catRes = await fetch("/api/charge-categories");
        if (catRes.ok) {
          const data = await catRes.json();
          setChargeCategories(data);
        }

        // Fetch charges
        const chargeRes = await fetch("/api/charges");
        if (chargeRes.ok) {
          const data = await chargeRes.json();
          setCharges(data);
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      }
    };

    fetchInitialData();
  }, []);

  // Filter shifts based on selected doctor
  useEffect(() => {
    if (!doctorId) {
      setFilteredShifts([]);
      setShiftId("");
      return;
    }

    const selectedDoc = doctors.find((d) => d.doctorId === doctorId);
    if (selectedDoc) {
      // Filter shifts that are assigned to this doctor (value is true)
      const assignedShiftIds = Object.entries(selectedDoc.shifts)
        .filter(([_, assigned]) => assigned)
        .map(([id]) => id);

      const allowedShifts = shifts.filter((s) => assignedShiftIds.includes(s.id));
      setFilteredShifts(allowedShifts);
      setShiftId("");
    }
  }, [doctorId, doctors, shifts]);

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

  const handleSearch = async () => {
    if (!doctorId) return toast.error("Please select doctor");
    if (!shiftId) return toast.error("Please select shift");

    try {
      const res = await fetch(`/api/doctorSlots?doctorId=${doctorId}&shiftId=${shiftId}`);
      if (res.ok) {
        const slots = await res.json();
        // Group slots by day
        const grouped = {};
        WEEK_DAYS.forEach((d) => (grouped[d] = []));

        slots.forEach(slot => {
          if (grouped[slot.day]) {
            grouped[slot.day].push({
              id: slot.id,
              text: `${slot.timeFrom} - ${slot.timeTo}`,
              timeFrom: slot.timeFrom,
              timeTo: slot.timeTo,
              durationMins: slot.durationMins,
              chargeId: slot.chargeId,
              amount: slot.amount, // Assuming API returns amount
              categoryId: slot.categoryId // Assuming API returns categoryId
            });
          }
        });
        setSlotsByDay(grouped);
        setShowWeekPanel(true);
        setSelectedDay(WEEK_DAYS[0]);
      } else {
        toast.error("Failed to fetch slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Error fetching slots");
    }
  };

  const checkSlotOverlap = (day, newFrom, newTo) => {
    const existingSlots = slotsByDay[day];
    for (const slot of existingSlots) {
      if (editingSlotId && slot.id === editingSlotId) continue;
      const existingFrom = slot.timeFrom;
      const existingTo = slot.timeTo;
      if (newFrom < existingTo && newTo > existingFrom) {
        return true;
      }
    }
    return false;
  };

  const validateShiftTime = (from, to) => {
    const selectedShift = shifts.find(s => s.id === shiftId);
    if (!selectedShift) return true;

    // Simple string comparison for HH:mm works
    if (from < selectedShift.startTime || from > selectedShift.endTime) {
      toast.error(`Time From must be between ${selectedShift.startTime} and ${selectedShift.endTime}`);
      return false;
    }
    // Note: 'to' can be equal to endTime
    if (to < selectedShift.startTime || to > selectedShift.endTime) {
      // Allow 'to' to be exactly endTime, but strictly speaking a slot ending at 12:00 is fine if shift ends at 12:00
      // If shift is 06:00-12:00, slot 11:30-12:00 is valid.
      // So 'to' > endTime is the error condition.
      if (to > selectedShift.endTime) {
        toast.error(`Time To must be between ${selectedShift.startTime} and ${selectedShift.endTime}`);
        return false;
      }
    }
    if (from >= to) {
      toast.error("Time To must be greater than Time From");
      return false;
    }
    return true;
  };

  const handleAddOrUpdateSlot = async () => {
    if (!selectedDay) return toast.error("Please select a day first.");
    if (!timeFrom || !timeTo) return toast.error("Please select both times.");
    if (!durationMins) return toast.error("Please enter duration.");
    if (!chargeId) return toast.error("Please select a charge.");

    if (!validateShiftTime(timeFrom, timeTo)) return;

    const isOverlap = checkSlotOverlap(selectedDay, timeFrom, timeTo);
    if (isOverlap) {
      return toast.error("This time slot overlaps with an existing slot!");
    }

    const payload = {
      doctorId,
      shiftId,
      day: selectedDay,
      timeFrom,
      timeTo,
      durationMins,
      chargeId
    };

    try {
      let res;
      if (editingSlotId) {
        res = await fetch(`/api/doctorSlots/${editingSlotId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/doctorSlots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedSlot = await res.json();
        toast.success(editingSlotId ? "Slot Updated" : "Slot Added");

        // Refresh slots
        handleSearch();

        // Reset form
        setEditingSlotId(null);
        setTimeFrom("");
        setTimeTo("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save slot");
      }
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Error saving slot");
    }
  };

  const handleAddNew = () => {
    setEditingSlotId(null);
    setTimeFrom("");
    setTimeTo("");
  };

  const handleEdit = (day, slot) => {
    setSelectedDay(day);
    setEditingSlotId(slot.id);
    setTimeFrom(slot.timeFrom);
    setTimeTo(slot.timeTo);
    setDurationMins(slot.durationMins);
    setCategoryId(slot.categoryId || ""); // Ensure category is set if available
    setChargeId(slot.chargeId);
    setAmount(slot.amount);
  };

  const handleDelete = async (day, id) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    try {
      const res = await fetch(`/api/doctorSlots/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Slot deleted");
        // Optimistic update or refresh
        setSlotsByDay((prev) => ({
          ...prev,
          [day]: prev[day].filter((s) => s.id !== id),
        }));
      } else {
        toast.error("Failed to delete slot");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Error deleting slot");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-5">
          <Label>Doctor *</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.doctorId} value={d.doctorId}>{d.doctorName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-5">
          <Label>Shift *</Label>
          <Select value={shiftId} onValueChange={setShiftId}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>
              {filteredShifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Button className="w-full" onClick={handleSearch}>Search</Button>
        </div>
      </div>

      <div className="p-4 border rounded-xl shadow-sm">
        <h3 className="font-semibold mb-3">Consultation Details</h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Duration (mins)</Label>
            <Input type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Charge Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {chargeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Charge</Label>
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

          <div className="flex flex-col gap-1">
            <Label>Amount</Label>
            <Input value={amount} readOnly />
          </div>
        </div>
      </div>

      {showWeekPanel && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 text-center border rounded-lg cursor-pointer ${selectedDay === day ? "bg-background border-blue-500 ring-1 ring-blue-500" : "bg-background hover:bg-muted"
                  }`}
              >
                {day}
              </div>
            ))}
          </div>

          {selectedDay && (
            <div className="p-4 border rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">{selectedDay} Slots</h4>
              </div>

              <div className="w-full flex flex-wrap gap-4 items-end">
                <div className="w-auto flex flex-col gap-1">
                  <Label>Time From</Label>
                  <Input type="time" value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                  />
                </div>

                <div className="w-auto flex flex-col gap-1">
                  <Label>Time To</Label>
                  <Input type="time" value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleAddNew}>
                    Add New
                  </Button>
                  <Button onClick={handleAddOrUpdateSlot}>
                    {editingSlotId ? "Update" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {slotsByDay[selectedDay].length === 0 ? (
                  <p className="text-muted-foreground text-sm">No slots added for this day.</p>
                ) : (
                  slotsByDay[selectedDay].map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50">
                      <div>
                        <div className="font-medium">{s.text}</div>
                        <div className="text-xs text-muted-foreground">Duration: {s.durationMins} mins | Amount: {s.amount}</div>
                      </div>
                      <div className="flex gap-2">
                        <MdEdit className="text-blue-600 cursor-pointer h-5 w-5" onClick={() => handleEdit(selectedDay, s)} />
                        <MdDelete className="text-red-600 cursor-pointer h-5 w-5" onClick={() => handleDelete(selectedDay, s.id)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
