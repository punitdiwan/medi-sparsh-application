import IPDAdmissionPage from "@/Components/doctor/ipd/registrationModel"
import { getSymptomTypes } from "@/lib/actions/symptomTypes";
import { getSymptoms } from "@/lib/actions/symptomActions";
import { getDoctors } from "@/lib/actions/doctorActions";
import { getBedGroups, getBeds } from "@/lib/actions/bedActions";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data: symptomTypes } = await getSymptomTypes();
  const { data: symptoms } = await getSymptoms();
  const { data: doctors } = await getDoctors();
  const { data: bedGroups } = await getBedGroups();
  const { data: beds } = await getBeds();

  return (
    <>
      <IPDAdmissionPage
        symptomTypes={symptomTypes || []}
        symptomsList={symptoms || []}
        doctors={doctors || []}
        bedGroups={bedGroups || []}
        beds={beds || []}
      />
    </>
  )
}

export default page
