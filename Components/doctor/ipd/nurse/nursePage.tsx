"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddNurseNoteDialog from "./nurseModel";


interface NurseNote {
  id: string;
  date: string;
  time: string;
  nurseName: string;
  note: string;
}


const DUMMY_NOTES: NurseNote[] = [
  {
    id: "1",
    date: "12-02-2025",
    time: "10:30 AM",
    nurseName: "Nurse Anjali",
    note: "Patient vitals stable. BP normal.",
  },
  {
    id: "2",
    date: "13-02-2025",
    time: "06:45 PM",
    nurseName: "Nurse Rekha",
    note: "Administered prescribed medication.",
  },
];


export default function NurseNotesPage() {
  const [notes, setNotes] = useState<NurseNote[]>(DUMMY_NOTES);
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <Card className="px-6">
      
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Nurse Notes</h2>
            <Button className="flex items-center gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Nurse Note
            </Button>
          </div>
        </CardHeader>
        

      <AddNurseNoteDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => {
            console.log("Nurse Note Data:", data);
        }}
        />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes List</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Nurse Name</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>{note.date}</TableCell>
                      <TableCell>{note.time}</TableCell>
                      <TableCell>{note.nurseName}</TableCell>
                      <TableCell className="max-w-[400px] truncate">
                        {note.note}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-10"
                    >
                      No nurse notes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </Card>
    </div>
  );
}
