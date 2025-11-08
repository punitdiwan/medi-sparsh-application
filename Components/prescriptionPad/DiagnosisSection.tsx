"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

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
    <div className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 p-5 m-5 rounded-md shadow-md border">
      <h2 className="text-lg font-semibold mb-3">Diagnosis</h2>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Type a diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {localDiagnosis.length > 0 ? (
          localDiagnosis.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{item}</span>
              <button type="button" onClick={() => handleRemove(index)} className="hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm mt-2">No diagnosis added yet.</p>
        )}
      </div>
    </div>
  );
}

export default DiagnosisSection;
