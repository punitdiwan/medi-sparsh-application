"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────
export interface SlotOption {
  slotId: string;   // doctor_slots.id (template row)
  timeFrom: string;   // "10:05"
  timeTo: string;   // "10:10"
  durationMins: number;
  chargeAmount: string;
  isBooked: boolean;
}

interface ShiftInfo {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  day: string;   // "Monday"
}

interface DayCard {
  date: Date;
  dateStr: string;   // "2026-02-27"
  dayName: string;   // "Friday"
  shifts: ShiftInfo[];
  totalSlots: number;
  availableSlots: number;
  isLoaded: boolean;
}

interface SelectedSlot {
  slotId: string;
  shiftId: string;
  bookedTimeFrom: string;
  bookedTimeTo: string;
  chargeAmount: string;
  date: string;
  dayName: string;
}

interface SlotPickerPanelProps {
  doctorId: string;
  shifts: ShiftInfo[];
  onSlotSelect: (slot: SelectedSlot) => void;
  selectedSlot?: SelectedSlot | null;
  fetchSlots: (doctorId: string, date: string, shiftId: string) => Promise<{ success: boolean; data: SlotOption[] }>;
}

// ── Helpers ───────────────────────────────────────────────────────
function getNext15Days(): Date[] {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function calcTotalSlots(startTime: string, endTime: string, durationMins: number): number {
  const diff = parseTime(endTime) - parseTime(startTime);
  return Math.floor(diff / durationMins);
}

// ── Main Component ────────────────────────────────────────────────
export default function SlotPickerPanel({
  doctorId,
  shifts,
  onSlotSelect,
  selectedSlot,
  fetchSlots,
}: SlotPickerPanelProps) {
  const allDays = useMemo(() => getNext15Days(), []);
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [daySlotCounts, setDaySlotCounts] = useState<Record<string, { total: number; available: number; loaded: boolean }>>({});
  const [calendarPage, setCalendarPage] = useState(0); // 0 = days 1-7, 1 = days 8-15

  const DAYS_PER_PAGE = 7;
  const visibleDays = allDays.slice(calendarPage * DAYS_PER_PAGE, (calendarPage + 1) * DAYS_PER_PAGE);

  // Pre-compute day → matching shifts
  const dayShiftMap = useMemo(() => {
    const map: Record<string, ShiftInfo[]> = {};
    allDays.forEach((date) => {
      const dayName = getDayName(date);
      map[toDateStr(date)] = shifts.filter(
        (s) => s.day?.trim().toLowerCase() === dayName.toLowerCase()
      );
    });
    return map;
  }, [allDays, shifts]);

  // Pre-load available slot counts for visible days
  useEffect(() => {
    if (!doctorId || shifts.length === 0) return;

    const loadCounts = async () => {
      for (const date of visibleDays) {
        const dateStr = toDateStr(date);
        const dayShifts = dayShiftMap[dateStr] || [];
        if (dayShifts.length === 0) continue;
        if (daySlotCounts[dateStr]?.loaded) continue;

        let totalAvail = 0;
        let totalAll = 0;

        for (const shift of dayShifts) {
          const total = calcTotalSlots(shift.startTime, shift.endTime, 10); // fallback 10min
          totalAll += total;
          try {
            const result = await fetchSlots(doctorId, dateStr, shift.shiftId);
            if (result.success) {
              totalAvail += result.data.filter((s) => !s.isBooked).length;
              // Update total based on real slots
              if (result.data.length > 0) {
                totalAll = totalAll - total + result.data.length;
              }
            }
          } catch { /* skip */ }
        }

        setDaySlotCounts((prev) => ({
          ...prev,
          [dateStr]: { total: totalAll, available: totalAvail, loaded: true },
        }));
      }
    };

    loadCounts();
  }, [visibleDays, doctorId, shifts, dayShiftMap]);

  // Load slots when a day + shift is selected
  useEffect(() => {
    if (!activeDayIdx === null || activeDayIdx === null || !activeShiftId) {
      setSlots([]);
      return;
    }
    const date = allDays[activeDayIdx];
    const dateStr = toDateStr(date);

    const load = async () => {
      setLoadingSlots(true);
      try {
        const result = await fetchSlots(doctorId, dateStr, activeShiftId);
        if (result.success) setSlots(result.data);
        else setSlots([]);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    load();
  }, [activeDayIdx, activeShiftId]);

  const handleDayClick = (idx: number) => {
    const globalIdx = calendarPage * DAYS_PER_PAGE + idx;
    const dateStr = toDateStr(allDays[globalIdx]);
    const dayShifts = dayShiftMap[dateStr] || [];
    if (dayShifts.length === 0) return;

    setActiveDayIdx(globalIdx);
    // Auto-select first shift
    setActiveShiftId(dayShifts[0].shiftId);
    setSlots([]);
  };

  const handleSlotClick = (slot: SlotOption) => {
    if (slot.isBooked || activeDayIdx === null || !activeShiftId) return;
    const date = allDays[activeDayIdx];
    onSlotSelect({
      slotId: slot.slotId,
      shiftId: activeShiftId,
      bookedTimeFrom: slot.timeFrom,
      bookedTimeTo: slot.timeTo,
      chargeAmount: slot.chargeAmount,
      date: toDateStr(date),
      dayName: getDayName(date),
    });
  };

  const activeDate = activeDayIdx !== null ? allDays[activeDayIdx] : null;
  const activeDateStr = activeDate ? toDateStr(activeDate) : null;
  const activeShiftInfo = activeDateStr
    ? (dayShiftMap[activeDateStr] || []).find((s) => s.shiftId === activeShiftId)
    : null;

  const isSlotSelected = (slot: SlotOption) =>
    selectedSlot?.bookedTimeFrom === slot.timeFrom &&
    selectedSlot?.date === activeDateStr &&
    selectedSlot?.shiftId === activeShiftId;

  return (
    <div className="space-y-4">
      {/* ── Calendar Strip ─────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Select Date
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={calendarPage === 0}
              onClick={() => { setCalendarPage(0); setActiveDayIdx(null); setSlots([]); }}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={calendarPage === 1}
              onClick={() => { setCalendarPage(1); setActiveDayIdx(null); setSlots([]); }}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {visibleDays.map((date, idx) => {
            const globalIdx = calendarPage * DAYS_PER_PAGE + idx;
            const dateStr = toDateStr(date);
            const dayShifts = dayShiftMap[dateStr] || [];
            const counts = daySlotCounts[dateStr];
            const hasShift = dayShifts.length > 0;
            const isActive = activeDayIdx === globalIdx;
            const isToday = idx === 0 && calendarPage === 0;
            const noSlots = hasShift && counts?.loaded && counts.available === 0;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!hasShift || noSlots}
                onClick={() => handleDayClick(idx)}
                className={cn(
                  "flex flex-col items-center rounded-lg py-2 px-1 transition-all text-center",
                  "border text-xs font-medium",
                  !hasShift && "opacity-30 cursor-not-allowed border-transparent bg-transparent",
                  hasShift && !isActive && !noSlots &&
                  "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
                  noSlots && "border-red-100 bg-red-50 opacity-50 cursor-not-allowed",
                  isActive && "border-blue-500 bg-blue-500 text-white shadow-md",
                )}
              >
                {/* Day abbrev */}
                <span className={cn("text-[10px] font-bold uppercase tracking-wide mb-0.5",
                  isActive ? "text-blue-100" : "text-gray-400"
                )}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>

                {/* Date number */}
                <span className={cn("text-base font-bold leading-none",
                  isActive ? "text-white" : isToday ? "text-blue-600" : "text-gray-800"
                )}>
                  {date.getDate()}
                </span>

                {/* Available badge */}
                {hasShift && (
                  <span className={cn(
                    "mt-1 text-[9px] font-semibold rounded-full px-1.5 py-0.5 leading-none",
                    isActive
                      ? "bg-blue-400 text-white"
                      : noSlots
                        ? "bg-red-200 text-red-600"
                        : counts?.loaded
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400"
                  )}>
                    {counts?.loaded
                      ? noSlots ? "Full" : `${counts.available}`
                      : "•••"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Week label */}
        <p className="text-center text-[10px] text-gray-400 mt-2">
          {calendarPage === 0 ? "Next 7 days" : "Days 8 – 15"}
        </p>
      </div>

      {/* ── Shift Tabs (if multiple shifts on selected day) ── */}
      {activeDate && (dayShiftMap[activeDateStr!] || []).length > 1 && (
        <div className="flex gap-2">
          {(dayShiftMap[activeDateStr!] || []).map((shift) => (
            <button
              key={shift.shiftId}
              type="button"
              onClick={() => { setActiveShiftId(shift.shiftId); setSlots([]); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                activeShiftId === shift.shiftId
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
              )}
            >
              <Clock className="w-3 h-3" />
              {shift.shiftName} · {shift.startTime}–{shift.endTime}
            </button>
          ))}
        </div>
      )}

      {/* ── Slot Grid (cinema style) ────────────────────── */}
      {activeDate && activeShiftId && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                {activeDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
              {activeShiftInfo && (
                <Badge variant="secondary" className="text-xs">
                  {activeShiftInfo.shiftName} · {activeShiftInfo.startTime}–{activeShiftInfo.endTime}
                </Badge>
              )}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />
                Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
                Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                Selected
              </span>
            </div>
          </div>

          {/* Slots grid */}
          <div className="p-4">
            {loadingSlots ? (
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No slots configured for this shift
              </div>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const selected = isSlotSelected(slot);
                    return (
                      <button
                        key={`${slot.timeFrom}-${slot.timeTo}`}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => handleSlotClick(slot)}
                        className={cn(
                          "relative flex flex-col items-center justify-center rounded-lg border py-2 px-1",
                          "text-xs font-medium transition-all duration-150",
                          // Available
                          !slot.isBooked && !selected && [
                            "border-green-300 bg-green-50 text-green-800",
                            "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700",
                            "hover:shadow-sm cursor-pointer",
                          ],
                          // Booked
                          slot.isBooked && [
                            "border-red-200 bg-red-50 text-red-300",
                            "cursor-not-allowed opacity-60",
                          ],
                          // Selected
                          selected && [
                            "border-blue-500 bg-blue-500 text-white shadow-md",
                            "ring-2 ring-blue-300 ring-offset-1",
                          ],
                        )}
                      >
                        {selected && (
                          <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-white opacity-80" />
                        )}
                        <span className="font-bold leading-none">{slot.timeFrom}</span>
                        <span className={cn(
                          "text-[9px] mt-0.5 leading-none",
                          selected ? "text-blue-100" : slot.isBooked ? "text-red-300" : "text-gray-400"
                        )}>
                          {slot.timeTo}
                        </span>
                        {!slot.isBooked && !selected && (
                          <span className="text-[9px] text-green-600 mt-0.5 font-semibold">
                            ₹{slot.chargeAmount}
                          </span>
                        )}
                        {slot.isBooked && (
                          <span className="text-[9px] text-red-400 mt-0.5">Booked</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span>
                    <span className="font-semibold text-green-600">
                      {slots.filter((s) => !s.isBooked).length}
                    </span> available ·{" "}
                    <span className="font-semibold text-red-500">
                      {slots.filter((s) => s.isBooked).length}
                    </span> booked ·{" "}
                    <span className="font-semibold text-gray-600">
                      {slots.length}
                    </span> total
                  </span>
                  {selectedSlot && selectedSlot.date === activeDateStr && (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedSlot.bookedTimeFrom} – {selectedSlot.bookedTimeTo} selected
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────── */}
      {!activeDate && shifts.length > 0 && (
        <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Select a date above to see available slots
        </div>
      )}

      {shifts.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          No shifts configured for this doctor
        </div>
      )}
    </div>
  );
}