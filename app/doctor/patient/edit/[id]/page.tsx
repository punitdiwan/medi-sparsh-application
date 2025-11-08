"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PatientEditForm from "@/Components/forms/PatientEditForm";
import { toast } from "sonner";

export default function EditPatientPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch patient");
        }

        setPatientData(result.data);
      } catch (err) {
        console.error("Error fetching patient:", err);
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-lg font-medium animate-pulse">Loading patient data...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-lg font-medium text-red-500">Patient not found</p>
      </div>
    );
  }

  return (
    <PatientEditForm
      patientId={patientId}
      initialData={{
        name: patientData.name,
        email: patientData.email || "",
        gender: patientData.gender,
        dob: patientData.dob || "",
        mobileNumber: patientData.mobileNumber,
        address: patientData.address || "",
        city: patientData.city || "",
        state: patientData.state || "",
        areaOrPin: patientData.areaOrPin || "",
        bloodGroup: patientData.bloodGroup || "",
        referredByDr: patientData.referredByDr || "",
        preferredLanguage: patientData.preferredLanguage || "",
      }}
    />
  );
}