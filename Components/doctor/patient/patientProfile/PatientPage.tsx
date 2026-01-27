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
type Tab = "details" | "history" | "trends" | "alerts";

function PatientPage() {
  const [activeTab, setActiveTab] = useState<Tab>("details");

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
          <div className="flex items-center gap-3">
            <HeartPulse className="h-5 w-5 text-red-500 dark:text-red-600" />

            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {name || "Unknown Patient"}
            </h2>

            <span className="
    text-xs px-2 py-0.5 rounded-full
    bg-slate-100 text-slate-600 border border-slate-200
    dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700
  ">
              ID: {getShortId(id)}
            </span>
          </div>



          <div className="flex flex-wrap items-center gap-3 px-6 py-2">
            <SummaryCard title="HbA1c" value="7.8%" status="high" />
            <SummaryCard title="FBS" value="142 mg/dL" status="high" />
            <SummaryCard title="Reports" value="18" />
            <SummaryCard title="Last Visit" value="12 Jan 2026" />
          </div>

        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === "details"
                ? "bg-blue-600 text-white shadow cursor-none"
                : "bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
              }
            `}
          >
            <User className="h-4 w-4" />
            Details
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === "history"
                ? "bg-green-600 text-white shadow cursor-none"
                : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700 cursor-pointer"
              }
            `}
          >
            <ClipboardList className="h-4 w-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
    ${activeTab === "trends"
                ? "bg-purple-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-purple-100 hover:text-purple-700"
              }
  `}
          >
            <HeartPulse className="h-4 w-4" />
            Trends
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

        {activeTab === "trends" && (
          <div className="bg-background mt-2 p-6">
            <PatientTrends />
          </div>
        )}

        {/* {activeTab === "alerts" && (
          <div className="p-6 space-y-4">
            <AlertCard
              type="danger"
              title="High HbA1c"
              description="HbA1c consistently above 7% in last 3 reports"
            />

            <AlertCard
              type="warning"
              title="Low Hemoglobin"
              description="Hb dropped from 12.1 → 10.8 in 6 months"
            />
          </div>
        )} */}


      </main>
    </div>
  );
}

export default PatientPage;

import { ArrowUp, ArrowDown, Check } from "lucide-react";
import { getShortId } from "@/utils/getShortId";
import PatientTrends from "./PatientTrends";

interface SummaryCardProps {
  title: string;
  value: string;
  status?: "high" | "low" | "normal";
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  status = "normal",
}) => {
  let textColor = "text-slate-700 dark:text-slate-200";
  let icon = <Check className="h-3.5 w-3.5 text-emerald-500" />;

  if (status === "high") {
    textColor = "text-rose-600 ";
    icon = <ArrowUp className="h-3.5 w-3.5 text-rose-600" />;
  } else if (status === "low") {
    textColor = "text-amber-600 dark:text-amber-400";
    icon = <ArrowDown className="h-3.5 w-3.5 text-amber-500" />;
  }

  return (
    <div
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-700
      "
    >
      {icon}
      <span className="text-slate-500 dark:text-slate-400">
        {title}:
      </span>
      <span className={`font-semibold ${textColor}`}>
        {value}
      </span>
    </div>
  );
};

