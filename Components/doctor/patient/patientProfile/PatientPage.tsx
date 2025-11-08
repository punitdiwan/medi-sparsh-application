"use client";
import React, { useState } from "react";
import Profile from "@/Components/doctor/patient/patientProfile/Profile";
import PatientMedicialHistroy from "@/Components/doctor/patient/patientProfile/PatientMedicialHistroy"
import { useSearchParams, useParams, useRouter } from "next/navigation";

import BackButton from "@/Components/BackButton";

function PatientPage() {
  const [activeTab, setActiveTab] = useState("details");
   const router = useRouter();
  // ✅ Get patient ID from route params
    const params = useParams();
    const { id } = params;
  
    // ✅ Get patient name from query string (?name=John)
    const searchParams = useSearchParams();
    const name = searchParams.get("name");

  return (
    <div>
      <nav className="flex justify-around items-center p-5 border-b border-gray-300">
        <BackButton/>
        <div>
          <h2 className="text-sm font-semibold">
            Patient: {name || "Unknown"}
          </h2>
          <p className="text-sm text-gray-600">ID: {id}</p>
        </div>

        <div className="flex space-x-6">
         <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "details"
              ? " border-b-2"
              : "text-gray-600"
          }`}
          aria-current={activeTab === "details" ? "page" : undefined}
        >
          Patient Details
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "history"
              ? " border-b-2"
              : "text-gray-600"
          }`}
          aria-current={activeTab === "history" ? "page" : undefined}
        >
          Medical History
        </button>
       </div>
        
      </nav>

      <main className="p-5">
        {activeTab === "details" && (
          <div>
           <Profile />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <PatientMedicialHistroy />
          </div>
        )}


  
      </main>
    </div>
  );
}

export default PatientPage;
