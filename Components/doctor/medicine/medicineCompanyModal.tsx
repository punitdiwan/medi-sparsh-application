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
import { Label } from "@/components/ui/label";

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
    if (company) {
      setName(company.name);
    } else {
      setName("");
    }
  }, [company]);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {company ? "Edit Company" : "Add Company"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              placeholder="Enter company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {company ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
