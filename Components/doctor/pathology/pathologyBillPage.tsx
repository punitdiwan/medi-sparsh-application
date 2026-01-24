"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import { Plus, Printer, Eye, Mail } from "lucide-react";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";
import { PathologyBillPdf } from "@/Components/pdf/pathologyBillPdf";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import PathologyBillDetailsDialog from "./PathologyBillDetailsDialog";
import { BsCash } from "react-icons/bs";
import PathologyPaymentDialog from "./PathologyPaymentDialog";

type BillItem = {
    medicineName: string;
    quantity: number;
    price: number;
    total: number;
};

type Bill = {
    id: string;
    billNo: string;
    date: string;
    customerName: string;
    customerPhone: string;
    paymentMode: string;
    totalAmount: number;
    totalDiscount: number;
    totalTax: number;
    netAmount: number;
    totalDeposit: number;
    balanceAmount: number;
    prescriptionNo?: string;
    doctorName?: string;
    bloodGroup?: string;
    generatedBy?: string;
    note?: string;
    age?: string;
    gender?: string;
    email?: string;
    address?: string;
    items: BillItem[];
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const DUMMY_BILLS: Bill[] = [
    {
        id: "1",
        billNo: "PATHOB624",
        date: "23/01/2026",
        customerName: "Sunil Kumar",
        customerPhone: "9876543210",
        paymentMode: "Cash",
        prescriptionNo: "RX789",
        doctorName: "Dr. Sanjay Gupta",
        bloodGroup: "O+",
        generatedBy: "Zeeshan (Admin)",
        note: "Urgent report requested by patient.",
        age: "35 Years",
        gender: "Male",
        email: "sunil.kumar@example.com",
        address: "123, Gandhi Nagar, New Delhi",
        totalAmount: 1500,
        totalDiscount: 100,
        totalTax: 180,
        netAmount: 1580,
        totalDeposit: 1000,
        balanceAmount: 580,
        items: [
            { medicineName: "CBC (Complete Blood Count)", quantity: 1, price: 500, total: 500 },
            { medicineName: "Lipid Profile", quantity: 1, price: 1000, total: 1000 },
        ],
    },
    {
        id: "2",
        billNo: "PATHOB625",
        date: "23/01/2026",
        customerName: "Rani Devi",
        customerPhone: "8888777766",
        paymentMode: "Online",
        prescriptionNo: "RX790",
        doctorName: "Dr. Anita Sharma",
        bloodGroup: "B-",
        generatedBy: "Amit (Staff)",
        note: "Sample collected at home.",
        age: "42 Years",
        gender: "Female",
        email: "rani.devi@example.com",
        address: "45/A, Saket, South Delhi",
        totalAmount: 2000,
        totalDiscount: 200,
        totalTax: 240,
        netAmount: 2040,
        totalDeposit: 2040,
        balanceAmount: 0,
        items: [
            { medicineName: "Liver Function Test (LFT)", quantity: 1, price: 1200, total: 1200 },
            { medicineName: "Thyroid Profile", quantity: 1, price: 800, total: 800 },
        ],
    },
];

export default function PathologyBillPage() {
    const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const route = useRouter();
    const ability = useAbility();
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "billNo",
        "date",
        "customerName",
        "customerPhone",
        "paymentMode",
        "totalAmount",
    ]);

    const filteredData = useMemo(() => {
        return bills.filter((b) =>
            search
                ? b.billNo.toLowerCase().includes(search.toLowerCase()) ||
                b.customerName.toLowerCase().includes(search.toLowerCase()) ||
                b.customerPhone.includes(search)
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
                <PathologyBillPdf
                    billNumber={bill.billNo}
                    billDate={bill.date}
                    customerName={bill.customerName}
                    customerPhone={bill.customerPhone}
                    paymentMode={bill.paymentMode}
                    items={bill.items}
                    totalAmount={bill.totalAmount}
                    discount={0}
                    tax={0}
                    organization={{ name: "Medi Sparsh Pathology", metadata: { address: "Test Address", phone: "1234567890", email: "path@test.com" } }}
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
        { accessorKey: "customerName", header: "Customer Name" },
        { accessorKey: "customerPhone", header: "Customer Phone" },
        { accessorKey: "paymentMode", header: "Payment Mode" },
        { accessorKey: "totalAmount", header: "Total Amount" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedBill(row.original);
                                        setIsViewOpen(true);
                                    }}
                                >
                                    <Eye size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedBill(row.original);
                                        setIsPaymentOpen(true);
                                    }}
                                >
                                    <BsCash />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add/Edit Payment</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePrint(row?.original?.id)}
                                >
                                    <Printer size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Print</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const bill = row.original;

                                        if (!bill.email) {
                                            toast.error("Patient email not available");
                                            return;
                                        }
                                        // future: open email dialog / trigger API
                                        toast.success(`Bill will be sent to ${bill.email}`);
                                    }}
                                >
                                    <Mail size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Send Bill via Email</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
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
                    <h1 className="text-3xl font-bold tracking-tight">Pathology Billing</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Generate and manage pathology bills for patients. View bill history,
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
                    <Can I="create" a="PathologyBilling" ability={ability}>
                        <Button
                            variant="default"
                            onClick={() => route.push("/doctor/pathology/genrateBill")}
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

            <PathologyBillDetailsDialog
                open={isViewOpen}
                onClose={() => {
                    setIsViewOpen(false);
                    setSelectedBill(null);
                }}
                bill={selectedBill}
            />

            <PathologyPaymentDialog
                open={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedBill(null);
                }}
                bill={selectedBill}
            />
        </div>
    );
}
