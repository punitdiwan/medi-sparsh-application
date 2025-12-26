"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  FileText,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TimelineDialog, { TimelineInput } from "./timelineDialog";

interface TimelineItem extends TimelineInput {
  id: string;
}

const INITIAL_TIMELINE: TimelineItem[] = [
  {
    id: "1",
    title: "Admission Completed",
    date: "2025-02-12",
    description:
      "Patient admitted successfully and initial assessment completed.",
    visibleToPerson: true,
    document: null,
  },
  {
    id: "2",
    title: "Surgery Performed",
    date: "2025-02-14",
    description:
      "Laparoscopic surgery performed without complications.",
    visibleToPerson: false,
    document: null,
  },
];

export default function TimelineManagerPage() {
  const [timeline, setTimeline] =
    useState<TimelineItem[]>(INITIAL_TIMELINE);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<TimelineItem | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this timeline entry?"))
      return;

    setTimeline((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = (data: TimelineInput) => {
    if (editingItem) {
      setTimeline((prev) =>
        prev.map((t) =>
          t.id === editingItem.id ? { ...data, id: t.id } : t
        )
      );
    } else {
      setTimeline((prev) => [
        ...prev,
        { ...data, id: crypto.randomUUID() },
      ]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-dialog">
            <Clock className="bg-dialog-header text-dialog-icon" />
            Timeline
          </CardTitle>

          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            <PlusCircle className="h-5 w-5" />
            Add Timeline
          </Button>
        </CardHeader>
      </Card>

      {/* TIMELINE */}
      <Card className="border-dialog bg-dialog-header">
        <CardContent className="p-6">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 h-full w-[2px] bg-dialog-primary" />

            <div className="space-y-10">
              {timeline.length ? (
                timeline.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex gap-6 items-start"
                  >
                    {/* ICON */}
                    <div className="relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dialog-primary text-dialog-btn shadow-lg">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <Card className="border-dialog shadow-md hover:shadow-lg transition">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-dialog-icon ">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>

                            {/* ACTION ICONS */}
                            <TooltipProvider>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Pencil
                                      className="h-4 w-4 cursor-pointer text-green-600"
                                      onClick={() =>
                                        handleEdit(item)
                                      }
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Trash2
                                      className="h-4 w-4 cursor-pointer text-red-600"
                                      onClick={() =>
                                        handleDelete(item.id)
                                      }
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Delete
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Badge variant="secondary">
                              {item.date}
                            </Badge>

                            {item.visibleToPerson && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                Visible
                              </Badge>
                            )}

                            {item.document && (
                              <div className="flex items-center gap-1 text-sm text-indigo-600 cursor-pointer">
                                <FileText className="h-4 w-4" />
                                View Document
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No timeline entries added yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ADD / EDIT DIALOG */}
      {open && (
        <TimelineDialog
          open={open}
          initialData={editingItem}
          onClose={() => {
            setOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
