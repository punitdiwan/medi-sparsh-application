import IPDPaymentManagerPage from '@/Components/doctor/ipd/payment/ipdPaymentManager'

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  console.log("Page params resolved:", id);
  return (
    <>
      <IPDPaymentManagerPage ipdId={id} />
    </>
  )
}

export default page
