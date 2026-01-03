"use client";

import { useState, useEffect } from "react";
import MedicineSection from "@/Components/prescriptionPad/MedicineSection";
import NotesSection from "@/Components/prescriptionPad/NotesSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pill, Printer, Save, X } from "lucide-react";
import Symptoms, { SymptomItem } from "@/Components/prescriptionPad/Symtoms";
import { MasterSymptom } from "@/Components/forms/PrescriptionForm";
import { getSymptoms } from "@/lib/actions/symptomActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createIPDPrescription, updateIPDPrescription } from "@/app/actions/ipdPrescriptionActions";

type Props = {
  open: boolean;
  onClose: () => void;
  ipdId: string;
  doctors: any[];
  editPrescriptionId?: string;
  prescriptions?: any[];
};

export default function PrescriptionModal({ open, onClose, ipdId, doctors, editPrescriptionId, prescriptions }: Props) {
  const [doctorId, setDoctorId] = useState<string>();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [masterSymptoms, setMasterSymptoms] = useState<MasterSymptom[]>([]);
  const [formData, setFormData] = useState({ symptoms: [] as SymptomItem[] });

  /* ---------------- Load Master Symptoms ---------------- */
  useEffect(() => {
    if (!open) return;
    let isActive = true; 
    const loadSymptoms = async () => {
      const res = await getSymptoms();
      if (res.data) {
        setMasterSymptoms(
          res.data.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || "No description added",
            symptomTypeName: s.symptomTypeName || "Unknown",
          }))
        );
      }
    };
    loadSymptoms();
    return () => {
      isActive = false;  
    };
  }, []);

  /* ---------------- Map Symptoms ---------------- */
  const mapSymptomsFromString = (symptomsString: string | null) => {
    if (!symptomsString) return [];
    return symptomsString.split(",").map((raw) => {
      const name = raw.trim();
      const match = masterSymptoms.find(
        (ms) => ms.name.toLowerCase() === name.toLowerCase()
      );
      return {
        id: match?.id,
        name,
        description: match?.description || "No description added",
        symptomTypeName: match?.symptomTypeName || "Unknown",
      };
    });
  };

  /* ---------------- Prefill for edit ---------------- */
 useEffect(() => {
    if (!open) return;
    let isActive = true; 
    // ADD MODE
    if (!editPrescriptionId) {
      setDoctorId(undefined);
      setMedicines([]);
      setNotes("");
      setAttachments([]);
      setFormData({ symptoms: [] });
      return;
    }
    setIsEditLoading(true);
    // EDIT MODE (wait till data ready)
    if (
      editPrescriptionId &&
      prescriptions &&
      prescriptions.length > 0 &&
      masterSymptoms.length > 0
    ) {
      const presc = prescriptions.find((p) => p.id === editPrescriptionId);
      if (!presc) return;

      setDoctorId(presc.doctorId ?? undefined);
      setMedicines(Array.isArray(presc.medicines) ? presc.medicines : []);
      setNotes(presc.notes ?? "");
      setAttachments([]);
      setFormData({
        symptoms: mapSymptomsFromString(presc.findings),
      });
      setIsEditLoading(false);
    }
    return () => {
      isActive = false;   
    };
  }, [open, editPrescriptionId, prescriptions, masterSymptoms]);



  const handleSymptomsChange = (symptoms: SymptomItem[]) =>
    setFormData((prev) => ({ ...prev, symptoms }));


  /* ---------------- Save ---------------- */
  const handleSave = async () => {
    if (!doctorId) return toast.error("Please select doctor");
    if (formData.symptoms.length === 0) return toast.error("Please enter symptoms");
    // if (medicines.length === 0) return toast.error("Add at least one medicine");

    console.log("Saving prescription with ipdId:", ipdId);

    try {
      setLoading(true);
      const payload = {
        ipdAdmissionId: ipdId,
        doctorId,
        symptoms: formData.symptoms.map((s) => s.name).join(", "),
        medicines,
        notes,
        attachments, // Note: File upload logic needs to be handled properly for server actions (e.g., FormData)
      };

      let res;
      if (editPrescriptionId) {
        res = await updateIPDPrescription(editPrescriptionId, payload);
      } else {
        res = await createIPDPrescription(payload);
      }

      if (res.success) {
        toast.success(editPrescriptionId ? "Prescription updated!" : "Prescription saved!");
        onClose();
      } else {
        toast.error(res.error || "Failed to save prescription");
      }
    } catch {
      toast.error("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };


  const handlePrint = () => window.print();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="fixed inset-0 border border-dialog bg-dialog-surface flex flex-col">

        {/* HEADER */}
        <div className="bg-dialog-header border-b border-dialog px-6 py-4 flex items-center justify-between">
          <h1 className="flex flex-row flex-warp gap-2 items-center text-2xl font-semibold"><Pill className="bg-dialog-header text-dialog-icon" />Prescription</h1>
          <div className="flex items-center gap-3">
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="flex-1 w-[240px] bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" >
                <SelectValue placeholder="Prescribed By" />
              </SelectTrigger>
              <SelectContent className="select-dialog-content">
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} className="select-dialog-item">
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
          </div>
        </div>

        {/* BODY */}
        {editPrescriptionId && isEditLoading ? (
        /* 🔄 Loader */
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading prescription...
            </p>
          </div>
        </div>
          ) : (<div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-dialog-surface text-dialog">
              <Symptoms value={formData.symptoms} onChange={handleSymptomsChange} />
              <MedicineSection key={editPrescriptionId ?? "add"} value={medicines} onChange={setMedicines} />
              {/* Attachments */}
              <Card className="border border-dialog bg-dialog-surface rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Attachments</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Input
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    className="bg-dialog-input border-dialog-input"
                  />

                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm px-3 py-2 rounded-md border bg-muted/40"
                        >
                          <span className="truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No attachments added
                    </p>
                  )}
                </CardContent>
              </Card>
              <NotesSection value={notes} onChange={setNotes} />
            </div>)}

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-dialog-header border-t border-dialog text-dialog-muted sticky bottom-0">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
