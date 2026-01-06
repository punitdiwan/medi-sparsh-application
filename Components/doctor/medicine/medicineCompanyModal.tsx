"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";

export type Company = {
  id: string;
  name: string;
};

export function CompanyModal({
  open,
  onOpenChange,
  company,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onSave: (data: Company) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      if (company) {
        setName(company.name);
      } else {
        setName("");
      }
    }
  }, [company, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const payload: Company = {
      id: company?.id ?? Math.random().toString(36).substring(2),
      name,
    };

    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Building2 className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{company ? "Edit Company" : "Add Company"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {company
                  ? "Update existing medicine company details."
                  : "Add a new medicine company to the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Company Name *</label>
            <Input
              placeholder="Enter company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {company ? "Update Company" : "Add Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
