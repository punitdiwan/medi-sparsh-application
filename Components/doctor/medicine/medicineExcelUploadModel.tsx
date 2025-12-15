"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function MedicineExcelModal({ open, setOpen }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const downloadTemplate = async () => {
    try {
      setDownloadLoading(true);

      const res = await fetch("/api/hospita/template");

      if (!res.ok) {
        toast.error("Failed to download template");
        setDownloadLoading(false);
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

    setDownloadLoading(false);
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setUploadLoading(true);

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

    setUploadLoading(false);
  };

  const isAnyLoading = uploadLoading || downloadLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Medicines Excel</DialogTitle>
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
            <p className="text-sm text-muted-foreground">Need format?</p>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={downloadLoading || uploadLoading}
            >
              {downloadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing...
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
            disabled={uploadLoading || downloadLoading}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
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
