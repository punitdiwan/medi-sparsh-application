'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import VitalsModal from "./vitalsModel";

export default function VitalsPage() {
  const [open, setOpen] = useState(false);
  const [vitalsData, setVitalsData] = useState<
    { vitalName: string; vitalValue: string; date: string }[]
  >([]);

  const vitalsList = ["BP", "Pulse", "Temp", "SpO₂", "Respiration"];

  const handleEdit = (index: number) => {
    setOpen(true);
    setEditIndex(index);
  };

  const [editIndex, setEditIndex] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Patient Vitals</h2>
        <Button onClick={() => { setEditIndex(null); setOpen(true); }}>Add Vital</Button>
      </div>

      <VitalsModal
        open={open}
        onClose={() => setOpen(false)}
        vitalsList={vitalsList}
        initialData={editIndex !== null ? [vitalsData[editIndex]] : []}
        onSubmit={(data) => {
          if (editIndex !== null) {
            const newData = [...vitalsData];
            newData[editIndex] = data[0];
            setVitalsData(newData);
          } else {
            setVitalsData((prev) => [...prev, ...data]);
          }
        }}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 border">Vital Name</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vitalsData.length > 0 ? (
              vitalsData.map((v, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{v.vitalName}</td>
                  <td className="p-2 border">{v.vitalValue}</td>
                  <td className="p-2 border">{v.date}</td>
                  <td className="p-2 border">
                    <Button size="sm" onClick={() => { setEditIndex(idx); setOpen(true); }}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No vitals recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
