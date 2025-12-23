"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SymptomItem {
  id?: string;
  name: string;
  description?: string;
  type?: string;
}

interface Props {
  value: SymptomItem[];
  onChange: (symptoms: SymptomItem[]) => void;
}

export default function SymptomMagicSearch({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [allSymptoms, setAllSymptoms] = useState<SymptomItem[]>([]);
  const [suggestions, setSuggestions] = useState<SymptomItem[]>([]);
  const [localSymptoms, setLocalSymptoms] = useState<SymptomItem[]>(
    Array.isArray(value) ? value : []
  );

  // Fetch symptoms from server
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const res = await fetch("/api/symptoms"); // You can call server action here too
        const data = await res.json();
        if (data.data) setAllSymptoms(data.data);
      } catch (err) {
        console.error("Failed to fetch symptoms:", err);
      }
    };
    fetchSymptoms();
  }, []);

  useEffect(() => {
    setLocalSymptoms(Array.isArray(value) ? value : []);
  }, [value]);

  // Update suggestions based on input
  useEffect(() => {
    const filtered = allSymptoms.filter(
      (s) =>
        s.name.toLowerCase().includes(input.toLowerCase()) &&
        !localSymptoms.some((ls) => ls.name.toLowerCase() === s.name.toLowerCase())
    );
    setSuggestions(filtered);
  }, [input, allSymptoms, localSymptoms]);

  const addSymptom = (symptom: SymptomItem) => {
    const updated = [...localSymptoms, symptom];
    setLocalSymptoms(updated);
    onChange(updated);
    setInput("");
  };

  const handleRemove = (index: number) => {
    const updated = localSymptoms.filter((_, i) => i !== index);
    setLocalSymptoms(updated);
    onChange(updated);
  };

  const handleAddFromInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addSymptom({ name: input.trim() }); // Add new symptom if not in suggestions
  };

  return (
    <Card className="border border-border shadow-sm rounded-2xl bg-card">
      <CardHeader>
        <CardTitle>Symptoms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm italic text-muted-foreground">
          Type to search or add a new symptom.
        </p>

        <form onSubmit={handleAddFromInput} className="flex gap-2">
          <Input
            placeholder="Search or type symptom"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {suggestions.length > 0 && (
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="cursor-pointer p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                onClick={() => addSymptom(s)}
              >
                {s.name} {s.type ? `(${s.type})` : ""}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Selected symptoms */}
        <div className="flex flex-wrap gap-2">
          {localSymptoms.length > 0 ? (
            localSymptoms.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700"
              >
                <span>{s.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="hover:text-destructive dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No symptoms selected.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
