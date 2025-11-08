"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

export type Specialization = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
};

type Handlers = {
  onEdit: (spec: Specialization) => void;
  onDelete: (id: number) => void;
};

export const getColumns = ({ onEdit, onDelete }: Handlers): ColumnDef<Specialization>[] => [

  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const spec = row.original;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(spec)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title={`Delete Specialization "${spec.name}"?`}
            description="This action cannot be undone. Are you sure you want to delete this specialization?"
            actionLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => onDelete(spec.id)}
          />
          
        </div>
      );
    },
  },
];
