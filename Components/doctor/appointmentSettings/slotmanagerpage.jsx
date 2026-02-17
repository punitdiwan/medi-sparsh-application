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
import SlotModal from "./slotModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
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

  const [showWeekPanel, setShowWeekPanel] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const ability = useAbility();
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [slotsByDay, setSlotsByDay] = useState(() => {
    const init = {};
    WEEK_DAYS.forEach((d) => (init[d] = []));
    return init;
  });

  const [editingSlotId, setEditingSlotId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

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
              amount: slot.amount,
              categoryId: slot.categoryId
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

  const handleSaveSlot = async (slotData) => {
    const { day, timeFrom, timeTo, durationMins: slotDuration, chargeId: slotChargeId } = slotData;

    const isOverlap = checkSlotOverlap(day, timeFrom, timeTo);
    if (isOverlap) {
      return toast.error("This time slot overlaps with an existing slot!");
    }

    const payload = {
      doctorId,
      shiftId,
      day,
      timeFrom,
      timeTo,
      durationMins: slotDuration,
      chargeId: slotChargeId
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
        toast.success(editingSlotId ? "Slot Updated" : "Slot Added");
        handleSearch(); // Refresh slots
        setIsModalOpen(false);
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
    if (!showWeekPanel) return toast.error("Please search for a doctor and shift first.");
    setEditingSlotId(null);
    setModalInitialData(null);
    setSelectedDay(WEEK_DAYS[0]); // Default to Monday for new slots
    setIsModalOpen(true);
  };


  const handleEdit = (day, slot) => {
    setSelectedDay(day);
    setEditingSlotId(slot.id);
    setModalInitialData(slot);
    setIsModalOpen(true);
  };

  const handleDelete = async (day, id) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    try {
      const res = await fetch(`/api/doctorSlots/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Slot deleted");
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

  const selectedShift = shifts.find(s => s.id === shiftId);

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Doctor Slots Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Assign slots to doctors.
          </CardDescription>
        </div>
      </CardHeader>
      {/* <Separator /> */}
      <CardContent>
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-4">
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

            <div className="col-span-4">
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

            <div className="col-span-2">
              <Can I="create" a="doctorSlots" ability={ability}>
                <Button className="w-full" onClick={handleAddNew} disabled={!showWeekPanel}>Add New Slot</Button>
              </Can>
            </div>
          </div>


          {showWeekPanel && (
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    {WEEK_DAYS.map((day) => (
                      <th key={day} className="p-3 text-left font-semibold border-r last:border-r-0">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {WEEK_DAYS.map((day) => (
                      <td key={day} className="p-2 align-top border-r last:border-r-0 min-w-[150px]">
                        <div className="space-y-2">
                          {slotsByDay[day].length === 0 ? (
                            <p className="text-muted-foreground text-xs text-center py-4">No slots</p>
                          ) : (
                            slotsByDay[day].map((s) => (
                              <div key={s.id} className="group relative">
                                <div className="flex justify-between items-start p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{s.text}</div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                      <span>{s.durationMins} mins</span>
                                      <span className="font-semibold text-green-600">₹{s.amount}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MdEdit
                                      className="text-blue-600 cursor-pointer h-4 w-4"
                                      onClick={() => handleEdit(day, s)}
                                      title="Edit slot"
                                    />
                                    <MdDelete
                                      className="text-red-600 cursor-pointer h-4 w-4"
                                      onClick={() => handleDelete(day, s.id)}
                                      title="Delete slot"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <SlotModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveSlot}
            initialData={modalInitialData}
            shiftRange={selectedShift}
            selectedDay={selectedDay}
            chargeCategories={chargeCategories}
            charges={charges}
          />
        </div>
      </CardContent>
    </Card>
  );
}
