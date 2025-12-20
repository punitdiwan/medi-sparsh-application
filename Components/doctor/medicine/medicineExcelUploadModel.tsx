"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BsDownload, BsUpload } from "react-icons/bs";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function MedicineExcelModal({ open, setOpen }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const downloadTemplate = async () => {
    try {
      setDownloadLoading(true);

      const res = await fetch("/api/medicines/template");

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

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/medicines/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.success) {
      toast.success(`Data imported successfully (${data.inserted} medicine(s))`);
      setFile(null);
      setOpen(false);
      return;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      // Reset the file for retry
      setFile(null);

      if (data.errors.length === 1) {
        // Only one error → show toast directly
        const err = data.errors[0];
        toast.error(`Row ${err.row}: ${err.error}`);
      } else {
        // Multiple errors → show first in toast + generate Excel
        const firstError = data.errors[0];
        toast.error(`Row ${firstError.row}: ${firstError.error}`);

        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Errors");

        const firstRowData = firstError.data || {};
        const headers = ["Row", "Error", ...Object.keys(firstRowData)];
        sheet.addRow(headers);

        data.errors.forEach((err: any) => {
          sheet.addRow([
            err.row,
            err.error,
            ...Object.values(err.data || {}),
          ]);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "medicine_upload_errors.xlsx";
        link.click();
      }
      return;
    }
    setFile(null);
    setOpen(false);
    toast.error(data.error || "Upload failed");
  } catch (err) {
    console.error("Upload error:", err);
    setFile(null);
    setOpen(false);
    toast.error("Upload failed due to network/server error");
  } finally {
    setUploadLoading(false);
  }
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
           <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select a file to upload via Excel or download the template for the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {/* File Upload */}
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className={`
                flex flex-col items-center justify-center
                border-2 border-dashed border-gray-300 dark:border-gray-700
                rounded-lg p-6 cursor-pointer
                transition-colors duration-200 hover:border-blue-500
               dark:hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-gray-800
                `}
               >
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  disabled={isAnyLoading}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                 />
                  <div className="flex flex-col items-center">
                    <IoCloudUploadOutline size={40} className="text-gray-500 dark:text-gray-400"/>
                     <span className="text-gray-700 dark:text-gray-300 mt-2">
                      {file ? file.name : "Drag & drop a file here or click to select"}
                     </span>
                     <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Supported: .xlsx, .xls
                     </span>
                  </div>
            </label>
          </div>
          </div>

        <DialogFooter>
          <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={downloadLoading || uploadLoading}
              className="
                flex items-center gap-2
                rounded-lg
                px-4 py-2
                transition
              "
            >
              {downloadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing...
                </>
              ) : (
                <>
                  <BsDownload className="h-4 w-4" />
                  <span className="font-medium">Template</span>
                </>
              )}
            </Button>
          <Button
            onClick={uploadFile}
            disabled={uploadLoading || downloadLoading}
            className="
              flex items-center gap-2
              rounded-lg
              px-5 py-2
              shadow-sm
              transition
            "
          >
            {uploadLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <BsUpload className="h-4 w-4" />
                <span className="font-medium">Upload</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
