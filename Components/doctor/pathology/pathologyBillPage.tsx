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
import { PathologyBillPdf } from "@/Components/pdf/pathologyBillPdf";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import PathologyBillDetailsDialog from "./PathologyBillDetailsDialog";
import { BsCash } from "react-icons/bs";
import PathologyPaymentDialog from "./PathologyPaymentDialog";
import { getBillsByHospital, getBillById } from "@/lib/actions/pathologyBills";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type BillItem = {
    medicineName: string;
    quantity: number;
    price: number;
    total: number;
};

type Bill = {
    id: string;
    orderId: string;
    billDate: string | Date;
    billDiscount: string | number;
    billTotalAmount: string | number;
    billNetAmount: string | number;
    billStatus: string;
    patientName: string | null;
    patientPhone: string | null;
    patientEmail: string | null;
    patientGender: string | null;
    patientDob: string | null;
    patientAddress: string | null;
    createdAt: string | Date;
    items?: BillItem[];
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

export default function PathologyBillPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const loadBills = async () => {
            try {
                setLoading(true);
                const result = await getBillsByHospital(search, statusFilter);
                if (result.success && result.data) {
                    setBills(result.data as any);
                } else {
                    toast.error(result.error || "Failed to load bills");
                }
            } catch (error) {
                console.error("Error loading bills:", error);
                toast.error("An error occurred while loading bills");
            } finally {
                setLoading(false);
            }
        };
        loadBills();
    }, [search, statusFilter]);

    const filteredData = useMemo(() => {
        return bills.filter((b) =>
            search
                ? b.id.substring(0, 8).toLowerCase().includes(search.toLowerCase()) ||
                b.patientName?.toLowerCase().includes(search.toLowerCase()) ||
                b.patientPhone?.includes(search)
                : true
        );
    }, [search, bills]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginated = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePrint = async (billId: string) => {
        try {
            toast.loading("Preparing PDF...", { id: "print-pdf" });
            const result = await getBillById(billId);
            if (!result.success || !result.data) {
                toast.error(result.error || "Failed to fetch bill details", { id: "print-pdf" });
                return;
            }
            const billData = result.data;
            const pdfDoc = (
                <PathologyBillPdf
                    billNumber={billData.id.substring(0, 8).toUpperCase()}
                    billDate={format(new Date(billData.billDate), "dd/MM/yyyy")}
                    customerName={billData.patientName}
                    customerPhone={billData.patientPhone}
                    paymentMode={billData.payments?.[0]?.paymentMode || "Cash"}
                    items={billData.tests.map((t: any) => {
                        const price = Number(t.price) || 0;
                        const taxPercent = Number(t.tax) || 0;
                        const taxAmount = (price * taxPercent) / 100;
                        const total = price + taxAmount;
                        return {
                            testName: t.testName,
                            price,
                            tax: taxPercent,
                            total,
                        };
                    })}
                    discount={Number(billData.billDiscount)}
                    organization={billData.organization}
                    orgModeCheck={true}
                    payments={billData.payments?.map((p: any) => ({
                        date: format(new Date(p.paymentDate), "dd/MM/yyyy"),
                        amount: Number(p.paymentAmount),
                        mode: p.paymentMode,
                    })) || []}
                    totalPaid={billData.totalPaid}
                    balanceAmount={billData.balanceAmount}
                    doctorName={billData.doctorName || ""}
                />
            );

            const blob = await pdf(pdfDoc).toBlob();
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

                            {/* View */}
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

                            {/* Edit */}
                            <DropdownMenuItem
                                onClick={() => console.log("Edit bill clicked")}
                                className="group gap-2 cursor-pointer"
                            >
                                <Edit size={14} className="text-muted-foreground group-hover:text-primary" />
                                Edit Bill
                            </DropdownMenuItem>

                            {/* Payment */}
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedBill(row?.original?.id);
                                    setIsPaymentOpen(true);
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <BsCash className="text-muted-foreground group-hover:text-primary" />
                                Add / Edit Payment
                            </DropdownMenuItem>

                            {/* Print */}
                            <DropdownMenuItem
                                onClick={() => handlePrint(row?.original?.id)}
                                className="group gap-2 cursor-pointer"
                            >
                                <Printer size={14} className="text-muted-foreground group-hover:text-primary" />
                                Print Bill
                            </DropdownMenuItem>

                            {/* Email */}
                            <DropdownMenuItem
                                disabled={!row?.original?.patientEmail}
                                onClick={() => {
                                    if (!row?.original?.patientEmail) return;
                                    toast.info(`Email feature coming soon ${row.original.patientEmail}`);
                                }}
                                className="group gap-2 cursor-pointer"
                            >
                                <Mail size={14} className="text-muted-foreground group-hover:text-primary" />
                                Send via Email
                            </DropdownMenuItem>

                            {/* Cancel Bill (Danger) */}
                            <DropdownMenuItem
                                onClick={() => console.log("Cancel bill clicked")}
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
                <div className="flex gap-3 flex-1">
                    <Input
                        placeholder="Search Bill / Patient / Phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>
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
                    <Can I="create" a="PathologyBilling" ability={ability}>
                        <Button
                            variant="default"
                            onClick={() => route.push("/doctor/pathology/genrateBill")}
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
            ) : bills.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No bills found</p>
                    <Button
                        onClick={() => route.push("/doctor/pathology/genrateBill")}
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

            <PathologyBillDetailsDialog
                open={isViewOpen}
                onClose={() => {
                    setIsViewOpen(false);
                    setSelectedBill("");
                }}
                bill={selectedBill as string}
            />

            <PathologyPaymentDialog
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
