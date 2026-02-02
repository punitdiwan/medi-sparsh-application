
import RadiologyPaymentsPage from "@/Components/doctor/radiology/RadiologyPaymentsPage";

export default function Page() {
        // Dummy data for radiology payments
        const DUMMY_PAYMENTS = [
            {
                id: "RADPAY-001",
                billId: "RAD-00100200",
                billNo: "RAD-00100200",
                paymentDate: new Date().toISOString(),
                paymentAmount: "3500",
                paymentMode: "Cash",
                referenceNo: "REF1234",
                patientName: "Rajesh Kumar",
                patientPhone: "9876543210",
            },
            {
                id: "RADPAY-002",
                billId: "RAD-00200300",
                billNo: "RAD-00200300",
                paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                paymentAmount: "4200",
                paymentMode: "Online",
                referenceNo: "REF5678",
                patientName: "Priya Sharma",
                patientPhone: "8765432109",
            },
            {
                id: "RADPAY-003",
                billId: "RAD-00300400",
                billNo: "RAD-00300400",
                paymentDate: new Date(Date.now() - 86400000 * 10).toISOString(),
                paymentAmount: "2800",
                paymentMode: "Card",
                referenceNo: null,
                patientName: "Amit Patel",
                patientPhone: "7654321098",
            },
        ];

        return <RadiologyPaymentsPage payments={DUMMY_PAYMENTS} />;
}
