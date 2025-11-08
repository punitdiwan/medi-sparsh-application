"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

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
    <div className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 p-5 m-5 rounded-md shadow-md border">
      <h2 className="text-lg font-semibold mb-3">Symptoms</h2>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Type a symptom"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
        />
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {localSymptoms.length > 0 ? (
          localSymptoms.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{item}</span>
              <button type="button" onClick={() => handleRemove(index)} className="hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm mt-2">No symptoms added yet.</p>
        )}
      </div>
    </div>
  );
}

export default Symptoms;
