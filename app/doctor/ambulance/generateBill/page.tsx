import AmbulanceBillingForm from "@/Components/doctor/ambulance/AmbulanceBillingForm";

export const dynamic = "force-dynamic";

type PageProps = {
    searchParams: Promise<{ id?: string }>;
}

export default async function GenerateBillPage({
    searchParams,
}: PageProps) {
    const { id } = await searchParams;
    return <AmbulanceBillingForm id={id} />;
}
