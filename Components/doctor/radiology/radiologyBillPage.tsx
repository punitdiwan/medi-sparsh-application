"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import { Plus, Printer } from "lucide-react";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";

import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { RadiologyBillPdf } from "@/Components/pdf/radiologyBillPdf";

type Bill = {
    id: string;
    billNo: string;
    date: string;
    patientName: string;
    patientPhone: string;
    paymentMode: string;
    totalAmount: number;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const DUMMY_BILLS: Bill[] = [
    {
        id: "1",
        billNo: "RAD-001",
        date: "2024-01-20",
        patientName: "Rajesh Kumar",
        patientPhone: "9876543210",
        paymentMode: "Cash",
        totalAmount: 3500,
    },
    {
        id: "2",
        billNo: "RAD-002",
        date: "2024-01-21",
        patientName: "Priya Sharma",
        patientPhone: "8765432109",
        paymentMode: "UPI",
        totalAmount: 4500,
    },
    {
        id: "3",
        billNo: "RAD-003",
        date: "2024-01-22",
        patientName: "Amit Patel",
        patientPhone: "7654321098",
        paymentMode: "Card",
        totalAmount: 2800,
    },
];

export default function RadiologyBillPage() {
    const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const route = useRouter();
    const ability = useAbility();
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "billNo",
        "date",
        "patientName",
        "patientPhone",
        "paymentMode",
        "totalAmount",
    ]);

    const filteredData = useMemo(() => {
        return bills.filter((b) =>
            search
                ? b.billNo.toLowerCase().includes(search.toLowerCase()) ||
                b.patientName.toLowerCase().includes(search.toLowerCase()) ||
                b.patientPhone.includes(search)
                : true
        );
    }, [search, bills]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginated = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePrint = async (billId: string) => {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) return;

        try {
            const blob = await pdf(
                <RadiologyBillPdf
                    billNumber={bill.billNo}
                    billDate={bill.date}
                    patientName={bill.patientName}
                    patientPhone={bill.patientPhone}
                    paymentMode={bill.paymentMode}
                    items={[
                        { testName: "X-Ray Chest", quantity: 1, price: 1500, total: 1500 },
                        { testName: "CT Scan", quantity: 1, price: 2000, total: 2000 },
                    ]}
                    totalAmount={bill.totalAmount}
                    discount={0}
                    tax={0}
                    organization={{ name: "Medi Sparsh Radiology", metadata: { address: "Test Address", phone: "1234567890", email: "radiology@test.com" } }}
                    orgModeCheck={true}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const win = window.open(url);

            if (win) {
                win.onload = () => {
                    win.focus();
                    win.print();
                };
            }
        } catch (error) {
            console.error("Print error:", error);
            toast.error("Failed to print bill");
        }
    };

    const allColumns: ColumnDef<Bill>[] = [
        { accessorKey: "billNo", header: "Bill No" },
        { accessorKey: "date", header: "Bill Date" },
        { accessorKey: "patientName", header: "Patient Name" },
        { accessorKey: "patientPhone", header: "Patient Phone" },
        { accessorKey: "paymentMode", header: "Payment Mode" },
        { accessorKey: "totalAmount", header: "Total Amount" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(row?.original?.id)}
                >
                    <Printer size={14} className="mr-2" /> Print
                </Button>
            ),
        },
    ];

    const columns = useMemo(() => {
        const filtered = allColumns.filter((col) => {
            if (col.id === "actions") return false;
            const key = "accessorKey" in col ? col.accessorKey : undefined;
            return key && visibleFields.includes(key as string);
        });

        const actionCol = allColumns.find((c) => c.id === "actions");
        if (actionCol) filtered.push(actionCol);

        return filtered;
    }, [visibleFields, allColumns]);

    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-4 px-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Radiology Billing</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Generate and manage radiology bills for patients. View bill history,
                        payment modes, and print invoices seamlessly.
                    </p>
                </div>
            </Card>

            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <Input
                    placeholder="Search Bill / Patient / Phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex gap-3">
                    <Can I="create" a="RadiologyBilling" ability={ability}>
                        <Button
                            variant="default"
                            onClick={() => route.push("/doctor/radiology/genrateBill")}
                        >
                            <Plus size={16} /> Generate Bill
                        </Button>
                    </Can>
                    <FieldSelectorDropdown
                        columns={allColumns as TypedColumn<Bill>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                </div>
            </div>

            <Table data={paginated} columns={columns} fallback={"No Bill found"} />

            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={(val) => {
                    setRowsPerPage(val);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}
