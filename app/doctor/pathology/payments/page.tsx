import { getAllPathologyPayments } from "@/lib/actions/pathologyBills";
import PathologyPaymentsPage from "@/Components/doctor/pathology/PathologyPaymentsPage";

export const dynamic = "force-dynamic";

export default async function Page() {
    const result = await getAllPathologyPayments();

    if (result.error || !result.data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-destructive">Error</h2>
                    <p className="text-muted-foreground">{result.error || "Failed to load payments"}</p>
                </div>
            </div>
        );
    }

    // Cast data to match the component's expected type
    const payments = result.data.map(p => ({
        ...p,
        paymentAmount: p.paymentAmount.toString(),
        paymentDate: p.paymentDate.toISOString(),
    }));

    return <PathologyPaymentsPage payments={payments} />;
}
