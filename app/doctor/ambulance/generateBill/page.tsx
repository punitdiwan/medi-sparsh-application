import AmbulanceBillingForm from "@/Components/doctor/ambulance/AmbulanceBillingForm";

export const dynamic = "force-dynamic";

export default async function GenerateBillPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const params = await searchParams;
    return <AmbulanceBillingForm id={params.id} />;
}
