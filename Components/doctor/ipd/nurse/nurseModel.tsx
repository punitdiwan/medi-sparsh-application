"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/* ---------------- TYPES ---------------- */

interface Nurse {
  id: string;
  name: string;
}

interface AddNurseNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

/* ---------------- COMPONENT ---------------- */

export default function AddNurseNoteDialog({
  open,
  onClose,
  onSubmit,
}: AddNurseNoteDialogProps) {
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState("");
  const [nurseId, setNurseId] = useState("");
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");

  const [nurses, setNurses] = useState<Nurse[]>([]);

  /* --------- Fetch Nurses (Dummy for now) --------- */
  useEffect(() => {
    // Replace with API later
    setNurses([
      { id: "1", name: "Nurse Anjali" },
      { id: "2", name: "Nurse Rekha" },
      { id: "3", name: "Nurse Sunita" },
    ]);
  }, []);

  /* --------- Submit --------- */
  const handleSubmit = () => {
    if (!date || !nurseId || !note) return;

    setLoading(true);

    const payload = {
      date,
      nurseId,
      note,
      comment,
    };

    // mock api delay
    setTimeout(() => {
      onSubmit(payload);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Nurse Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-1">
            <Label>Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Nurse Select */}
          <div className="space-y-1">
            <Label>Nurse *</Label>
            <Select value={nurseId} onValueChange={setNurseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Nurse" />
              </SelectTrigger>
              <SelectContent>
                {nurses.map((nurse) => (
                  <SelectItem key={nurse.id} value={nurse.id}>
                    {nurse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <Label>Note *</Label>
            <Textarea
              placeholder="Enter nurse note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <Label>Comment</Label>
            <Textarea
              placeholder="Additional comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
