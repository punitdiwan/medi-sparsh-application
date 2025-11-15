"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  const [enabledVitals, setEnabledVitals] = useState<string[]>([]);

  // ✅ When editing, auto-enable vitals that already have data
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      const filledKeys = Object.keys(value).filter((key) => value[key] !== "" && value[key] != null);
      setEnabledVitals(filledKeys);
    }
  }, [value]);

  const handleToggleVital = (key: string) => {
    setEnabledVitals((prev) => {
      const updated = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      // If unchecked, remove it from parent data
      if (!updated.includes(key)) {
        const newVitals = { ...value };
        delete newVitals[key];
        onChange(newVitals);
      }
      return updated;
    });
  };

  const handleInput = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Vitals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vitals Selection */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Select Vitals</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {vitalsData.map((vital) => (
              <div key={vital.key} className="flex items-center gap-2">
                <Checkbox
                  checked={enabledVitals.includes(vital.key)}
                  onCheckedChange={() => handleToggleVital(vital.key)}
                />
                <span className="text-sm">{vital.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inputs for Enabled Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vitalsData
            .filter((vital) => enabledVitals.includes(vital.key))
            .map((vital) => (
              <div key={vital.key}>
                <Label htmlFor={vital.key} className="mb-1">
                  {vital.label}
                </Label>
                <Input
                  id={vital.key}
                  type={vital.type}
                  value={value[vital.key] || ""}
                  onChange={(e) => handleInput(vital.key, e.target.value)}
                />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default Vitals;
