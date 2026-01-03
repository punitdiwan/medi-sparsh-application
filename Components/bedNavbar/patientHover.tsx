import { PatientInfo } from "./bedNavType";

export function PatientHoverCard({
  patient,
  bedNo,
}: {
  patient: PatientInfo;
  bedNo: string;
}) {
  return (
    <div className="p-4 space-y-1">
      <p className="font-semibold">Bed: {bedNo}</p>
      <p>ID: {patient.patientId}</p>
      <p>Name: {patient.name}</p>
      <p>Gender: {patient.gender}</p>
      <p>Phone: {patient.phone}</p>
      <p>Guardian: {patient.guardianName}</p>
      <p>Admitted: {patient.admissionDate}</p>
      <p>Consultant: {patient.consultant}</p>
    </div>
  );
}
