"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus, Printer, Eye, Mail, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { RadiologyBillPdf } from "@/Components/pdf/radiologyBillPdf";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BsCash } from "react-icons/bs";
import RadiologyBillDetailsDialog from "./RadiologyBillDetailsDialog";
import RadiologyPaymentDialog from "./RadiologyPaymentDialog";

type Bill = {
    id: string;
    createdAt: string | Date;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    billTotalAmount: number;
    billNetAmount: number;
    billStatus: "pending" | "paid" | "partially_paid" | "refunded";
    paymentMode: string;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const DUMMY_BILLS: Bill[] = [
    {
        id: "RAD-00100200",
        createdAt: "2024-01-20T10:00:00Z",
        patientName: "Rajesh Kumar",
        patientPhone: "9876543210",
        patientEmail: "rajesh@example.com",
        billTotalAmount: 3500,
        billNetAmount: 3500,
        billStatus: "paid",
        paymentMode: "Cash",
    },
    {
        id: "RAD-00200300",
        createdAt: "2024-01-21T11:30:00Z",
        patientName: "Priya Sharma",
        patientPhone: "8765432109",
        patientEmail: "priya@example.com",
        billTotalAmount: 4500,
        billNetAmount: 4200,
        billStatus: "partially_paid",
        paymentMode: "UPI",
    },
    {
        id: "RAD-00300400",
        createdAt: "2024-01-22T14:15:00Z",
        patientName: "Amit Patel",
        patientPhone: "7654321098",
        billTotalAmount: 2800,
        billNetAmount: 2800,
        billStatus: "pending",
        paymentMode: "Card",
    },
];

export default function RadiologyBillPage() {
    const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [selectedBill, setSelectedBill] = useState<string>("");
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const route = useRouter();
    const ability = useAbility();
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "id",
        "patientName",
        "patientPhone",
        "billTotalAmount",
        "billStatus",
        "createdAt",
    ]);

    const filteredData = useMemo(() => {
        return bills.filter((b) => {
            const matchesSearch = search
                ? b.id.toLowerCase().includes(search.toLowerCase()) ||
                b.patientName.toLowerCase().includes(search.toLowerCase()) ||
                b.patientPhone.includes(search)
                : true;
            const matchesStatus = statusFilter ? b.billStatus === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, bills]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginated = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePrint = async (billId: string) => {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) return;

        try {
            toast.loading("Preparing PDF...", { id: "print-pdf" });
            const blob = await pdf(
                <RadiologyBillPdf
                    billNumber={bill.id.substring(0, 8).toUpperCase()}
                    billDate={format(new Date(bill.createdAt), "dd/MM/yyyy")}
                    patientName={bill.patientName}
                    patientPhone={bill.patientPhone}
                    paymentMode={bill.paymentMode}
                    items={[
                        { testName: "X-Ray Chest", quantity: 1, price: 1500, total: 1500 },
                        { testName: "CT Scan", quantity: 1, price: 2000, total: 2000 },
                    ]}
                    totalAmount={bill.billTotalAmount}
                    discount={bill.billTotalAmount - bill.billNetAmount}
                    tax={0}
                    organization={{ name: "Medi Sparsh Radiology", metadata: { address: "Test Address", phone: "1234567890", email: "radiology@test.com" } }}
                    orgModeCheck={true}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            toast.success("PDF ready for printing", { id: "print-pdf" });
        } catch (error) {
            console.error("Print error:", error);
            toast.error("Failed to generate PDF", { id: "print-pdf" });
        }
    };

    const allColumns: ColumnDef<Bill>[] = [
        { accessorKey: "id", header: "Bill ID", cell: ({ row }) => row.original.id.substring(0, 8) },
        {
            accessorKey: "createdAt",
            header: "Bill Date",
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
                return format(date, "dd/MM/yyyy");
            }
        },
        { accessorKey: "patientName", header: "Patient Name" },
        { accessorKey: "patientPhone", header: "Phone" },
        {
            accessorKey: "billTotalAmount",
            header: "Total Amount",
            cell: ({ row }) => `₹${Number(row.original.billTotalAmount).toFixed(2)}`
        },
        {
            accessorKey: "billNetAmount",
            header: "Net Amount",
            cell: ({ row }) => `₹${Number(row.original.billNetAmount).toFixed(2)}`
        },
        {
            accessorKey: "billStatus",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.billStatus;
                const statusColor = {
                    pending: "bg-yellow-100 text-yellow-800",
                    paid: "bg-green-100 text-green-800",
                    partially_paid: "bg-blue-100 text-blue-800",
                    refunded: "bg-gray-100 text-gray-800",
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[status as keyof typeof statusColor] || "bg-gray-100"}`}>
                        {status === "partially_paid" ? "Partially Paid" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical size={18} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedBill(row.original.id);
                                    setIsViewOpen(true);
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <Eye size={14} className="text-muted-foreground group-hover:text-primary" />
                                View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={row.original.billStatus !== "pending"}
                                onClick={() => {
                                    if (row.original.billStatus === "pending") {
                                        route.push(`/doctor/radiology/genrateBill?billId=${row.original.id}&mode=edit`);
                                    }
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <Edit size={14} className="text-muted-foreground group-hover:text-primary" />
                                Edit Bill
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedBill(row.original.id);
                                    setIsPaymentOpen(true);
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <BsCash className="text-muted-foreground group-hover:text-primary" />
                                Payments
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handlePrint(row.original.id)}
                                className="group gap-2 cursor-pointer"
                            >
                                <Printer size={14} className="text-muted-foreground group-hover:text-primary" />
                                Print Bill
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={!row.original.patientEmail}
                                onClick={() => {
                                    if (!row.original.patientEmail) return;
                                    toast.info(`Email feature coming soon ${row.original.patientEmail}`);
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <Mail size={14} className="text-muted-foreground group-hover:text-primary" />
                                Send via Email
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => toast.success("Bill cancelled (Dummy)")}
                                className="group gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 size={14} className="text-destructive group-hover:text-red-600" />
                                Cancel Bill
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
            <Card className="bg-Module-header text-white shadow-lg mb-4 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Radiology Billing</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Generate and manage radiology bills for patients. View bill history,
                        payment modes, and print invoices seamlessly.
                    </p>
                </div>
            </Card>

            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-3 flex-1">
                    <Input
                        placeholder="Search Bill / Patient / Phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partially_paid">Partially Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-3">
                    <FieldSelectorDropdown
                        columns={allColumns as TypedColumn<Bill>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                    <Can I="create" a="RadiologyBilling" ability={ability}>
                        <Button
                            variant="default"
                            onClick={() => route.push("/doctor/radiology/genrateBill")}
                        >
                            <Plus size={16} /> Generate Bill
                        </Button>
                    </Can>
                </div>
            </div>

            {loading ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Loading bills...</p>
                </Card>
            ) : filteredData.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No bills found</p>
                    <Button
                        onClick={() => route.push("/doctor/radiology/genrateBill")}
                    >
                        <Plus size={16} className="mr-2" /> Create First Bill
                    </Button>
                </Card>
            ) : (
                <>
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
                </>
            )}

            <RadiologyBillDetailsDialog
                open={isViewOpen}
                onClose={() => {
                    setIsViewOpen(false);
                    setSelectedBill("");
                }}
                bill={selectedBill as string}
            />

            <RadiologyPaymentDialog
                open={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedBill("");
                }}
                bill={selectedBill as string}
            />
        </div>
    );
}
