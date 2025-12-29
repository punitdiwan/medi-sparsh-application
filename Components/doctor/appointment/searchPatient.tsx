"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddPatientDialog from "../patient/AddPatientDialog";

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
  is_IPD_Patient?: boolean;
  onSelect: (patient: Patient) => void;
  onAddPatient?: () => void;
};

export default function PatientSearchBox({
  is_IPD_Patient,
  onSelect,
  onAddPatient,
}: PatientSearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientResults, setPatientResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSelectedPatient(null);

    if (debounceTimer) clearTimeout(debounceTimer);

    // added IPD Patient search Typing debounce
    const timer = setTimeout(async () => {
      if (!term.trim()) {
        setPatientResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/patients?is_IPD_Patient=${is_IPD_Patient}&search=${encodeURIComponent(term)}`);
        const data = await res.json();
        setPatientResults(data.success ? data.data || [] : []);
      } catch (error) {
        console.error("Error searching patients:", error);
        setPatientResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setPatientResults([]);
    onSelect(patient);
  };

  return (
    <div className="mb-6 relative">
      <Input
        placeholder="Search patient by name, email, mobile, or ID..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pr-3"
      />

      {loading && (
        <p className="text-sm text-gray-500 mt-1">Searching...</p>
      )}

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

      {!loading && searchTerm.trim() !== "" && patientResults.length === 0 && !selectedPatient && (
        <div className="absolute w-full bg-gray-300 border mt-1 rounded-lg shadow p-4 text-center text-gray-600 z-20">
          <p className="text-sm mb-2">No patients found for "{searchTerm}"</p>
          <AddPatientDialog />
        </div>
      )}
    </div>
  );
}
