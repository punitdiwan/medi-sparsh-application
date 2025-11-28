"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SymptomsProps {
  value: Record<string, any>;
  onChange: (symptoms: Record<string, any>) => void;
}

function Symptoms({ value, onChange }: SymptomsProps) {
  const [symptom, setSymptom] = useState("");
  const [localSymptoms, setLocalSymptoms] = useState<string[]>(value.symptoms || []);

  useEffect(() => {
    setLocalSymptoms(value.symptoms || []);
  }, [value]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptom.trim()) {
      const updated = [...localSymptoms, symptom.trim()];
      setLocalSymptoms(updated);
      setSymptom("");
      onChange({ symptoms: updated });
    }
  };

  const handleRemove = (index: number) => {
    const updated = localSymptoms.filter((_, i) => i !== index);
    setLocalSymptoms(updated);
    onChange({ symptoms: updated });
  };

  return (
    <Card className="border border-border shadow-sm rounded-2xl bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Symptoms
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm italic text-muted-foreground mb-1">
          Type a symptom and press <b>Enter</b> or click <b>Add</b>.
        </p>
        {/* --- Add Symptom Input --- */}
        <form onSubmit={handleAdd} className="flex items-center gap-3">
          <Input
            placeholder="Type a symptom"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            size="icon"
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <Separator />

        {/* --- Symptoms List --- */}
         <div className="flex flex-wrap gap-2">
          {localSymptoms.length > 0 ? (
            localSymptoms.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border
                           bg-blue-100 text-blue-800 border-blue-300
                           dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="hover:text-destructive dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground dark:text-gray-400 italic">
              No symptoms added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Symptoms;
