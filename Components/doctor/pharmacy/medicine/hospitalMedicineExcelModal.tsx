"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type HospitalMedicineExcelModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function HospitalMedicineExcelModal({
  open,
  setOpen,
}: HospitalMedicineExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const isAnyLoading = uploadLoading || downloadLoading;

  const downloadTemplate = async () => {
    try {
      setDownloadLoading(true);

      const res = await fetch("/api/hospitalmedicines/template");

      if (!res.ok) {
        toast.error("Failed to download template");
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "hospital_medicines_template.xlsx";
      link.click();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDownloadLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Only Excel files are allowed");
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/hospitalmedicines/upload", {
        method: "POST",
        body: formData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        toast.error(data?.error || "Upload failed");
        return;
      }

      toast.success("Hospital medicines imported successfully");
      setOpen(false);
      setFile(null);
    } catch {
      toast.error("Upload error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setFile(null);
    setOpen(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Hospital Medicines Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div>
            <p className="text-sm font-medium mb-1">Select Excel File</p>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isAnyLoading}
            />
          </div>

          {/* Download Template */}
          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-muted-foreground">
              Need Excel format?
            </p>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={isAnyLoading}
            >
              {downloadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                "Download Template"
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={uploadFile}
            disabled={isAnyLoading || !file}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
