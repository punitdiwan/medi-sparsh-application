"use client";

import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";


import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Patient = {
  id: string;
  patient_id: string;
  name: string;
  email: string;
  mobileNumber: string;
};

type PatientSearchResult = {
  id: string;
  patient_id: string;
  name: string;
  mobileNumber: string;
  email: string;
};

type PatientSearchBoxProps = {
  onSelect: (patient: Patient) => void;
  onAddPatient?: () => void;
};

export default function PatientSearchBox({
  onSelect,
  onAddPatient,
}: PatientSearchBoxProps) {
  const route = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPatientSelected, setIsPatientSelected] = useState(false);

  const [patientResults, setPatientResults] = useState<PatientSearchResult[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  let debounceTimer: NodeJS.Timeout;

  const handleSearch = useCallback(async (term: string) => {
    setIsPatientSelected(false);
    setSearchTerm(term);

    if (!term.trim()) {
      setPatientResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(term)}`);
      const result = await response.json();
      
      if (result.success) {
        setPatientResults(result.data || []);
      } else {
        setPatientResults([]);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      setPatientResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setIsPatientSelected(true);
    setSearchTerm(patient.name);
    setPatientResults([]);
    onSelect(patient);
    setTimeout(() => setIsPatientSelected(false), 500);
  };

  return (
    <div className="mb-6 relative">
      <Input
        placeholder="Search patient by name, email, mobile, or ID..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pr-3"
      />

      {loading && <p className="text-sm text-gray-500 mt-1">Searching...</p>}

      {patientResults.length > 0 && (
        <div className="absolute w-full bg-gray-300 border mt-1 rounded-lg shadow z-20 max-h-56 overflow-auto">
          {patientResults.map((p) => (
            <div
              key={p.id}
              className="p-2 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handlePatientSelect(p)}
            >
              <p className="font-medium text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-600 flex flex-col gap-1">
                {p.email || "N/A"}
                <span className="text-gray-500">{p.mobileNumber}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading &&
        searchTerm &&
        patientResults.length === 0 &&
        isPatientSelected && (
          <div className="absolute w-full bg-gray-300 border mt-1 rounded-lg shadow p-4 text-center text-gray-600 z-20">
            <p className="text-sm mb-2">No patients found for "{searchTerm}"</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                route.push("/doctor/patient/registration");
              }}
            >
              Add Patient
            </Button>
          </div>
        )}
    </div>
  );
}
