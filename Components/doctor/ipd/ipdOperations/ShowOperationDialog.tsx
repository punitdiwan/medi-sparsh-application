"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Operation } from "./ipdOperationManager";
import { ShowOperationCard } from "./ShowOperationCard";

type Props = {
  open: boolean;
  onClose: () => void;
  operation: Operation | null;
};

export function ShowOperationDialog({ open, onClose, operation }: Props) {
  if (!operation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-3xl 
          p-0 
          border-dialog 
          bg-dialog-surface
          max-h-[85vh] 
          flex 
          flex-col
        "
      >
        {/* HEADER (FIXED) */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-dialog">
          <DialogTitle className="text-lg font-semibold">
            Operation Details
          </DialogTitle>
        </DialogHeader>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <ShowOperationCard operation={operation} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
