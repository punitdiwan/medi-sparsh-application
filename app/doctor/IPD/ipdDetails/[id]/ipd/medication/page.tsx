import MedicationPage from '@/Components/doctor/ipd/medication/medicationPage'


const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <>
      <MedicationPage ipdId={id} />
    </>
  )
}

export default page
