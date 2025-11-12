"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface NotesProps {
  value?: string;
  onChange?: (notes: string) => void;
}

function NotesSection({ value = "", onChange }: NotesProps) {
  const [notes, setNotes] = useState(value);

  useEffect(() => {
    onChange?.(notes);
  }, [notes]);

  return (
    <Card className="m-5 shadow-sm border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Notes
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Textarea
          placeholder="Type your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] resize-y border-input bg-background text-foreground focus-visible:ring-ring"
        />
      </CardContent>
    </Card>
  );
}

export default NotesSection;
