"use client";

import React, { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import PatientMedicialHistroy from "@/Components/doctor/patient/patientProfile/PatientMedicialHistroy";
import PrescriptionForm from "@/Components/forms/PrescriptionForm";
import BackButton from "@/Components/BackButton";
import { getShortId } from "@/utils/getShortId";

export default function VisitPatientPage() {
  const [activeTab, setActiveTab] = useState("Prescription");

  const params = useParams();
  const { id } = params;

  console.log("patient Id", id);

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  return (
    <div>
      <BackButton />
      <nav className="flex justify-between items-center mt-4  p-5 border-b border-gray-300">
        <div>
          {/* <h2 className="text-sm font-semibold">
            Patient: {name || "Unknown"}
          </h2>
          <p className="text-sm text-gray-600">ID: {id}</p> */}
          <p className="text-sm text-muted-foreground">
            Patient ID:{" "}
            <span className="font-medium text-primary">
              {Array.isArray(id) ? getShortId(id[0]) : id ? getShortId(id) : "Patient Id"}
            </span>
          </p>

        </div>

        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("Prescription")}
            className={`px-4 py-2 font-semibold rounded ${
              activeTab === "Prescription"
              ? "border-b-2 border-blue-500"
              : "text-gray-600"
              }`}
          >
            Prescription
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-semibold rounded ${
              activeTab === "history"
              ? "border-b-2 border-blue-500"
              : "text-gray-600"
              }`}
          >
            Medical History
          </button>


        </div>
      </nav>

      <main className="p-5">
        {activeTab === "history" && <PatientMedicialHistroy />}
        {activeTab === "Prescription" && <PrescriptionForm />}
      </main>
    </div>
  );
}
