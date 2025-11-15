"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";

interface DiagnosisProps {
  value?: {
    diagnosis?: string[];
  };
  onChange: (updated: { diagnosis: string[] }) => void;
}

export default function DiagnosisSection({ value, onChange }: DiagnosisProps) {
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [diagnosisList, setDiagnosisList] = useState<string[]>(value?.diagnosis || []);

  // Sync with parent updates (useful in edit mode)
  useEffect(() => {
    if (value?.diagnosis) {
      setDiagnosisList(value.diagnosis);
    }
  }, [value?.diagnosis]);

  // Add a diagnosis
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = diagnosisInput.trim();
    if (!trimmed) return;

    const updated = [...diagnosisList, trimmed];
    setDiagnosisList(updated);
    setDiagnosisInput("");
    onChange({ diagnosis: updated });
  };

  // Remove a diagnosis
  const handleRemove = (index: number) => {
    const updated = diagnosisList.filter((_, i) => i !== index);
    setDiagnosisList(updated);
    onChange({ diagnosis: updated });
  };

  // Clear all
  const handleClearAll = () => {
    setDiagnosisList([]);
    onChange({ diagnosis: [] });
  };

  return (
    <Card className="border border-border shadow-sm rounded-2xl bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-foreground">
            Diagnosis
          </CardTitle>

          {diagnosisList.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* --- Add Diagnosis Input --- */}
        <form onSubmit={handleAdd} className="flex items-center gap-3">
          <Input
            placeholder="Type a diagnosis"
            value={diagnosisInput}
            onChange={(e) => setDiagnosisInput(e.target.value)}
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

        {/* --- Diagnosis List --- */}
        <div className="flex flex-wrap gap-2">
          {diagnosisList.length > 0 ? (
            diagnosisList.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100 px-3 py-1.5 rounded-full text-sm border border-emerald-300 dark:border-emerald-700"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No diagnosis added yet.
            </p>
          )}
        </div>

        {diagnosisList.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Total: {diagnosisList.length}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
