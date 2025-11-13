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

function PrescriptionForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const patientId = params?.id as string;
  const appointmentId = searchParams.get("appointmentId");
  const patientName = searchParams.get("name");
  const mode = searchParams.get("mode"); // "edit" or "new"
  const isEditMode = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vitals: {} as Record<string, any>,
    symptoms: [] as string[],
    diagnosis: [] as string[],
    medicines: [] as any[],
    notes: "",
  });

  // 🟢 Fetch prescription for edit mode
  useEffect(() => {
    const fetchPrescription = async () => {
      if (!isEditMode || !appointmentId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/prescriptions/appointmentByDcotor?appointmentId=${appointmentId}`
        );
        const result = await response.json();

        if (response.ok && result.success && result.data?.length > 0) {
          const data = result.data[0];
          console.log("Fetched prescription:", data);

          setFormData({
            vitals: data.vitals || {},
            symptoms: data.symptoms
              ? data.symptoms.split(",").map((s: string) => s.trim())
              : [],
            diagnosis: data.diagnosis
              ? data.diagnosis.split(",").map((d: string) => d.trim())
              : [],
            medicines: data.medicines || [],
            notes: data.additionalNotes || "",
          });
        } else {
          toast.warning("No prescription data found for this appointment.");
        }
      } catch (err) {
        console.error("Error fetching prescription:", err);
        toast.error("Failed to fetch prescription data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [isEditMode, appointmentId]);

  // 🟢 Handlers
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

  // 🟢 Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!appointmentId) return toast.error("Appointment ID missing!");
      if (!patientId) return toast.error("Patient ID missing!");
      if (formData.diagnosis.length === 0)
        return toast.error("Add at least one diagnosis!");
      if (formData.medicines.length === 0)
        return toast.error("Add at least one medicine!");

      const payload = {
        appointmentId,
        patientId,
        vitals: formData.vitals || null,
        diagnosis: formData.diagnosis.join(", "),
        symptoms: formData.symptoms.join(", ") || null,
        medicines: formData.medicines,
        additionalNotes: formData.notes || null,
      };

      console.log("Submitting:", payload);

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

  // 🟣 Skeleton while loading
  if (loading) {
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
      <Card className="w-full max-w-5xl shadow-lg border border-border/50">
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
          <Symptoms value={{ symptoms: formData.symptoms }} onChange={handleSymptomsChange} />
          <DiagnosisSection value={{ diagnosis: formData.diagnosis }} onChange={handleDiagnosisChange} />
          <MedicineSection value={formData.medicines} onChange={handleMedicineChange} />
          <NotesSection value={formData.notes} onChange={handleNotesChange} />

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
