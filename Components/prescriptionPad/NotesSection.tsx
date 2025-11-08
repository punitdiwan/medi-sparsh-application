"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesProps {
  value?: string;
  onChange?: (notes: string) => void;
}

function NotesSection({ value = "", onChange }: NotesProps) {
  const [notes, setNotes] = useState(value);

  useEffect(() => {
    onChange && onChange(notes); // parent ko notify
  }, [notes]);

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 p-6 m-5 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Notes
      </h2>
      <Textarea
        placeholder="Type your message here."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700"
      />
    </div>
  );
}

export default NotesSection;
