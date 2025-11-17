"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus, Edit, Save, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type LabTest = {
  name: string;
  description?: string;
};

type Props = {
  value?: LabTest[]; // controlled value
  onChange?: (tests: LabTest[]) => void;
  className?: string;
};

export default function LabTestsEditor({ value = [], onChange, className }: Props) {
  const [tests, setTests] = React.useState<LabTest[]>(() => (value || []).map(normalize));
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingDraft, setEditingDraft] = React.useState<LabTest | null>(null);

  // Keep internal state in sync when parent value changes
  React.useEffect(() => {
    setTests((prev) => {
      const incoming = (value || []).map(normalize);
      // quick shallow compare
      if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
      return incoming;
    });
  }, [value]);

  // emit change
  const emit = (next: LabTest[]) => {
    setTests(next);
    onChange?.(next);
  };

  function normalize(item: any): LabTest {
    return {
      name: item?.name ?? "",
      description: item?.description ?? "",
    };
  }

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const next = [...tests, { name, description: newDesc.trim() }];
    setNewName("");
    setNewDesc("");
    emit(next);
  };

  const handleRemove = (index: number) => {
    const next = tests.filter((_, i) => i !== index);
    emit(next);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingDraft({ ...tests[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingDraft(null);
  };

  const saveEdit = (index: number) => {
    if (editingDraft == null) return;
    const name = editingDraft.name.trim();
    if (!name) return;
    const next = tests.map((t, i) => (i === index ? normalize(editingDraft) : t));
    cancelEdit();
    emit(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= tests.length) return;
    const next = [...tests];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    emit(next);
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle>Lab Tests</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add new */}
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground">Test Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. CBC"
              aria-label="New lab test name"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground">Description (optional)</label>
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description"
              aria-label="New lab test description"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-1 flex gap-2">
            <Button type="submit" className="ml-auto" variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setNewName("");
                setNewDesc("");
              }}
            >
              Clear
            </Button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-3">
          {tests.length === 0 && (
            <p className="text-sm text-muted-foreground">No lab tests added yet.</p>
          )}

          {tests.map((test, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-3 flex flex-col md:flex-row md:items-start md:justify-between gap-3 bg-background"
            >
              <div className="flex-1">
                {editingIndex === idx && editingDraft ? (
                  <>
                    <Input
                      value={editingDraft.name}
                      onChange={(e) => setEditingDraft({ ...editingDraft, name: e.target.value })}
                      placeholder="Test name"
                      className="mb-2"
                    />
                    <Textarea
                      value={editingDraft.description}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      className="mb-2 min-h-[70px]"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-medium">{test.name}</p>
                    {test.description ? (
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 italic">No description</p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-start gap-2">
                {editingIndex === idx ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveEdit(idx)}
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} title="Cancel">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(idx)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-col">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => move(idx, idx - 1)}
                        title="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => move(idx, idx + 1)}
                        title="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(idx)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
