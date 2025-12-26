"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PlusCircle, Pencil, Trash2, UserRound } from "lucide-react";
import AddConsultantRegisterDialog, {
  ConsultantRegisterInput,
} from "./addConsultantRegisterDialog";

/* ---------------- Types ---------------- */
export interface ConsultantRegister
  extends ConsultantRegisterInput {
  id: string;
}

/* ---------------- Page ---------------- */
export default function ConsultantRegisterPage() {
  const [data, setData] = useState<ConsultantRegister[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<ConsultantRegister | null>(null);

  /* ---------------- Filter ---------------- */
  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter(
      (item) =>
        item.consultantDoctorName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.instruction
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.appliedDate.includes(search) ||
        item.consultantDate.includes(search)
    );
  }, [data, search]);

  /* ---------------- Add / Edit ---------------- */
  const handleSubmit = (input: ConsultantRegisterInput) => {
    if (editing) {
      setData((prev) =>
        prev.map((row) =>
          row.id === editing.id
            ? { ...input, id: row.id }
            : row
        )
      );
    } else {
      setData((prev) => [
        ...prev,
        {
          ...input,
          id: crypto.randomUUID(),
        },
      ]);
    }

    setEditing(null);
    setOpen(false);
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = (id: string) => {
    if (!confirm("Delete this consultant register?")) return;
    setData((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <UserRound className="bg-dialog-header text-dialog-icon" />
            Consultant Register
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by doctor / instruction / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />

            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" />
              Add Register
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Applied Date</TableHead>
                <TableHead className="text-dialog-icon">Consultant Date</TableHead>
                <TableHead className="text-dialog-icon">Consultant Doctor</TableHead>
                <TableHead className="text-dialog-icon">Instruction</TableHead>
                <TableHead className="text-center text-dialog-icon">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length ? (
                filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-dialog-muted">
                      {row.appliedDate}
                    </TableCell>
                    <TableCell className="text-dialog-muted">
                      {row.consultantDate}
                    </TableCell>
                    <TableCell className="font-medium text-dialog-muted">
                      {row.consultantDoctorName}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate text-dialog-muted">
                      {row.instruction}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditing(row);
                                  setOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() =>
                                  handleDelete(row.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No consultant register found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      {open && (
        <AddConsultantRegisterDialog
          open={open}
          initialData={editing || null}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}