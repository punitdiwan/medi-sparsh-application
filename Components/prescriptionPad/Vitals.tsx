"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { usePrescriptionStore } from "@/store/usePrescriptionStore";

// Predefined vitals
const vitalsData = [
  { key: "bloodPressure", label: "Blood Pressure", type: "text" },
  { key: "heartRate", label: "Heart Rate", type: "number" },
  { key: "respiratoryRate", label: "Respiratory Rate", type: "number" },
  { key: "temperature", label: "Temperature", type: "number" },
  { key: "oxygenSaturation", label: "Oxygen Saturation", type: "number" },
  { key: "painLevel", label: "Pain Level", type: "number" },
  { key: "consciousness", label: "Consciousness", type: "text" },
];


interface VitalsProps {
  value: Record<string, any>;
  onChange: (newVitals: Record<string, any>) => void;
}
function Vitals({ value, onChange }: VitalsProps) {
  // const { vitals, setVitals } = usePrescriptionStore();
  const handleInput = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };
  // Store selected vitals
  const [enabledVitals, setEnabledVitals] = useState<string[]>([]);

  // Toggle vital selection
  const handleToggleVital = (key: string) => {
    setEnabledVitals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Handle form input
  // const handleChange = (key: string, value: string) => {
  //   setVitals({ ...vitals, [key]: value });
  // };

  return (
    <div className="p-6 m-5 rounded-lg shadow-md border bg-white dark:bg-black border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Vitals</h2>
      </div>

      {/* Vitals Selection (Checkboxes) */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Vitals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {vitalsData.map((vital) => (
            <label
              key={vital.key}
              className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <Checkbox
                checked={enabledVitals.includes(vital.key)}
                onCheckedChange={() => handleToggleVital(vital.key)}
              />
              {vital.label}
            </label>
          ))}
        </div>
      </div>

      {/* Inputs for Enabled Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {vitalsData
          .filter((vital) => enabledVitals.includes(vital.key))
          .map((vital) => (
            <div key={vital.key}>
              <Label
                htmlFor={vital.key}
                className="text-gray-800 dark:text-gray-100"
              >
                {vital.label}
              </Label>
              <Input
                id={vital.key}
                type={vital.type}
                value={value[vital.key] || ''}
                onChange={(e) => handleInput(vital.key, e.target.value)}
                className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default Vitals;
