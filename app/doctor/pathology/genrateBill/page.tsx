import PathologyBillingForm from "@/Components/doctor/pathology/pathologyBillingForm";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{
        billId?: string;
        mode?: string;
    }>;
};

export default async function GenerateBillPage({ searchParams }: Props) {
    const params = await searchParams;
    return <PathologyBillingForm billId={params.billId} mode={params.mode} />;
}
