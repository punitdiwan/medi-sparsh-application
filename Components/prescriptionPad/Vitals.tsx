"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getVitals } from "@/lib/actions/vitals";
import { toast } from "sonner";

interface VitalData {
  name: string;
  vitalsUnit: string;
  from: string;
  to: string;
  type?: "bp";
}

interface VitalsProps {
  value: Record<string, any>;
  onChange: (newVitals: Record<string, any>) => void;
}

function Vitals({ value, onChange }: VitalsProps) {
  const [enabledVitals, setEnabledVitals] = useState<string[]>([]);
  const [vitalsData, setVitalsData] = useState<VitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      const filledKeys = Object.keys(value).filter((key) => value[key] !== "" && value[key] != null);
      setEnabledVitals(filledKeys);
    }
  }, [value]);

  const handleToggleVital = (vitalName: string) => {
    const nextState = enabledVitals.includes(vitalName)
      ? enabledVitals.filter((k) => k !== vitalName)
      : [...enabledVitals, vitalName];

    setEnabledVitals(nextState);

    if (!nextState.includes(vitalName)) {
      const { [vitalName]: _, ...rest } = errors;
      setErrors(rest);

      const newVitals = { ...value };
      delete newVitals[vitalName];
      onChange(newVitals);
    }
  };

  const handleInput = (vitalName: string, val: string) => {
    const vital = vitalsData.find((v) => v.name === vitalName);
    if (!vital) return;

    const isBP = vital.type === "bp" || (vital.from.includes("/") && vital.to.includes("/"));

    let sysMin, sysMax, diaMin, diaMax;
    if (isBP) {
      const [fromSys, fromDia] = vital.from.split("/").map(Number);
      const [toSys, toDia] = vital.to.split("/").map(Number);
      sysMin = fromSys;
      diaMin = fromDia;
      sysMax = toSys;
      diaMax = toDia;
    }

    if (val === "") {
      onChange({ ...value, [vitalName]: "" });
      setErrors((prev) => ({ ...prev, [vitalName]: "" }));
      return;
    }

    if (
      val === "." ||
      val.endsWith(".") ||
      val.endsWith("/") ||
      /^[0-9.]*\/?[0-9.]*$/.test(val)
    ) {
      onChange({ ...value, [vitalName]: val });
      setErrors((prev) => ({ ...prev, [vitalName]: "" }));

      if (isBP && val.split("/").some((p) => p === "")) return;
    }

    if (isBP && val.includes("/")) {
      const [sysStr, diaStr] = val.split("/");
      const sys = Number(sysStr);
      const dia = Number(diaStr);

      if (isNaN(sys) || isNaN(dia)) {
        setErrors((prev) => ({ ...prev, [vitalName]: "Invalid BP format" }));
        return;
      }

      let errorMsg = "";
      if (sys < sysMin! || sys > sysMax!) errorMsg = `Systolic must be between ${sysMin}-${sysMax}`;
      if (dia < diaMin! || dia > diaMax!)
        errorMsg = errorMsg
          ? `${errorMsg} | Diastolic must be between ${diaMin}-${diaMax}`
          : `Diastolic must be between ${diaMin}-${diaMax}`;

      setErrors((prev) => ({ ...prev, [vitalName]: errorMsg }));
      onChange({ ...value, [vitalName]: val });
      return;
    }

    const numVal = Number(val);
    const min = Number(vital.from);
    const max = Number(vital.to);

    if (isNaN(numVal)) {
      setErrors((prev) => ({ ...prev, [vitalName]: "Enter a valid number" }));
      return;
    }

    if (numVal < min || numVal > max) {
      setErrors((prev) => ({
        ...prev,
        [vitalName]: `Value must be between ${min} - ${max}`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [vitalName]: "" }));
    }

    onChange({ ...value, [vitalName]: val });
  };

  return (
    <Card className="mb-6 bg-overview-card border-overview-strong">
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
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Vitals</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vitalsData.map((vital) => (
                  <div key={vital.name} className="flex items-center gap-2">
                    <Checkbox
                      checked={enabledVitals.includes(vital.name)}
                      onCheckedChange={() => handleToggleVital(vital.name)}
                    />
                    <span className="text-sm">{vital.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vitalsData
                .filter((vital) => enabledVitals.includes(vital.name))
                .map((vital) => (
                  <div key={vital.name}>
                    <Label htmlFor={vital.name} className="mb-1">
                      {vital.name} 
                    </Label>
                    <Input
                      id={vital.name}
                      type="text"
                      placeholder={`${vital.from} - ${vital.to}`}
                      value={value[vital.name] || ""}
                      onChange={(e) => handleInput(vital.name, e.target.value)}
                      className={errors[vital.name] ? "border-red-500" : ""}
                    />
                    {errors[vital.name] && (
                      <p className="text-xs text-red-600 mt-1">{errors[vital.name]}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {vital.from} - {vital.to}{vital.vitalsUnit}
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
