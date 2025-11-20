"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Stethoscope, Pill, FileText, Heart, Download } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionPdf from "@/Components/prescriptionPad/PrescriptionPdf";
import calculateAge from "@/utils/ageCalculator";
import { pdf } from "@react-pdf/renderer";

type Setting = {
  key: string;
  value: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};
type PrescriptionDetail = {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientAddress: any;     
  doctorName: string;
  doctorSpecialization: string;
  appointment: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    reason: string | null;
    notes: string | null;
    isFollowUp: boolean;
    previousAppointmentId: string | null;
    scheduledBy: string | null;
    services: Array<any> | null;
  } | null;
  diagnosis: string;
  symptoms: string | null;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  labTests: Array<{
    name: string;
    description?: string;
  }> | null;
  vitals: Record<string, any> | null;
  followUpRequired: boolean;
  followUpDate: string | null;
  followUpNotes: string | null;
  additionalNotes: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    metadata: any | null;
  };
   doctor: {
    name: string;
    specialization: Array<{
      name: string;
    }>;
    qualification: string;
    experience: string;
    consultationFee?: string;
  };
};


export default function PrescriptionDetail() {
  const params = useParams();
  const router = useRouter();
  const prescriptionId = params?.id as string;

  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [Org, setOrg] = useState<boolean>(true);
  const printPDF = async () => {
  if (!prescription) return;

  const blob = await pdf(
    <PrescriptionPdf
      patientName={prescription.patientName}
      patientAge={prescription.patientAge}
      patientGender={prescription.patientGender}
      patientId={prescription.patientId}
      patientAddress={prescription.patientAddress}
      doctorName={prescription.doctor.name}
      doctorSpecialization={prescription.doctor.qualification}
      appointmentDate={prescription.appointment?.appointmentDate}
      appointmentTime={prescription.appointment?.appointmentTime}
      appointmentId={prescription.appointment?.id}
      appointmentStatus={prescription.appointment?.status}
      appointmentReason={prescription.appointment?.reason}
      appointmentNotes={prescription.appointment?.notes}
      isFollowUp={prescription.appointment?.isFollowUp}
      previousAppointmentId={prescription.appointment?.previousAppointmentId}
      diagnosis={prescription.diagnosis}
      symptoms={prescription.symptoms}
      medicines={prescription.medicines}
      labTests={prescription.labTests}
      vitals={prescription.vitals}
      followUpRequired={prescription.followUpRequired}
      followUpDate={prescription.followUpDate}
      followUpNotes={prescription.followUpNotes}
      notes={prescription.additionalNotes || ""}
      prescriptionId={prescription.id}
      organization={prescription.organization}
      orgModeCheck={Org}
      date={new Date(prescription.createdAt).toLocaleDateString()} id={""} createdAt={""} additionalNotes={null}   />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const win = window.open(url);

  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
};
 
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/prescriptions/${prescriptionId}`);
        const result = await response.json();

        if (result.success) {
          const d = result.data;
          const normalized = {
            id: d.id ?? "",
            createdAt: d.createdAt ?? "",
            patientId: d.patientId ?? "",
            patientName: d.patientName ?? "",
            patientGender: d.patientData?.gender ?? "",
            patientAge: calculateAge(d.patientData?.dob),
            patientAddress: d.patientData?.address ?? "",
            doctorName: d.doctorName ?? "",
            doctorSpecialization: d.doctorSpecialization ?? "",
            diagnosis: d.diagnosis ?? "",
            symptoms: d.symptoms ?? "",
            vitals: d.vitals ? { ...d.vitals } : {},
            medicines: (d.medicines || []).map((m: any) => ({
              name: m.name ?? "",
              dosage: m.timing ?? "",          
              frequency: m.frequency ?? "",
              duration: m.duration ?? "",
              instructions: m.instruction ?? ""
            })),
            labTests: (d.labTests || []).map((t: any) => ({
              name: t.name ?? "",
              description: t.description ?? ""
            })),
            followUpRequired: Boolean(d.followUpRequired),
            followUpDate: d.followUpDate ?? null,
            followUpNotes: d.followUpNotes ?? "",
            additionalNotes: d.additionalNotes ?? "",
            appointment: {
              id: d.appointment?.id ?? "",
              appointmentDate: d.appointment?.appointmentDate ?? "",
              appointmentTime: d.appointment?.appointmentTime ?? "",
              status: d.appointment?.status ?? "",
              reason: d.appointment?.reason ?? "",
              notes: d.appointment?.notes ?? "",
              isFollowUp: Boolean(d.appointment?.isFollowUp),
              previousAppointmentId: d.appointment?.previousAppointmentId ?? null,
              scheduledBy: d.appointment?.scheduledBy ?? "",
              services: d.appointment?.services ?? [],
            },
            organization: {
              id: d.organization?.id ?? "",
              name: d.organization?.name ?? "",
              metadata: d.organization?.metadata ?? null
            },
            doctor: {
              name: d.doctorName ?? "",
              specialization: d.doctorDetails?.specialization || [],
              qualification: d.doctorDetails?.qualification ?? "",
              experience: d.doctorDetails?.experience ?? "",
              consultationFee: d.doctorDetails?.consultationFee ?? "",
            },
          };
          setPrescription(normalized);
        } else {
          toast.error(result.error || "Failed to load prescription");
          router.push("/doctor/prescription");
        }
      } catch (error) {
        console.error("Error fetching prescription:", error);
        toast.error("Failed to load prescription");
        router.push("/doctor/prescription");
      } finally {
        setLoading(false);
      }
    };

    if (prescriptionId) {
      fetchPrescription();
    }
  }, [prescriptionId, router]);

  useEffect(() => {
  const checkOrg = async () => {
    try {
      const response = await fetch("/api/settings/phone-validation");
      const data = await response.json();
      if (!data.success) {
        toast.error("Failed to load settings");
        return;
      }

      const map: Record<string, Setting> = {};
      data.data.forEach((s: Setting) => {
        map[s.key] = s;
      });

      const orgMode = map["organization_mode_check"]?.value;

      if (orgMode !== undefined) {
        const isHospital = orgMode === "true";
        setOrg(isHospital);

        console.log("Organization Mode:", isHospital ? "Hospital" : "Clinic");
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  checkOrg();
}, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading prescription...</p>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Prescription not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {prescription && (
          <PDFDownloadLink
            document={
              <PrescriptionPdf
                patientName={prescription.patientName}
                patientAge={prescription.patientAge}
                patientGender={prescription.patientGender}
                patientId={prescription.patientId}
                patientAddress={prescription.patientAddress}
                doctorName={prescription.doctor.name}
                doctorSpecialization={prescription.doctor.qualification}
                appointmentDate={prescription.appointment?.appointmentDate}
                appointmentTime={prescription.appointment?.appointmentTime}
                appointmentId={prescription.appointment?.id}
                appointmentStatus={prescription.appointment?.status}
                appointmentReason={prescription.appointment?.reason}
                appointmentNotes={prescription.appointment?.notes}
                isFollowUp={prescription.appointment?.isFollowUp}
                previousAppointmentId={prescription.appointment?.previousAppointmentId}
                diagnosis={prescription.diagnosis}
                symptoms={prescription.symptoms}
                medicines={prescription.medicines}
                labTests={prescription.labTests}
                vitals={prescription.vitals}
                followUpRequired={prescription.followUpRequired}
                followUpDate={prescription.followUpDate}
                followUpNotes={prescription.followUpNotes}
                notes={prescription.additionalNotes || ""}
                prescriptionId={prescription.id}
                organization={prescription.organization}
                orgModeCheck={Org}
                date={new Date(prescription.createdAt).toLocaleDateString()} id={""} createdAt={""} additionalNotes={null}              />

            }
            fileName={`prescription_${prescription.patientName.replace(/ /g, "_")}_${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g, "-")}.pdf`}
          >
            {({ blob, url, loading, error }) => (
              <Button className="mb-4 ml-2" disabled={loading}>
                {loading ? "Loading document..." : "Download PDF"}
                <Download className="ml-2 h-4 w-4" />
              </Button>
            )}
          </PDFDownloadLink>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Prescription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{prescription.patientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{prescription.doctorName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diagnosis
              </h3>
              <p className="text-muted-foreground">{prescription.diagnosis}</p>
            </div>

            {/* Vitals */}
            {prescription.vitals && Object.keys(prescription.vitals).length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Vitals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(prescription.vitals).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <Card key={key} className="bg-muted/50">
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground mb-1">{label}</p>
                          <p className="font-medium text-sm">{value}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Symptoms */}
            {prescription.symptoms && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Symptoms</h3>
                <p className="text-muted-foreground">{prescription.symptoms}</p>
              </div>
            )}

            {/* Medicines */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medicines
              </h3>
              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medicine.dosage}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">Frequency:</span>{" "}
                            {medicine.frequency}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Duration:</span>{" "}
                            {medicine.duration}
                          </p>
                        </div>
                        {medicine.instructions && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              {medicine.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Lab Tests */}
            {prescription.labTests && prescription.labTests.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Lab Tests</h3>
                <div className="space-y-2">
                  {prescription.labTests.map((test, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-3">
                        <p className="font-medium">{test.name}</p>
                        {test.description && (
                          <p className="text-sm text-muted-foreground">
                            {test.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {prescription.followUpRequired && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Follow-up</h3>
                {prescription.followUpDate && (
                  <p className="text-sm">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(prescription.followUpDate).toLocaleDateString()}
                  </p>
                )}
                {prescription.followUpNotes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {prescription.followUpNotes}
                  </p>
                )}
              </div>
            )}

            {/* Additional Notes */}
            {prescription.additionalNotes && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="text-muted-foreground">
                  {prescription.additionalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={printPDF}>
            Print PDF
          </Button>

        </div>
      </div>
      
    </div>
  );
}
