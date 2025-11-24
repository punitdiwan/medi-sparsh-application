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

const DOCTORS = [
  { id: "1", name: "Dr. Amit Verma" },
  { id: "2", name: "Dr. Neha Sharma" },
  { id: "3", name: "Dr. Rahul Singh" },
];
const DOCTOR_SHIFT_MAP = {
  "1": ["1", "2"],       
  "2": ["2", "3"],       
  "3": ["1", "3"],       
};

const SHIFTS = [
  { id: "1", name: "Morning" },
  { id: "2", name: "Afternoon" },
  { id: "3", name: "Night" },
];

const CHARGE_CATEGORIES = [
  { id: "1", name: "OPD" },
  { id: "2", name: "Emergency" },
];

const CHARGES_MAP = {
  "1": [
    { id: "11", name: "General OPD", amount: 300 },
    { id: "12", name: "Specialist OPD", amount: 500 },
  ],
  "2": [{ id: "21", name: "Emergency Charge", amount: 800 }],
};

const WEEK_DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];
const shiftRanges = {
  "1": { from: "06:00", to: "12:00" }, 
  "2": { from: "12:00", to: "18:00" },
  "3": { from: "18:00", to: "23:59" }
};
export default function SlotManagerPage() {
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

  const [daySlotInput, setDaySlotInput] = useState("");
  const [editingSlotId, setEditingSlotId] = useState(null);

  useEffect(() => {
  if (!doctorId) {
    setFilteredShifts([]);
    setShiftId("");
    return;
  }

  const allowedShifts = DOCTOR_SHIFT_MAP[doctorId] ?? [];
  const finalList = SHIFTS.filter((s) => allowedShifts.includes(s.id));

  setFilteredShifts(finalList);
  setShiftId(""); 
}, [doctorId]);


  useEffect(() => {
    const list = CHARGES_MAP[categoryId] ?? [];
    setChargeId("");
    setAmount("");
  }, [categoryId]);

  useEffect(() => {
    if (!chargeId) return setAmount("");
    const found = (CHARGES_MAP[categoryId] ?? []).find((c) => c.id === chargeId);
    setAmount(found ? String(found.amount) : "");
  }, [chargeId, categoryId]);

  const handleSearch = () => {
    if (!doctorId) return alert("Please select doctor");
    if (!shiftId) return alert("Please select shift");
    setShowWeekPanel(true);
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

const handleAddOrUpdateSlot = () => {
  if (!selectedDay) return toast.error("Please select a day first.");
  if (!timeFrom || !timeTo) return toast.error("Please select both times.");

  if (!validateShiftTime(timeFrom, timeTo)) return;

  const isOverlap = checkSlotOverlap(selectedDay, timeFrom, timeTo);
  if (isOverlap) {
    return toast.error("This time slot overlaps with an existing slot!");
  }

  const newSlot = {
    id: editingSlotId || Date.now().toString(),
    text: `${timeFrom} - ${timeTo}`,
    timeFrom,
    timeTo,
    shiftId,
    doctorId,
    durationMins,
    categoryId,
    chargeId,
    amount,
  };

  setSlotsByDay((prev) => {
    const updated = [...prev[selectedDay]];

    if (editingSlotId) {
      const index = updated.findIndex((s) => s.id === editingSlotId);
      updated[index] = newSlot;
    } else {
      updated.push(newSlot);
    }

    return { ...prev, [selectedDay]: updated };
  });

  setEditingSlotId(null);
  setTimeFrom("");
  setTimeTo("");

  toast.success(editingSlotId ? "Slot Updated" : "Slot Added");
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
    setCategoryId(slot.categoryId);
    setChargeId(slot.chargeId);
    setAmount(slot.amount);
  };

  const handleDelete = (day, id) => {
    setSlotsByDay((prev) => ({
      ...prev,
      [day]: prev[day].filter((s) => s.id !== id),
    }));
  };
  const validateShiftTime = (from, to) => {
  const shift = shiftRanges[shiftId];
  if (!shift) return true;

  if (from < shift.from || from > shift.to) {
    toast.error(`Time From must be between ${shift.from} and ${shift.to}`);
    return false;
  }
  if (to < shift.from || to > shift.to) {
    toast.error(`Time To must be between ${shift.from} and ${shift.to}`);
    return false;
  }
  if (from >= to) {
    toast.error("Time To must be greater than Time From");
    return false;
  }

  return true;
};
  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-12 gap-4 items-end">
        
        <div className="col-span-5">
          <Label>Doctor *</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
            <SelectContent>
              {DOCTORS.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
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
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                {CHARGE_CATEGORIES.map((c) => (
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
                {(CHARGES_MAP[categoryId] ?? []).map((x) => (
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
                className={`p-3 text-center border rounded-lg cursor-pointer ${
                  selectedDay === day ? "bg-background border-blue-500" : "bg-background"
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

              <div className="w-full flex flex-wrap gap-2">

                <div className="w-auto flex flex-col gap-1">
                  <Label>Time From</Label>
                  <Input type="time" value={timeFrom} 
                  onChange={(e) => setTimeFrom(e.target.value)}
                  min={shiftRanges[shiftId]?.from} />
                </div>

                <div className="w-auto flex flex-col gap-1">
                  <Label>Time To</Label>
                  <Input type="time" value={timeTo} 
                  onChange={(e) => setTimeTo(e.target.value)}
                  max={shiftRanges[shiftId]?.to} />
                </div>

              </div>
                <div className="col-span-6 flex gap-3 justify-between">
                  <Button variant="outline" className="w-32" onClick={handleAddNew}>
                    Add New
                  </Button>
                  <Button className="w-32" onClick={handleAddOrUpdateSlot}>
                    {editingSlotId ? "Update" : "Save"}
                  </Button>
                </div>


              <div className="space-y-2">
                {slotsByDay[selectedDay].map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{s.text}</div>
                    </div>
                    <div className="flex gap-2">
                      <MdEdit className="text-blue-600 cursor-pointer" onClick={() => handleEdit(selectedDay, s)} />
                      <MdDelete className="text-red-600 cursor-pointer" onClick={() => handleDelete(selectedDay, s.id)} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
