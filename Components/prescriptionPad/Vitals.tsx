"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getVitals } from "@/lib/actions/vitals";
import { toast } from "sonner";

interface VitalData {
  id: string;
  name: string;
  vitalsUnit: string;
  from: string;
  to: string;
}

interface VitalsProps {
  value: Record<string, any>;
  onChange: (newVitals: Record<string, any>) => void;
}

function Vitals({ value, onChange }: VitalsProps) {
  const [enabledVitals, setEnabledVitals] = useState<string[]>([]);
  const [vitalsData, setVitalsData] = useState<VitalData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch vitals from database on mount
  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setLoading(true);
        const result = await getVitals();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setVitalsData(result.data || []);
      } catch (error) {
        console.error("Error fetching vitals:", error);
        toast.error("Failed to load vitals");
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, []);

  // ✅ When editing, auto-enable vitals that already have data
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      const filledKeys = Object.keys(value).filter((key) => value[key] !== "" && value[key] != null);
      setEnabledVitals(filledKeys);
    }
  }, [value]);

  const handleToggleVital = (vitalId: string) => {
    setEnabledVitals((prev) => {
      const updated = prev.includes(vitalId) ? prev.filter((k) => k !== vitalId) : [...prev, vitalId];
      // If unchecked, remove it from parent data
      if (!updated.includes(vitalId)) {
        const newVitals = { ...value };
        delete newVitals[vitalId];
        onChange(newVitals);
      }
      return updated;
    });
  };

  const handleInput = (vitalId: string, val: string) => {
    onChange({ ...value, [vitalId]: val });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Vitals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading vitals...</div>
        ) : vitalsData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No vitals configured</div>
        ) : (
          <>
            {/* Vitals Selection */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Vitals</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vitalsData.map((vital) => (
                  <div key={vital.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={enabledVitals.includes(vital.id)}
                      onCheckedChange={() => handleToggleVital(vital.id)}
                    />
                    <span className="text-sm">{vital.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs for Enabled Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vitalsData
                .filter((vital) => enabledVitals.includes(vital.id))
                .map((vital) => (
                  <div key={vital.id}>
                    <Label htmlFor={vital.id} className="mb-1">
                      {vital.name} ({vital.vitalsUnit})
                    </Label>
                    <Input
                      id={vital.id}
                      type="text"
                      placeholder={`${vital.from} - ${vital.to}`}
                      value={value[vital.id] || ""}
                      onChange={(e) => handleInput(vital.id, e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {vital.from} - {vital.to}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default Vitals;
