import IPDPrescriptionPage from '@/Components/doctor/ipd/prescription/prescriptionPageManager'
import React from 'react'

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const page = async ({ params }: Props) => {
  const { id } = await params;
  return (
    <>
      <IPDPrescriptionPage ipdId={id} />
    </>
  );
};

export default page;
