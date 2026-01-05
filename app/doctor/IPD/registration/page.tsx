import IPDAdmissionPage from "@/Components/doctor/ipd/registrationModel"
import { getSymptomTypes } from "@/lib/actions/symptomTypes";
import { getSymptoms } from "@/lib/actions/symptomActions";
import { getDoctors } from "@/lib/actions/doctorActions";
import { getBedGroups, getBeds } from "@/lib/actions/bedActions";
import { getAppointmentDetails } from "@/lib/actions/appointmentActions";

export const dynamic = "force-dynamic";

const page = async ({ searchParams }: { searchParams: Promise<{ opdId?: string }> }) => {
  const resolvedSearchParams = await searchParams;
  const { data: symptomTypes } = await getSymptomTypes();
  const { data: symptoms } = await getSymptoms();
  const { data: doctors } = await getDoctors();
  const { data: bedGroups } = await getBedGroups();
  const { data: beds } = await getBeds();

  let appointment = null;
  if (resolvedSearchParams.opdId) {
    const { data } = await getAppointmentDetails(resolvedSearchParams.opdId);
    appointment = data;
  }

  return (
    <>
      <IPDAdmissionPage
        symptomTypes={symptomTypes || []}
        symptomsList={symptoms || []}
        doctors={doctors || []}
        bedGroups={bedGroups || []}
        beds={beds?.map(bed => ({ ...bed, isOccupied: bed.isOccupied ?? false })) || []}
        appointmentData={appointment}
        opdId={resolvedSearchParams.opdId}
      />
    </>
  )
}

export default page
