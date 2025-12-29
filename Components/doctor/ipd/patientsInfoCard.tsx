"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, User, Users, Calendar } from "lucide-react";

type Patient = {
  name: string;
  mobileNumber: string;
  gender: string;
  age?: number | null;
};

interface PatientInfoCardProps {
  patient: Patient;
  title?: string;
}

export function PatientInfoCard({
  patient,
  title = "Patient Details",
}: PatientInfoCardProps) {
  return (
    <Card className="border border-dialog bg-dialog-surface shadow-md dark:bg-dialog-surface">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-dialog dark:text-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <InfoRow
          icon={<User className="h-4 w-4" />}
          label="Name"
          value={patient.name}
          bg="bg-indigo-50 dark:bg-indigo-950/40"
          text="text-indigo-700 dark:text-white"
        />

        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label="Mobile"
          value={patient.mobileNumber}
          bg="bg-emerald-50 dark:bg-emerald-950/40"
          text="text-emerald-700 dark:text-white"
        />

        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="Gender"
          value={patient.gender}
          bg="bg-sky-50 dark:bg-sky-950/40"
          text="text-sky-700 dark:text-white"
        />

        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Age"
          value={patient.age ?? "N/A"}
          bg="bg-amber-50 dark:bg-amber-950/40"
          text="text-amber-700 dark:text-white"
        />
      </CardContent>
    </Card>
  );
}

/* ---------------- Row ---------------- */

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  bg: string;
  text: string;
}

function InfoRow({ icon, label, value, bg, text }: InfoRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-3 py-2
        ${bg} ${text}
        border border-transparent
        dark:border-white/10
      `}
    >
      <span className="opacity-80">{icon}</span>
      <span className="font-medium">{label}:</span>
      <span className="ml-auto text-right font-normal">
        {value}
      </span>
    </div>
  );
}
