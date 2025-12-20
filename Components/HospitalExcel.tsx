import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ExcelJS from "exceljs";
import { IoCloudUploadOutline } from "react-icons/io5";
import { BsDownload, BsUpload} from "react-icons/bs";

export default function ExcelUploadModal({
  open,
  setOpen,
  entity,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  entity: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !entity) return;

    const fetchConfig = async () => {
      if (config) return;

      try {
        setLoadingConfig(true);

        const res = await fetch(`/api/excel/${entity}`);

        const text = await res.text();

        const data = JSON.parse(text);

        setConfig(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load excel config");
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [open, entity]);

 const downloadTemplate = async () => {
  if (!config) return;

  // CASE 1: Columns empty → server API will generate template
  if (!config.template.columns || config.template.columns.length === 0) {
    window.open(config.template.downloadUrl, "_blank");
    return;
  }

  // CASE 2: Columns present → client side simple template
  try {
    setDownloading(true);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(config.title);

    const headers = config.template.columns.map((col: any) => col.label);
    sheet.addRow(headers);

    for (let i = 0; i < 100; i++) {
      sheet.addRow([]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = config.template.filename;
    link.click();

  } catch (err) {
    console.error(err);
    toast.error("Template download failed");
  } finally {
    setDownloading(false);
  }
};


const uploadFile = async () => {
  if (!file || !config) return toast.error("Select a file");

  setUploading(true);
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(config.upload.url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // ---------------- ROW-WISE ERRORS ----------------
    if (data.errors && data.errors.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Errors");

      const firstData = data.errors[0].data || {};
      const headers = ["Row", "Error", ...Object.keys(firstData)];
      sheet.addRow(headers);

      data.errors.forEach((err: any) => {
        const rowData = err.data || {};
        const row = [
          err.row,
          err.error,
          ...Object.keys(firstData).map((key) => rowData[key] ?? ""),
        ];
        sheet.addRow(row);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "upload_errors.xlsx";
      link.click();

      // Optional: partial success
      if (data.inserted > 0) {
        toast.success(
          `Partial upload success! ${data.inserted} rows inserted. See errors file for failed rows.`
        );
      } else {
        toast.error("Upload failed. See errors file for details.");
      }

      setFile(null);
      return;
    }

    // ---------------- SUCCESS ----------------
    if (!res.ok) throw new Error(data.error || "Upload failed");

    toast.success(`Upload successful! ${data.inserted} rows inserted`);
    setOpen(false);
    setFile(null);

  } catch (e: any) {
    console.error(e);
    toast.error(e.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};

  if (!open) return null;

  if (!config) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex justify-center py-10">
          <VisuallyHidden>
            <DialogTitle>Excel Upload</DialogTitle>
          </VisuallyHidden>

          <Button onClick={() => {}} disabled={loadingConfig}>
            {loadingConfig ? "Loading..." : "Load Excel Config"}
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const busy = uploading || downloading || loadingConfig;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full bg-background rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upload {config.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select a file to upload via Excel or download the template for the required format.
          </DialogDescription>
        </DialogHeader>

        {/* {config.template.columns && config.template.columns.length > 0 && (
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
            <p className="font-medium mb-1">Required Columns</p>
            <ul className="list-disc ml-5 space-y-1">
              {config.template.columns.map((c: any) => (
                <li key={c.key}>{c.label} *</li>
              ))}
            </ul>
          </div>
        )} */}

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
              accept={config.upload.accept.join(",")}
              className="hidden"
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div className="flex flex-col items-center">
              <IoCloudUploadOutline size={40} className="text-gray-500 dark:text-gray-400"/>
              <span className="text-gray-700 dark:text-gray-300">
                {file ? file.name : "Drag & drop a file here or click to select"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported: {config.upload.accept.join(", ")}
              </span>
            </div>
          </label>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          {/* Download Button */}
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={busy}
            className="
              flex items-center gap-2
              rounded-lg
              px-4 py-2
              transition
            "
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <BsDownload className="h-4 w-4" />
                <span className="font-medium">Template</span>
              </>
            )}
          </Button>

          {/* Upload Button (Primary) */}
          <Button
            onClick={uploadFile}
            disabled={busy}
            className="
              flex items-center gap-2
              rounded-lg
              px-5 py-2
              
              shadow-sm
              transition
            "
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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
