"use client";

import { useState } from "react";
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

  const patientId = params?.id as string; // This is the patient ID from the URL
  const appointmentId = searchParams.get("appointmentId"); // Get appointment ID from query params
  const patientName = searchParams.get("name");

  const [formData, setFormData] = useState({
    vitals: {} as Record<string, any>,
    symptoms: [] as string[],
    diagnosis: [] as string[],
    medicines: [] as any[],
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleVitalsChange = (newVitals: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, vitals: newVitals }));
    // console.log("Vitals",formData.vitals)
  };

  const handleDiagnosisChange = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, diagnosis: data.diagnosis }));
  };

  const handleMedicineChange = (meds: any[]) => {
    setFormData((prev) => ({ ...prev, medicines: meds }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!appointmentId) {
        toast.error("Appointment ID is missing. Please access this page from the appointment list.");
        return;
      }

      if (!patientId) {
        toast.error("Patient ID is missing.");
        return;
      }

      if (formData.diagnosis.length === 0) {
        toast.error("Please add at least one diagnosis.");
        return;
      }

      if (formData.medicines.length === 0) {
        toast.error("Please add at least one medicine.");
        return;
      }

      // Prepare prescription data
      const prescriptionData = {
        appointmentId,
        patientId,
        vitals: formData.vitals || null,
        diagnosis: formData.diagnosis.join(", "), // Convert array to comma-separated string
        symptoms: formData.symptoms.join(", ") || null, // Convert array to comma-separated string
        medicines: formData.medicines, // Array of medicine objects
        labTests: null, // Can be added later if needed
        followUpRequired: false, // Can be made dynamic
        followUpDate: null,
        followUpNotes: null,
        additionalNotes: formData.notes || null,
      };

      console.log("Submitting prescription:", prescriptionData);

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Prescription saved successfully!");
        // Redirect back to appointments page after a short delay
        setTimeout(() => {
          router.push("/doctor/appointment");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to save prescription");
      }
    } catch (err: any) {
      console.error("Error saving prescription:", err);
      toast.error(`Error: ${err.message || "Failed to save prescription"}`);
    } finally {
      setLoading(false);
    }
  };
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
  return (
    <div className="min-h-screen flex justify-center items-center  px-4 py-6">
      <Card className="w-full max-w-5xl shadow-lg border border-border/50">
        <CardHeader >
          <CardTitle className="text-2xl font-semibold">
            Prescription Form
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
            value={{ symptoms: formData.symptoms }}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, symptoms: data.symptoms }))
            }
          />
          <DiagnosisSection
            value={{ diagnosis: formData.diagnosis }}
            onChange={handleDiagnosisChange}
          />
          <MedicineSection onChange={handleMedicineChange} />
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
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PrescriptionForm;
