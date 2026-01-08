"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Vitals from "@/Components/prescriptionPad/Vitals";
import Symptoms from "@/Components/prescriptionPad/Symtoms";
import DiagnosisSection from "@/Components/prescriptionPad/DiagnosisSection";
import MedicineSection from "@/Components/prescriptionPad/MedicineSection";
import NotesSection from "@/Components/prescriptionPad/NotesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import LabTestsEditor from "../prescriptionPad/LabTests";
import { SymptomItem } from "@/Components/prescriptionPad/Symtoms";
import { getSymptoms } from "@/lib/actions/symptomActions";

export type MasterSymptom = {
  id: string;
  name: string;
  description: string;
  symptomTypeName: string;
};

function PrescriptionForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [masterSymptoms, setMasterSymptoms] = useState<MasterSymptom[]>([]);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const patientId = params?.id as string;
  const appointmentId = searchParams.get("appointmentId");
  const patientName = searchParams.get("name");
  const mode = searchParams.get("mode"); // "edit" or "new"
  const isEditMode = mode === "edit";
  const [pageLoading, setPageLoading] = useState(true); // 👈 page level loader
  const [loading, setLoading] = useState(false);
  const [symptomsLoaded, setSymptomsLoaded] = useState(false);
  const [prescriptionLoaded, setPrescriptionLoaded] = useState(!isEditMode);

  const [formData, setFormData] = useState({
    prescriptionId: "",
    vitals: {} as Record<string, any>,
    symptoms: [] as SymptomItem[],
    diagnosis: [] as string[],
    medicines: [] as any[],
    notes: "",
  });

  useEffect(() => {
    if (masterSymptoms.length === 0) return;

    if (isEditMode && !prescriptionData) return;

    setPageLoading(false);
  }, [masterSymptoms, prescriptionData, isEditMode]);
    useEffect(() => {
    if (symptomsLoaded && prescriptionLoaded) {
      setPageLoading(false);
    }
  }, [symptomsLoaded, prescriptionLoaded]);

  useEffect(() => {
    const loadSymptoms = async () => {
    try {
      const res = await getSymptoms();

        if ("data" in res && Array.isArray(res.data)) {
          setMasterSymptoms(
            res.data.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description ?? "No description added",
              symptomTypeName: s.symptomTypeName ?? "Unknown",
            }))
          );
        }
        }finally {
          setSymptomsLoaded(true);
        }
    };

    loadSymptoms();
  }, []);

  const mapSymptomsFromPrescription = (
    symptomsString: string | null,
    masterSymptoms: MasterSymptom[]
  ) => {
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

  useEffect(() => {
    if (!prescriptionData || masterSymptoms.length === 0) return;

    setFormData({
      prescriptionId: prescriptionData.id || "",
      vitals: prescriptionData.vitals || {},
      symptoms: mapSymptomsFromPrescription(
        prescriptionData.symptoms,
        masterSymptoms
      ),
      diagnosis: prescriptionData.diagnosis
        ? prescriptionData.diagnosis.split(",").map((d: string) => d.trim())
        : [],
      medicines: prescriptionData.medicines || [],
      notes: prescriptionData.additionalNotes || "",
    });
  }, [prescriptionData, masterSymptoms]);



  useEffect(() => {
    const fetchPrescription = async () => {
      if (!isEditMode || !appointmentId) {
        setPrescriptionLoaded(true);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/prescriptions/appointmentByDcotor?appointmentId=${appointmentId}`
        );
        const result = await response.json();

        if (response.ok && result.success && result.data?.length > 0) {
          const data = result.data[0];
          setPrescriptionData(result.data[0]);
        } else {
          toast.warning("No prescription data found for this appointment.");
        }
      } catch (err) {
        console.error("Error fetching prescription:", err);
        toast.error("Failed to fetch prescription data.");
      } finally {
        setLoading(false);
        setPrescriptionLoaded(true); 
      }
    };

    fetchPrescription();
  }, [isEditMode, appointmentId]);

    const [labTests, setLabTests] = useState<{name:string,description?:string}[]>([]);

  const handleVitalsChange = (newVitals: Record<string, any>) =>
    setFormData((prev) => ({ ...prev, vitals: newVitals }));

  const handleDiagnosisChange = (data: Record<string, any>) =>
    setFormData((prev) => ({ ...prev, diagnosis: data.diagnosis }));

  const handleMedicineChange = (meds: any[]) =>
    setFormData((prev) => ({ ...prev, medicines: meds }));

  const handleNotesChange = (notes: string) =>
    setFormData((prev) => ({ ...prev, notes }));

  const handleSymptomsChange = (data: Record<string, any>) =>
    setFormData((prev) => ({ ...prev, symptoms: data.symptoms }));

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!appointmentId) return toast.error("Appointment ID missing!");
      if (!patientId) return toast.error("Patient ID missing!");
      if (formData.diagnosis.length === 0)
        return toast.error("Add at least one diagnosis!");
      if (formData.medicines.length === 0)
        return toast.error("Add at least one medicine!");

      const payload: any = {
        appointmentId,
        patientId,
        vitals: formData.vitals || null,
        diagnosis: formData.diagnosis.join(", "),
        symptoms: formData.symptoms.map(s => s.name).join(", ") || null,
        medicines: formData.medicines,
        additionalNotes: formData.notes || null,
      };
      
      if (isEditMode) {
        payload.prescriptionId = formData.prescriptionId;
      }

      const response = await fetch("/api/prescriptions", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          isEditMode
            ? "Prescription updated successfully!"
            : "Prescription saved successfully!"
        );
        setTimeout(() => router.push("/doctor/appointment"), 1500);
      } else {
        toast.error(result.error || "Failed to save prescription");
      }
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  // 🟢 Render form
  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-6">
      <Card className="w-full shadow-lg border border-dialog bg-dialog-surface">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {isEditMode ? "Edit Prescription" : "New Prescription"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            For patient:{" "}
            <span className="font-medium text-primary">
              {patientName || "Patient"}
            </span>
          </p>
        </CardHeader>

        <CardContent className="space-y-8 py-6">
          <Vitals value={formData.vitals} onChange={handleVitalsChange} />
          <Symptoms
            value={formData.symptoms} // already full objects
            onChange={(newSymptoms) =>
              setFormData(prev => ({ ...prev, symptoms: newSymptoms }))
            }
          />

          <DiagnosisSection value={{ diagnosis: formData.diagnosis }} onChange={handleDiagnosisChange} />
          <MedicineSection value={formData.medicines} onChange={handleMedicineChange} />
          <NotesSection value={formData.notes} onChange={handleNotesChange} />
          {/* <LabTestsEditor
              value={labTests}
              onChange={(next) => setLabTests(next)}
            /> */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PrescriptionForm;
