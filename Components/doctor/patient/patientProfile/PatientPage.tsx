"use client";
import React, { useState } from "react";
import Profile from "@/Components/doctor/patient/patientProfile/Profile";
import PatientMedicialHistroy from "@/Components/doctor/patient/patientProfile/PatientMedicialHistroy";
import { useSearchParams, useParams } from "next/navigation";
import BackButton from "@/Components/BackButton";

import {
  User,
  ClipboardList,
  FileText,
  HeartPulse,
} from "lucide-react";

function PatientPage() {
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");

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
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-foreground">
              {name || "Unknown Patient"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Patient ID: <span className="font-medium">{id}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeTab === "details"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700"
              }
            `}
          >
            <User className="h-4 w-4" />
            Details
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeTab === "history"
                  ? "bg-green-600 text-white shadow"
                  : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
              }
            `}
          >
            <ClipboardList className="h-4 w-4" />
            History
          </button>
        </div>
      </nav>

      <div className="px-6 py-3 bg-muted/40 border-b">
        {activeTab === "details" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-blue-600" />
            View personal information, contact details, and basic patient profile.
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-green-600" />
            Review medical history, diagnoses, prescriptions, and past visits.
          </div>
        )}
      </div>

      <main >
        {activeTab === "details" && (
          <div className="bg-background">
            <Profile />
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-background mt-2 p-6">
            <PatientMedicialHistroy />
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientPage;
