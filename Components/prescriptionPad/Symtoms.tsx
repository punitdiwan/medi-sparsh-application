"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { searchSymptoms } from "@/lib/actions/symptomClient";

interface SymptomItem {
  id?: string;
  name: string;
  description?: string;
  symptomTypeName?: string;
}

interface Props {
  value: SymptomItem[];
  onChange: (symptoms: SymptomItem[]) => void;
}

export default function Symptoms({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [allSymptoms, setAllSymptoms] = useState<SymptomItem[]>([]);
  const [suggestions, setSuggestions] = useState<SymptomItem[]>([]);
  const [localSymptoms, setLocalSymptoms] = useState<SymptomItem[]>(
    Array.isArray(value) ? value : []
  );

  const fetchedOnce = useRef(false);

  // Sync from parent
  useEffect(() => {
    setLocalSymptoms(Array.isArray(value) ? value : []);
  }, [value]);

  // 🔥 Fetch ONLY when user starts typing
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const fetch = async () => {
      try {
        if (!fetchedOnce.current) {
          const res = await searchSymptoms();
          if (Array.isArray(res?.data)) {
            const normalized = res.data.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description ?? undefined,
              symptomTypeName: s.symptomTypeName ?? undefined,
            }));

            setAllSymptoms(normalized);
          }

        }
      } catch (err) {
        console.error("Symptom fetch failed", err);
      }
    };

    fetch();
  }, [input]);

  // 🔥 Filter suggestions
  useEffect(() => {
    if (!input || !Array.isArray(allSymptoms)) return;

    const filtered = allSymptoms.filter(
      (s) =>
        s.name.toLowerCase().includes(input.toLowerCase()) &&
        !localSymptoms.some(
          (ls) => ls.name.toLowerCase() === s.name.toLowerCase()
        )
    );

    setSuggestions(filtered);
  }, [input, allSymptoms, localSymptoms]);

  const addSymptom = (symptom: SymptomItem) => {
    const updated = [...localSymptoms, symptom];
    setLocalSymptoms(updated);
    onChange(updated);
    setInput("");
    setSuggestions([]);
  };

  const addFromInput = () => {
    if (!input.trim()) return;
    addSymptom({ name: input.trim() });
  };

  const removeSymptom = (index: number) => {
    const updated = localSymptoms.filter((_, i) => i !== index);
    setLocalSymptoms(updated);
    onChange(updated);
  };

  return (
    <Card className="border border-border shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Symptoms</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm italic text-muted-foreground mb-1">
          Search symptoms or add a new one and press <b>Enter</b> or click <b>Add</b>.
        </p>

        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (suggestions.length > 0) {
              addSymptom(suggestions[0]);
              return;
            }

            addFromInput();
          }}
        >
          <Input
            placeholder="Search or type symptom"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button type="submit" size="icon" variant="secondary">
            <Plus className="h-4 w-4" />
          </Button>
        </form>


        {suggestions.length > 0 && (
          <div className="border rounded-md max-h-40 overflow-auto">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 cursor-pointer hover:bg-muted"
                onClick={() => addSymptom(s)}
              >
                <div className="font-medium">{s.name}</div>
                {s.symptomTypeName && (
                  <div className="text-xs text-muted-foreground">
                    {s.symptomTypeName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          {localSymptoms.length ? (
            localSymptoms.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border
                           bg-blue-100 text-blue-800 border-blue-300
                           dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700"
              >
                {s.name}
                <button onClick={() => removeSymptom(i)}>
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No symptoms selected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
