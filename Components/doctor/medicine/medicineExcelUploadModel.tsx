"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MedicineExcelModal({ open, setOpen }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = async () => {
    try {
      const res = await fetch("/api/medicines/template");

      if (!res.ok) {
        toast.error("Failed to download template");
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "medicines_template.xlsx";
      link.click();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/medicines/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Data imported successfully");
        setOpen(false);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload error");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}  
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Medicines Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div>
            <p className="text-sm font-medium mb-1">Select Excel File</p>
            <Input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-muted-foreground">Need format?</p>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={uploadFile} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
