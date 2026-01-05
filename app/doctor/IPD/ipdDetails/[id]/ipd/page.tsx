"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


import { useParams } from "next/navigation";
import { getIPDAdmissionDetails } from "@/lib/actions/ipdActions";
import { useEffect, useState } from "react";
import { getShortId } from "@/utils/getShortId";
import { format } from "date-fns";
import { DischargePatientModal } from "@/Components/doctor/ipd/DischargePatientModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaRegHospital } from "react-icons/fa";

const billing = {
  total: 100000,
  paid: 65000,
};

const sections = [
  "Medication",
  "Prescription",
  "Consultant Register",
  "Lab Investigation",
  "Operations",
  "Charges",
  "Payments",
  "Live Consultation",
  "Treatment History",
  "Bed History",
];

const departmentBilling = [
  {
    name: "IPD Charges",
    total: 40000,
    paid: 30000,
  },
  {
    name: "Pharmacy",
    total: 18000,
    paid: 12000,
  },
  {
    name: "Lab",
    total: 12000,
    paid: 8000,
  },
  {
    name: "Blood Bank",
    total: 8000,
    paid: 4000,
  },
  {
    name: "Ambulance",
    total: 5000,
    paid: 5000,
  },
];


export default function IPDOverviewPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDischarge, setOpenDischarge] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (params?.id) {
        const result = await getIPDAdmissionDetails(params.id as string);
        if (result.data) {
          setData(result.data);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [params?.id]);

  const pending = billing.total - billing.paid;
  const progress = Math.round((billing.paid / billing.total) * 100);

  const totalAmount = departmentBilling.reduce(
    (sum, dept) => sum + dept.total,
    0
  );

  const totalPaid = departmentBilling.reduce(
    (sum, dept) => sum + dept.paid,
    0
  );

  const totalPending = totalAmount - totalPaid;

  const overallPercentage = totalAmount
    ? Math.round((totalPaid / totalAmount) * 100)
    : 0;

  if (loading) {
    return <div className="p-6">Loading details...</div>;
  }

  if (!data) {
    return <div className="p-6">Admission details not found.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 ">

      {/* ================= LEFT PANEL ================= */}
      <div className="lg:col-span-4 space-y-6">

        {/* PATIENT CARD */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-indigo-400">
              <AvatarFallback className="bg-indigo-600 text-overview-base">
                {data.patientName ? data.patientName.substring(0, 2).toUpperCase() : "PT"}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full gap-2">
              <div>
                <h3 className="font-semibold text-lg text-overview-base ">
                  {data.patientName}
                </h3>
                <p className="text-sm text-overview-muted">
                  {getShortId(data.ipdNo)} • {data.gender} • {data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() + "Y" : "N/A"}
                </p>
              </div>
              <div className="ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOpenDischarge(true)}
                        className="h-9 w-9"
                      >
                        <FaRegHospital className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>Discharge Patient</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DischargePatientModal
                  open={openDischarge}
                  onClose={() => setOpenDischarge(false)}
                  onSubmit={(data) => { }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-slate-700">
            <p className="text-overview-muted"><b className="text-overview-base">Bed:</b> {data.bedName}</p>
            <p className="text-overview-muted"><b className="text-overview-base">Doctor:</b> {data.doctorName}</p>
            <p className="text-overview-muted"><b className="text-overview-base">Admission Date:</b> {data.admissionDate ? format(new Date(data.admissionDate), "dd-MM-yyyy") : "N/A"}</p>

            <Badge className="bg-overview-activ-btn text-success border text-white dark:text-white/90 border-emerald-400">
              Active
            </Badge>
          </CardContent>
        </Card>

        {/* BILLING STATUS */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Billing Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Progress
              value={overallPercentage}
              className="h-2"
              color="bg-emerald-600 "
            />

            <div className="flex justify-between text-sm">
              <span className="text-overview-success">Paid</span>
              <span className="font-semibold text-overview-success">
                ₹{totalPaid}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-black dark:text-white">Total</span>
              <span className="font-medium ">
                ₹{totalAmount}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-overview-warning">Pending</span>
              <span className="font-semibold text-overview-warning">
                ₹{totalPending}
              </span>
            </div>

            {overallPercentage === 100 ? (
              <Badge className="bg-emerald-600 text-overview-success">
                Fully Paid
              </Badge>
            ) : overallPercentage >= 50 ? (
              <Badge className=" border border-overview-base bg-white dark:bg-amber-600 text-amber-600 dark:text-white">
                Partially Paid
              </Badge>
            ) : (
              <Badge className="bg-rose-600 text-overview-danger">
                Payment Due
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* VITALS */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Current Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-overview-base shadow-md p-2 rounded">BP: 120/80</div>
            <div className="border border-overview-base shadow-md p-2 rounded">Pulse: 78</div>
            <div className="border border-overview-base shadow-md p-2 rounded">Temp: 98.6°F</div>
            <div className="border border-overview-base shadow-md p-2 rounded">SpO₂: 98%</div>
          </CardContent>
        </Card>

        {/* SYMPTOMS */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex flex-row flex-wrap gap-2">
              <Badge variant="outline" className="bg-bill-card">Fever</Badge>
              <Badge variant="outline" className="bg-bill-card">Chest Pain</Badge>
              <Badge variant="outline" className="bg-bill-card">Breathlessness</Badge>
            </div>
          </CardContent>
        </Card>

        {/* DOCTORS */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Doctors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Dr. Amit Sharma <span className="text-muted-foreground">(Physician)</span></p>
            <p>Dr. Neha Gupta <span className="text-muted-foreground">(Cardiology)</span></p>
          </CardContent>
        </Card>

        {/* NURSE NOTES */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Nurse Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Patient stable, medication administered on time.
          </CardContent>
        </Card>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="lg:col-span-8 space-y-8">

        {/* DEPARTMENT BILLING */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Department Wise Billing
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentBilling.map((dept) => {
                const remaining = dept.total - dept.paid;
                const percentage = Math.round((dept.paid / dept.total) * 100);

                return (
                  <div
                    key={dept.name}
                    className="rounded-xl border-overview-strong bg-bill-card shadow-md p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-label">
                        {dept.name}
                      </h4>
                      <span className="text-sm font-semibold text-label">
                        {percentage}%
                      </span>
                    </div>

                    <Progress value={percentage} className="h-2" color={percentage === 100 ? "bg-emerald-600" : "bg-overview-bar"} />

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Paid: ₹{dept.paid}
                      </span>
                      <span
                        className={
                          remaining === 0
                            ? "text-emerald-600 font-medium"
                            : "text-rose-600 font-medium"
                        }
                      >
                        Remaining: ₹{remaining}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* TIMELINE SECTIONS */}
        {sections.map((section) => (
          <div key={section}>
            <h3 className="text-lg font-semibold text-label mb-2">
              {section}
            </h3>
            <Separator className="mb-4" />
            <Card className="bg-overview-card border-overview-strong">
              <CardContent className="py-4 text-sm text-muted-foreground">
                No records available
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}


