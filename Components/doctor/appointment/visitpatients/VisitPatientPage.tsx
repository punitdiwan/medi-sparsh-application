"use client";

import React, { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import PatientMedicialHistroy from "@/Components/doctor/patient/patientProfile/PatientMedicialHistroy";
import PrescriptionForm from "@/Components/forms/PrescriptionForm";
import BackButton from "@/Components/BackButton";
import { getShortId } from "@/utils/getShortId";

import {
  FileText,
  ClipboardList,
  HeartPulse,
} from "lucide-react";

export default function VisitPatientPage() {
  const [activeTab, setActiveTab] = useState<"prescription" | "history">(
    "prescription"
  );

  const params = useParams();
  const idParam = params.id;

  const id =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
      ? idParam[0]
      : "";

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  return (
    <div className="min-h-screen mt-6">
      <BackButton />

      {/* ===== HEADER ===== */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        {/* Patient Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-foreground">
              {name || "Unknown Patient"}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Patient ID:{" "}
            <span className="font-medium">
              {id ? getShortId(id) : "N/A"}
            </span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("prescription")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeTab === "prescription"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700"
              }
            `}
          >
            <FileText className="h-4 w-4" />
            Prescription
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeTab === "history"
                  ? "bg-green-600 text-white shadow"
                  : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
              }
            `}
          >
            <ClipboardList className="h-4 w-4" />
            Medical History
          </button>
        </div>
      </nav>

      {/* ===== SUB HEADER DESCRIPTION ===== */}
      <div className="px-6 py-3 bg-muted/40 border-b">
        {activeTab === "prescription" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-blue-600" />
            Create or update the patient’s prescription, medicines and notes.
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-green-600" />
            Review previous visits, diagnoses and prescribed medicines.
          </div>
        )}
      </div>

      {/* ===== CONTENT ===== */}
      <main className="px-6 py-4">
        {activeTab === "prescription" && <PrescriptionForm />}
        {activeTab === "history" && <PatientMedicialHistroy />}
      </main>
    </div>
  );
}
