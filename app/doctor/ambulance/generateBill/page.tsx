import AmbulanceBillingForm from "@/Components/doctor/ambulance/AmbulanceBillingForm";

export const dynamic = "force-dynamic";

export default function GenerateBillPage({
    searchParams,
}: {
    searchParams: { id?: string };
}) {
    return <AmbulanceBillingForm id={searchParams.id} />;
}
