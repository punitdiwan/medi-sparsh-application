"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NotebookText,
  PlusCircle,
  Pencil,
  Trash2,
  MessageCircle,
} from "lucide-react";
import AddNurseNoteDialog from "./nurseModel";

interface NurseNote {
  id: string;
  date: string;
  time: string;
  nurseId: string;      // Add this
  nurseName: string;
  note: string;
  comment?: string;
}


/* ---------------- Dummy Data ---------------- */
const INITIAL_NOTES: NurseNote[] = [
  {
    id: "1",
    date: "12-02-2025",
    time: "10:30 AM",
    nurseId: "1",
    nurseName: "April Clinton (9020)",
    note: "Daily Routine Check up",
    comment: "Daily Routine Check up",
  },
  {
    id: "2",
    date: "13-02-2025",
    time: "06:45 PM",
    nurseId: "2",
    nurseName: "Nurse Rekha (9021)",
    note: "Administered prescribed medication",
    comment: "Patient responded well",
  },
];

export default function NurseNotesTimeline() {
  const [notes, setNotes] = useState<NurseNote[]>(INITIAL_NOTES);
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NurseNote | null>(null);

  const handleAdd = () => {
    setEditingNote(null);
    setOpen(true);
  };

  const handleEdit = (note: NurseNote) => {
    setEditingNote(note);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleComment = (note: NurseNote) => {
    const comment = prompt("Enter comment:", note.comment || "");
    if (comment !== null) {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, comment } : n))
      );
    }
  };

  const handleSubmit = (data: Partial<NurseNote>) => {
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, ...data } : n))
      );
    } else {
      setNotes((prev) => [
        ...prev,
        { id: Date.now().toString(), ...data } as NurseNote,
      ]);
    }
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <NotebookText className="bg-dialog-header text-dialog-icon" />
            Nurse Notes
          </CardTitle>

          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            <PlusCircle className="h-5 w-5" />
            Add Nurse Note
          </Button>
        </CardHeader>
      </Card>

      {/* TIMELINE */}
      <div className="relative space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 h-full w-[2px] bg-indigo-200" />

        {notes.length ? (
          notes.map((note) => (
            <div key={note.id} className="relative flex gap-6 items-start">
              {/* ICON */}
              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dialog-primary text-dialog-btn shadow-lg">
                  <NotebookText className="h-5 w-5" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <Card className="border border-dialog  shadow-md hover:shadow-lg transition">
                  <CardContent className="px-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-dialog-icon ">{note.nurseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {note.date} | {note.time}
                        </p>
                      </div>

                      {/* ACTION ICONS */}
                      <TooltipProvider>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Pencil
                                className="h-4 w-4 cursor-pointer text-green-600"
                                onClick={() => handleEdit(note)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Trash2
                                className="h-4 w-4 cursor-pointer text-red-600"
                                onClick={() => handleDelete(note.id)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <MessageCircle
                                className="h-4 w-4 cursor-pointer text-blue-600"
                                onClick={() => handleComment(note)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>Add Comment</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>

                    <div >
                      <p className="text-sm text-muted-foreground font-medium">Note</p>
                      <p>{note.note}</p>
                    </div>

                    {note.comment && (
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Comment</p>
                        <p>{note.comment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No nurse notes found
          </p>
        )}
      </div>

      {/* ADD / EDIT DIALOG */}
      {open && (
        <AddNurseNoteDialog
          open={open}
          initialData={editingNote ? {
            date: editingNote.date,
            nurseId: editingNote.nurseId,
            note: editingNote.note,
            comment: editingNote.comment,
          } : undefined}
          onClose={() => {
            setOpen(false);
            setEditingNote(null);
          }}
          onSubmit={handleSubmit}
        />

      )}
    </div>
  );
}
