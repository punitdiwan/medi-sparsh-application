"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import { Plus, Printer, Eye } from "lucide-react";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";
import { PathologyBillPdf } from "@/Components/pdf/pathologyBillPdf";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
    items: BillItem[];
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const DUMMY_BILLS: Bill[] = [
    {
        id: "1",
        billNo: "PATH-001",
        date: "2024-01-20",
        customerName: "John Doe",
        customerPhone: "1234567890",
        paymentMode: "Cash",
        totalAmount: 1500,
        items: [
            { medicineName: "Blood Test", quantity: 1, price: 500, total: 500 },
            { medicineName: "Sugar Test", quantity: 1, price: 1000, total: 1000 },
        ],
    },
    {
        id: "2",
        billNo: "PATH-002",
        date: "2024-01-21",
        customerName: "Jane Smith",
        customerPhone: "9876543210",
        paymentMode: "UPI",
        totalAmount: 2500,
        items: [
            { medicineName: "Full Body Checkup", quantity: 1, price: 2500, total: 2500 },
        ],
    },
];

export default function PathologyBillPage() {
    const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
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
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Dialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Eye size={14} />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View Details</p>
                                </TooltipContent>
                            </Tooltip>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Billing Details - {row.original.billNo}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Customer Info</h3>
                                        <p className="text-sm">Name: {row.original.customerName}</p>
                                        <p className="text-sm">Phone: {row.original.customerPhone}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Bill Info</h3>
                                        <p className="text-sm">Date: {row.original.date}</p>
                                        <p className="text-sm">Payment: {row.original.paymentMode}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Items</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b">
                                                    <th className="p-2 text-left">Test/Medicine</th>
                                                    <th className="p-2 text-center">Qty</th>
                                                    <th className="p-2 text-right">Price</th>
                                                    <th className="p-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {row.original.items.map((item, index) => (
                                                    <tr key={index} className="border-b last:border-0">
                                                        <td className="p-2">{item.medicineName}</td>
                                                        <td className="p-2 text-center">{item.quantity}</td>
                                                        <td className="p-2 text-right">{item.price}</td>
                                                        <td className="p-2 text-right">{item.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-muted/50 font-bold">
                                                <tr>
                                                    <td colSpan={3} className="p-2 text-right">Total Amount</td>
                                                    <td className="p-2 text-right">{row.original.totalAmount}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TooltipProvider>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(row?.original?.id)}
                    >
                        <Printer size={14} /> Print
                    </Button>
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
        </div>
    );
}
