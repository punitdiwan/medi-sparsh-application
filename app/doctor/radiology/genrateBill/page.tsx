import RadiologyBillingForm from "@/Components/doctor/radiology/radiologyBillingForm";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ billId?: string; mode?: string }>;
}

export default async function GenerateBillPage({ searchParams }: Props) {
    const params = await searchParams;
    return <RadiologyBillingForm billId={params.billId} mode={params.mode} />;
}
