"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


import { useParams } from "next/navigation";
import { getIPDConsultations, getIPDAdmissionDetails, getIPDCharges, dischargePatient } from "@/lib/actions/ipdActions";
import { useEffect, useState } from "react";
import { getShortId } from "@/utils/getShortId";
import { format } from "date-fns";
import { DischargePatientModal } from "@/Components/doctor/ipd/DischargePatientModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaRegHospital } from "react-icons/fa";
import { getIPDVitals } from "@/lib/actions/ipdVitals";
import { getIPDMedications } from "@/app/actions/ipdMedicationActions";
import { getIPDPrescriptions } from "@/app/actions/ipdPrescriptionActions";
import { getIPDOperations } from "@/lib/actions/operations";
import { getIPDPayments, getIPDPaymentSummary } from "@/app/actions/ipdPaymentActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BillingCreditCard } from "@/Components/doctor/ipd/BillingCard";
import { BillingSingleSummaryCard } from "@/Components/doctor/ipd/BillingOverviewCard";

const sections = [
  "Medication",
  "Prescription",
  // "Consultant Register",
  // "Lab Investigation",
  "Operations",
  "Charges",
  "Payments",
  // "Live Consultation",
  // "Treatment History",
  // "Bed History",
];

export default function IPDOverviewPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDischarge, setOpenDischarge] = useState(false);

  // Dynamic Data State
  const [charges, setCharges] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (params?.id) {
        const id = params.id as string;
        const [
          admissionRes,
          chargesRes,
          medicationsRes,
          prescriptionsRes,
          operationsRes,
          paymentsRes,
          paymentSummaryRes,
          vitalsRes,
          consultationsRes
        ] = await Promise.all([
          getIPDAdmissionDetails(id),
          getIPDCharges(id),
          getIPDMedications(id),
          getIPDPrescriptions(id),
          getIPDOperations(id),
          getIPDPayments(id),
          getIPDPaymentSummary(id),
          getIPDVitals(id),
          getIPDConsultations(id)
        ]);

        if (admissionRes.data) setData(admissionRes.data);
        if (chargesRes.data) setCharges(chargesRes.data);
        if (medicationsRes.data) setMedications(medicationsRes.data);
        if (prescriptionsRes.data) setPrescriptions(prescriptionsRes.data);
        if (operationsRes.data) setOperations(operationsRes.data);
        if (paymentsRes.data) setPayments(paymentsRes.data);
        if (paymentSummaryRes.data) setPaymentSummary(paymentSummaryRes.data);
        if (vitalsRes.data) setVitals(vitalsRes.data);
        if (consultationsRes.data) setConsultations(consultationsRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [params?.id]);

  // Extract symptoms from prescriptions
  const allSymptoms = Array.from(new Set(
    prescriptions
      .map(p => p.findings)
      .filter(f => f && f.trim() !== "")
      .flatMap(f => f.split(",").map((s: string) => s.trim()))
  ));

  // Extract unique doctors
  const doctorsSet = new Set<string>();
  if (data?.doctorName) doctorsSet.add(data.doctorName);
  prescriptions.forEach(p => { if (p.doctorName) doctorsSet.add(p.doctorName); });
  consultations.forEach(c => { if (c.consultantDoctorName) doctorsSet.add(c.consultantDoctorName); });
  const allDoctors = Array.from(doctorsSet);

  // Extract latest vitals
  const latestVitalsMap = new Map();
  vitals.forEach((record: any) => {
    record.vitals.forEach((v: any) => {
      if (!latestVitalsMap.has(v.vitalName)) {
        latestVitalsMap.set(v.vitalName, v);
      } else {
        // Compare dates/times if needed, but they are ordered by createdAt desc
        // so the first one we encounter for a name is the latest.
      }
    });
  });

  const latestVitals = Array.from(latestVitalsMap.values());

  const totalAmount = paymentSummary?.totalCharges || 0;
  const totalPaid = paymentSummary?.totalPaid || 0;
  const totalPending = paymentSummary?.balance || 0;

  const totalCredit = paymentSummary?.IpdCreditLimit + paymentSummary?.usedCredit || 0;
  const creditUsed = paymentSummary?.usedCredit ||0;
  
  const overallPercentage = totalAmount
    ? Math.round((totalPaid / totalAmount) * 100)
    : 0;

  const departmentBilling = [
    {
      name: "IPD Charges",
      total: totalAmount,
      paid: totalPaid, // This is a bit simplified as payments aren't split by dept in summary
    },
    {
      name: "Pharmacy",
      total: 0,
      paid: 0,
    },
    {
      name: "Lab",
      total: 0,
      paid: 0,
    },
  ];

  if (loading) {
    return <div className="p-6">Loading details...</div>;
  }

  if (!data) {
    return <div className="p-6">Admission details not found.</div>;
  }

  const renderSectionContent = (section: string) => {
    switch (section) {
      case "Charges":
        if (charges.length === 0) return <p className="text-sm text-muted-foreground">No records available</p>;
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Charge Name</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.slice(0, 5).map((c) => {
                const amount = Number(c.totalAmount);
                const tax = Number(c.taxPercent);
                const discount = Number(c.discountPercent);
                const net = amount + (amount * tax) / 100 - (amount * discount) / 100;
                return (
                  <TableRow key={c.id}>
                    <TableCell>{format(new Date(c.createdAt), "dd-MM-yyyy")}</TableCell>
                    <TableCell>{c.chargeName}</TableCell>
                    <TableCell>{c.qty}</TableCell>
                    <TableCell className="text-right">₹{net.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
              {charges.length > 5 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground">
                    + {charges.length - 5} more records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        );

      case "Medication":
        if (medications.length === 0) return <p className="text-sm text-muted-foreground">No records available</p>;
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Doses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.slice(0, 5).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{format(new Date(m.date), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{m.medicineName}</TableCell>
                  <TableCell>
                    {m.dose?.map((d: any) => `${d.time} (${d.dosage})`).join(", ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "Prescription":
        if (prescriptions.length === 0) return <p className="text-sm text-muted-foreground">No records available</p>;
        return (
          <div className="space-y-4">
            {prescriptions.slice(0, 3).map((p) => (
              <div key={p.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{format(new Date(p.date), "dd-MM-yyyy")}</span>
                  <span className="text-xs text-muted-foreground">By {p.doctorName}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.notes}</p>
              </div>
            ))}
          </div>
        );

      case "Operations":
        if (operations.length === 0) return <p className="text-sm text-muted-foreground">No records available</p>;
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.slice(0, 5).map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{format(new Date(o.operationDate), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{o.operationName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Completed</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "Payments":
        if (payments.length === 0) return <p className="text-sm text-muted-foreground">No records available</p>;
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 5).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{format(new Date(p.paymentDate), "dd-MM-yyyy")}</TableCell>
                  <TableCell>{p.paymentMode}</TableCell>
                  <TableCell className="text-right">₹{Number(p.paymentAmount).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return <p className="text-sm text-muted-foreground">No records available</p>;
    }
  };

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
                      <span className="cursor-not-allowed">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setOpenDischarge(true)}
                          className="h-9 w-9"
                          disabled={paymentSummary?.payable > 0 || data.dischargeStatus !== "pending"}
                        >
                          <FaRegHospital className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>
                        {data.dischargeStatus !== "pending"
                          ? "Patient already discharged"
                          : paymentSummary?.payable > 0
                            ? `Cannot discharge: Pending balance ₹${paymentSummary?.payable}`
                            : "Discharge Patient"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DischargePatientModal
                  open={openDischarge}
                  onClose={() => setOpenDischarge(false)}
                  onSubmit={async (dischargeData) => {
                    if (params?.id) {
                      const res = await dischargePatient(params.id as string, dischargeData);
                      if (res.success) {
                        toast.success("Patient discharged successfully");
                        setOpenDischarge(false);
                        // Refresh data
                        const admissionRes = await getIPDAdmissionDetails(params.id as string);
                        if (admissionRes.data) setData(admissionRes.data);
                      } else {
                        toast.error(res.error || "Failed to discharge patient");
                      }
                    }
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-slate-700">
            <p className="text-overview-muted"><b className="text-overview-base">Bed:</b> {data.bedName}</p>
            <p className="text-overview-muted"><b className="text-overview-base">Doctor:</b> {data.doctorName}</p>
            <p className="text-overview-muted"><b className="text-overview-base">Admission Date:</b> {data.admissionDate ? format(new Date(data.admissionDate), "dd-MM-yyyy") : "N/A"}</p>

            {data.dischargeStatus === "pending" ? (
              <Badge className="bg-overview-activ-btn text-success border text-white dark:text-white/90 border-emerald-400">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-200 text-slate-700 border border-slate-400">
                Discharged ({data.dischargeStatus})
              </Badge>
            )}
          </CardContent>
        </Card>
        <BillingCreditCard creditLimit={totalCredit} used={creditUsed} />

        {/* <Card className="bg-overview-card border-overview-strong">
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
              <span className="text-black dark:text-white">Total</span>
              <span className="font-medium ">
                ₹{totalAmount}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-overview-success">Paid</span>
              <span className="font-semibold text-overview-success">
                ₹{totalPaid}
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
              <Badge className="bg-gray-300 dark:bg-rose-700 text-overview-danger">
                Payment Due
              </Badge>
            )}
          </CardContent>
        </Card> */}

        {/* <BillingSingleSummaryCard
          totalAmount={totalAmount}
          totalPaid={totalPaid}
          // totalPending={totalPending}
          creditLimit={data.creditLimit}
        /> */}

        {/* VITALS */}
        <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Current Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {latestVitals.length > 0 ? (
              latestVitals.map((v: any) => (
                <div key={v.vitalName} className="border border-overview-base shadow-md p-2 rounded">
                  {v.vitalName}: {v.vitalValue} {v.unit}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground col-span-2">No vitals recorded</p>
            )}
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
              {allSymptoms.length > 0 ? (
                allSymptoms.map((s, i) => (
                  <Badge key={i} variant="outline" className="bg-bill-card">{s}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No symptoms recorded</p>
              )}
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
            {allDoctors.length > 0 ? (
              allDoctors.map((d, i) => (
                <p key={i}>{d}</p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No doctors assigned</p>
            )}
          </CardContent>
        </Card>

        {/* NURSE NOTES */}
        {/* <Card className="bg-overview-card border-overview-strong">
          <CardHeader>
            <CardTitle className="text-overview-label">
              Nurse Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Patient stable, medication administered on time.
          </CardContent>
        </Card> */}
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
                const deptPendingBeforeCredit = Math.max(dept.total - dept.paid, 0);
                const creditUsed = Math.min(deptPendingBeforeCredit, data.creditLimit);
                const remaining = Math.max(dept.total - (dept.paid + creditUsed),0);
                const percentage = dept.total? Math.round(((dept.paid + creditUsed) / dept.total) * 100): 0;
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
                        Remaining: ₹{remaining.toFixed(2)}
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
            <Card className="bg-overview-card border-overview-strong max-h-[50vh] overflow-y-auto">
              <CardContent className="py-4">
                {renderSectionContent(section)}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}


