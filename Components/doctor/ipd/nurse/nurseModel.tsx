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
import { NotebookText, PlusCircle } from "lucide-react";

/* ---------------- Types ---------------- */
interface Nurse {
  id: string;
  name: string;
}

interface NurseNoteData {
  date: string;
  nurseId: string;
  note: string;
  comment?: string;
}

interface AddNurseNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NurseNoteData) => void;
  initialData?: NurseNoteData; // optional data for editing
}

/* ---------------- Component ---------------- */
export default function AddNurseNoteDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: AddNurseNoteDialogProps) {
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState("");
  const [nurseId, setNurseId] = useState("");
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");

  const [nurses, setNurses] = useState<Nurse[]>([]);

  /* ---------------- Load Nurses ---------------- */
  useEffect(() => {
    setNurses([
      { id: "1", name: "Nurse Anjali" },
      { id: "2", name: "Nurse Rekha" },
      { id: "3", name: "Nurse Sunita" },
    ]);
  }, []);

  /* ---------------- Populate initial data for editing ---------------- */
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setNurseId(initialData.nurseId);
      setNote(initialData.note);
      setComment(initialData.comment || "");
    } else {
      setDate("");
      setNurseId("");
      setNote("");
      setComment("");
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!date || !nurseId || !note) return;

    setLoading(true);

    const payload: NurseNoteData = {
      date,
      nurseId,
      note,
      comment,
    };

    setTimeout(() => {
      onSubmit(payload);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl border-muted/40 bg-background p-0 overflow-hidden shadow-lg">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 text-white bg-brand-gradient">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <NotebookText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {initialData ? "Edit Nurse Note" : "Add Nurse Note"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Nurse <span className="text-destructive">*</span>
            </Label>
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

          <div>
            <Label className="text-sm font-medium">
              Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Enter nurse note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Comment</Label>
            <Textarea
              placeholder="Additional comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {loading ? "Saving..." : initialData ? "Update Note" : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
