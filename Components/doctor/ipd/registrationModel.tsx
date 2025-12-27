"use client";

import { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatientSearchBox from "../appointment/searchPatient";
import BackButton from "@/Components/BackButton";
import { createIPDAdmission } from "@/lib/actions/ipdActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ---------------- ZOD SCHEMA ----------------
const ipdSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  caseDetails: z.string().optional(),
  casualty: z.enum(["yes", "no"]),
  oldPatient: z.enum(["yes", "no"]),
  creditLimit: z.string().min(1, "Credit limit required"), // keep as string
  reference: z.string().optional(),
  consultantDoctor: z.string().min(1, "Doctor is required"),
  bedGroup: z.string().min(1, "Bed group is required"),
  bedNumber: z.string().min(1, "Bed number is required"),
  liveConsultation: z.enum(["yes", "no"]),
});

type IPDFormValues = z.infer<typeof ipdSchema>;

type SymptomRow = {
  type: string;
  title: string;
  description: string;
};

type Bed = {
  id: string;
  name: string;
  bedGroupId: string;
  isOccupied: boolean;
};

interface IPDAdmissionPageProps {
  symptomTypes: any[];
  symptomsList: any[];
  doctors: any[];
  bedGroups: any[];
  beds: Bed[];
}


export default function IPDAdmissionPage({ symptomTypes, symptomsList, doctors, bedGroups, beds }: IPDAdmissionPageProps) {
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [previousMedicalIssue, setPreviousMedicalIssue] = useState("");
  const router = useRouter();

  const [symptoms, setSymptoms] = useState<SymptomRow[]>([
    { type: "", title: "", description: "" },
  ]);
  const handlePatientSelect = (patient: any) => {
    form.setValue("patientId", patient.id?.toString());
    setSelectedPatient(patient);
  };

  const form = useForm<IPDFormValues>({
    resolver: zodResolver(ipdSchema),
    defaultValues: {
      casualty: "no",
      oldPatient: "no",
      liveConsultation: "no",
    },
  });

  const onBedGroupChange = (value: string) => {
    form.setValue("bedGroup", value);
    form.setValue("bedNumber", ""); // Reset bed number when group changes

    const filteredBeds = beds.filter(b => b.bedGroupId === value);
    setAvailableBeds(filteredBeds);
  };

  const onSubmit: SubmitHandler<IPDFormValues> = async (data) => {
    const payload = {
      ...data,
      creditLimit: Number(data.creditLimit),

      patient: selectedPatient
        ? {
          id: selectedPatient.id,
          name: selectedPatient.name,
        }
        : null,

      symptoms: symptoms
        .filter((s) => s.type && s.title)
        .map((s) => ({
          type: s.type,
          title: s.title,
          description: s.description,
        })),

      notes,
      previousMedicalIssue,
    };

    const result = await createIPDAdmission(payload);

    if (result.success) {
      toast.success("IPD Admission created successfully");
      form.reset();
      setSymptoms([{ type: "", title: "", description: "" }]);
      setSelectedPatient(null);
      setNotes("");
      setPreviousMedicalIssue("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create IPD admission");
    }
  };


  const updateSymptom = (index: number, field: keyof SymptomRow, value: string) => {
    setSymptoms((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addSymptomRow = () => {
    setSymptoms((prev) => [...prev, { type: "", title: "", description: "" }]);
  };

  const removeSymptomRow = (index: number) => {
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
  };
  const cleanedSymptoms = symptoms.filter(
    (s) => s.type && s.title
  );


  const SymptomsSection = (
    <Card className="bg-overview-card border-overview-strong">
      <CardHeader>
        <CardTitle>Symptoms</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {symptoms.map((symptom, index) => {
          // Find all symptoms selected in OTHER rows
          const otherRows = symptoms.filter((_, i) => i !== index);
          const usedSymptomNames = otherRows.map(s => s.title).filter(Boolean);

          // Filter types: Only show types that have at least one UNUSED symptom
          const availableTypes = symptomTypes.filter(type => {
            // If this is the currently selected type for this row, keep it visible
            if (type.name === symptom.type) return true;

            const typeSymptoms = symptomsList.filter(s => s.symptomTypeId === type.id);
            const hasUnusedSymptoms = typeSymptoms.some(s => !usedSymptomNames.includes(s.name));
            return hasUnusedSymptoms;
          });

          const typeId = symptomTypes.find(t => t.name === symptom.type)?.id;

          // Filter titles: Show symptoms of this type that are NOT used in other rows
          const titles = typeId
            ? symptomsList.filter(s => s.symptomTypeId === typeId && !usedSymptomNames.includes(s.name))
            : [];

          return (
            <div
              key={index}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-row gap-4 w-full">
                <div className="flex-1 flex-col gap-1 w-full">
                  <Label>Type</Label>
                  <Select
                    value={symptom.type}
                    onValueChange={(v) => {
                      updateSymptom(index, "type", v);
                      updateSymptom(index, "title", "");
                      updateSymptom(index, "description", "");
                    }}
                  >
                    <SelectTrigger className="w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      {availableTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name} className="select-dialog-item">
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symptom Title */}
                <div className="flex-1 flex-col gap-1 w-full">
                  <Label>Title</Label>
                  <Select
                    value={symptom.title}
                    onValueChange={(v) => {
                      const found = titles.find((t) => t.name === v);
                      updateSymptom(index, "title", v);
                      updateSymptom(index, "description", found?.description || "");
                    }}
                    disabled={!symptom.type}
                  >
                    <SelectTrigger className="w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      {titles.map((t) => (
                        <SelectItem key={t.id} value={t.name} className="select-dialog-item">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Description</Label>
                <Input
                  value={symptom.description}
                  onChange={(e) =>
                    updateSymptom(index, "description", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-1">
                {symptoms.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => removeSymptomRow(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <Button type="button" variant="secondary" onClick={addSymptomRow}>
          + Add Symptom
        </Button>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <Label>Notes</Label>
          <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Previous Medical Issue */}
        <div className="flex flex-col gap-1">
          <Label>Previous Medical Issue</Label>
          <Input placeholder="Enter previous medical issue" value={previousMedicalIssue} onChange={(e) => setPreviousMedicalIssue(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );



  return (
    <div className="p-6 space-y-6 mt-4">
      <BackButton />
      <Card className="bg-Module-header text-white shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3">
          <BackButton />
          <div>
            <CardTitle className="text-3xl font-bold">
              IPD Admission
            </CardTitle>
            <p className="text-sm text-indigo-100">
              Admit patient, assign bed & record symptoms
            </p>
          </div>
        </CardHeader>
      </Card>
      {/* Patient Search */}
      <Card className="bg-overview-card border-overview-strong">
        <CardContent className="flex flex-col gap-1 px-4">
          <Label className="text-lg">Search Patient *</Label>
          <PatientSearchBox onSelect={handlePatientSelect} />
          {!form.watch("patientId") && (
            <p className="text-xs text-muted-foreground">
              Please select patient from list
            </p>
          )}
          {form.formState.errors.patientId && (
            <p className="text-red-500 text-xs">{form.formState.errors.patientId.message}</p>
          )}
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
                <p><span className="font-medium">Mobile:</span> {selectedPatient.mobileNumber}</p>
                <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                <p><span className="font-medium">Age:</span> {selectedPatient.age ?? "N/A"}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a patient to view details
              </p>
            )}
            <div className="lg:col-span-2">
              {SymptomsSection}
            </div>


          </CardContent>
        </Card>

        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle>IPD Admission</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-row gap-4 w-full">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Admission Date *</Label>
                  <Input type="date" {...form.register("admissionDate")} />
                  {form.formState.errors.admissionDate && (
                    <p className="text-red-500 text-xs">{form.formState.errors.admissionDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Case</Label>
                  <Input placeholder="Case details" {...form.register("caseDetails")} />
                </div>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Casualty</Label>
                  <Select onValueChange={(v) => form.setValue("casualty", v as any)}>
                    <SelectTrigger className="flex-1 w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      <SelectItem value="yes" className="select-dialog-item">Yes</SelectItem>
                      <SelectItem value="no" className="select-dialog-item">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <Label>Old Patient</Label>
                  <Select onValueChange={(v) => form.setValue("oldPatient", v as any)}>
                    <SelectTrigger className="flex-1 w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      <SelectItem value="yes" className="select-dialog-item">Yes</SelectItem>
                      <SelectItem value="no" className="select-dialog-item">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Credit Limit *</Label>
                  <Input type="number" {...form.register("creditLimit")} />
                  {form.formState.errors.creditLimit && (
                    <p className="text-red-500 text-xs">{form.formState.errors.creditLimit.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Reference</Label>
                  <Input {...form.register("reference")} />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <Label>Consultant Doctor *</Label>
                <Select onValueChange={(v) => form.setValue("consultantDoctor", v)}>
                  <SelectTrigger className="flex-1 w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue placeholder="Search doctor" />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id} className="select-dialog-item">
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.consultantDoctor && (
                  <p className="text-red-500 text-xs">{form.formState.errors.consultantDoctor.message}</p>
                )}
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Bed Group *</Label>
                  <Select onValueChange={onBedGroupChange}>
                    <SelectTrigger className="flex-1 w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select bed group" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      {bedGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id} className="select-dialog-item">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.bedGroup && (
                    <p className="text-red-500 text-xs">{form.formState.errors.bedGroup.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <Label>Bed Number *</Label>
                  <Select onValueChange={(v) => form.setValue("bedNumber", v)}>
                    <SelectTrigger className="flex-1 w-full bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent className="select-dialog-content">
                      {availableBeds.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="select-dialog-item">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.bedNumber && (
                    <p className="text-red-500 text-xs">{form.formState.errors.bedNumber.message}</p>
                  )}
                </div>
              </div>


              <Button type="submit" className="w-full mt-4 bg-indigo-700 text-white hover:bg-indigo-600">
                Save IPD
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

