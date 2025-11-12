"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";

interface DiagnosisProps {
  value: Record<string, any>;
  onChange: (diagnosis: Record<string, any>) => void;
}

function DiagnosisSection({ value, onChange }: DiagnosisProps) {
  const [diagnosis, setDiagnosis] = useState("");
  const [localDiagnosis, setLocalDiagnosis] = useState<string[]>(value.diagnosis || []);

  useEffect(() => {
    setLocalDiagnosis(value.diagnosis || []);
  }, [value]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim()) {
      const updated = [...localDiagnosis, diagnosis.trim()];
      setLocalDiagnosis(updated);
      setDiagnosis("");
      onChange({ diagnosis: updated });
    }
  };

  const handleRemove = (index: number) => {
    const updated = localDiagnosis.filter((_, i) => i !== index);
    setLocalDiagnosis(updated);
    onChange({ diagnosis: updated });
  };

  return (
    <Card className="border border-border shadow-sm rounded-2xl bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Diagnosis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* --- Add Diagnosis Input --- */}
        <form onSubmit={handleAdd} className="flex items-center gap-3">
          <Input
            placeholder="Type a diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
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
          {localDiagnosis.length > 0 ? (
            localDiagnosis.map((item, index) => (
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
      </CardContent>
    </Card>
  );
}

export default DiagnosisSection;
