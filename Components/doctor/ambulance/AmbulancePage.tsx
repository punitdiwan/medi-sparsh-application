"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Plus, Printer, Eye, Edit, Trash2, Calendar, Clock, Ambulance, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AmbulanceDetailsDialog from "./AmbulanceDetailsDialog";
import AmbulancePaymentDialog from "./AmbulancePaymentDialog";
import { getAmbulanceBookings, deleteAmbulanceBooking } from "@/lib/actions/ambulanceActions";

type AmbulanceBill = {
    id: string;
    patientName: string;
    patientPhone: string;
    vehicleNumber: string;
    driverName: string;
    pickupLocation: string;
    dropoffLocation: string;
    billTotalAmount: number;
    discountAmount: number;
    taxPercentage: number;
    netAmount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    billStatus: "paid" | "pending" | "partially_paid";
    tripType: string;
    createdAt: string;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };


export default function AmbulancePage() {
    const [bills, setBills] = useState<AmbulanceBill[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceBill | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const route = useRouter();
    const ability = useAbility();

    const fetchBookings = async () => {
        setLoading(true);
        const res = await getAmbulanceBookings();
        if (res.data) {
            const formatted: AmbulanceBill[] = res.data.map((b: any) => ({
                id: b.id,
                patientName: b.patientName,
                patientPhone: b.patientPhone,
                vehicleNumber: b.vehicleNumber,
                driverName: b.driverName,
                pickupLocation: b.pickupLocation,
                dropoffLocation: b.dropLocation,
                billTotalAmount: Number(b.standardCharge),
                discountAmount: Number(b.discountAmt),
                taxPercentage: Number(b.taxPercent),
                paidAmount: Number(b.paidAmount || 0),
                billStatus: b.paymentStatus as any,
                tripType: b.tripType,
                createdAt: b.createdAt.toISOString(),
            }));
            setBills(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "id",
        "patientName",
        "vehicleNumber",
        "driverName",
        "pickupLocation",
        "balanceAmount",
        "billStatus",
        "createdAt",
    ]);

    const filteredData = useMemo(() => {
        return bills.filter((b) =>
            search
                ? b.id.toLowerCase().includes(search.toLowerCase()) ||
                b.patientName.toLowerCase().includes(search.toLowerCase()) ||
                b.vehicleNumber.toLowerCase().includes(search.toLowerCase())
                : true
        );
    }, [search, bills]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginated = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const allColumns: ColumnDef<AmbulanceBill>[] = [
        {
            accessorKey: "id",
            header: "Bill No",
            cell: ({ row }) => (
                <Link
                    href={`/doctor/ambulance/generateBill?id=${row.original.id}`}
                    className="text-primary hover:underline font-medium"
                >
                    {row.original.id.substring(0, 13)}
                </Link>
            )
        },
        { accessorKey: "patientName", header: "Patient Name" },
        { accessorKey: "patientPhone", header: "Patient Phone" },
        { accessorKey: "vehicleNumber", header: "Vehicle No" },
        { accessorKey: "driverName", header: "Driver" },
        { accessorKey: "driverContact", header: "Driver Contact" },
        { accessorKey: "pickupLocation", header: "Pickup Location" },
        { accessorKey: "dropoffLocation", header: "Dropoff Location" },
        {
            accessorKey: "PickUpDate", header: "Pickup Date", cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.original.createdAt), "dd MMM yyyy")}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "billTotalAmount",
            header: "Amount",
            cell: ({ row }) => `₹${row.original.billTotalAmount.toFixed(2)}`
        },
        {
            accessorKey: "discountAmount",
            header: "Discount",
            cell: ({ row }) => `₹${row.original.discountAmount.toFixed(2)}`
        },
        {
            accessorKey: "taxPercentage",
            header: "Tax",
            cell: ({ row }) => `${row.original.taxPercentage.toFixed(2)}%`
        },
        {
            accessorKey: "netAmount",
            header: "Net Amount",
            cell: ({ row }) => {
                const bill = row.original.billTotalAmount || 0;
                const discountAmount = row.original.discountAmount || 0;
                const taxPercent = row.original.taxPercentage || 0;

                const taxableAmount = bill - discountAmount;
                const taxAmount = taxableAmount * (taxPercent / 100);

                const netAmount = taxableAmount + taxAmount;

                return `₹${netAmount.toFixed(2)}`;
            }
        },
        {
            accessorKey: "paidAmount",
            header: "Paid Amount",
            cell: ({ row }) => `₹${row.original.paidAmount?.toFixed(2)}`
        },
        {
            accessorKey: "balanceAmount",
            header: "Balance Amount",
            cell: ({ row }) => {
                const bill = row.original.billTotalAmount || 0;
                const discountAmount = row.original.discountAmount || 0;
                const taxPercent = row.original.taxPercentage || 0;
                const paid = row.original.paidAmount || 0;

                const taxableAmount = bill - discountAmount;
                const taxAmount = taxableAmount * (taxPercent / 100);
                const netAmount = taxableAmount + taxAmount;

                const balance = netAmount - paid;

                return `₹${balance.toFixed(2)}`;
            }
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
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[status]}`}>
                        {status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
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
                            {/* <DropdownMenuItem
                                className="group gap-2 cursor-pointer"
                                onClick={() => {
                                    setSelectedAmbulance(row.original);
                                    setIsDetailsDialogOpen(true);
                                }}
                            >
                                <Eye size={14} className="text-muted-foreground group-hover:text-primary" />
                                View Details
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                                className="group gap-2 cursor-pointer"
                                onClick={() => route.push(`/doctor/ambulance/generateBill?id=${row.original.id}`)}
                            >
                                <Edit size={14} className="text-muted-foreground group-hover:text-primary" />
                                Edit Bill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="group gap-2 cursor-pointer"
                                onClick={() => {
                                    setSelectedAmbulance(row.original);
                                    setIsPaymentDialogOpen(true);
                                }}
                            >
                                <CreditCard size={14} className="text-muted-foreground group-hover:text-primary" />
                                Payments
                            </DropdownMenuItem>
                            <DropdownMenuItem className="group gap-2 cursor-pointer">
                                <Printer size={14} className="text-muted-foreground group-hover:text-primary" />
                                Print Bill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="group gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this booking?")) {
                                        const res = await deleteAmbulanceBooking(row.original.id);
                                        if (res.data) {
                                            toast.success("Booking deleted successfully");
                                            fetchBookings();
                                        } else {
                                            toast.error(res.error || "Failed to delete booking");
                                        }
                                    }
                                }}
                            >
                                <Trash2 size={14} className="text-destructive group-hover:text-red-600" />
                                Delete
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
            const key = (col as any).accessorKey || col.id;
            return key && visibleFields.includes(key as string);
        });

        const actionCol = allColumns.find((c) => c.id === "actions");
        if (actionCol) filtered.push(actionCol);

        return filtered;
    }, [visibleFields]);


    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-4 px-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Ambulance Billing</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Manage ambulance services, generate bills, and track vehicle usage.
                    </p>
                </div>
            </Card>

            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-3 flex-1">
                    <Input
                        placeholder="Search Bill / Patient / Vehicle"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="flex gap-3">
                    <FieldSelectorDropdown
                        columns={allColumns.filter(col => col.id !== "actions") as TypedColumn<AmbulanceBill>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                    {/* <Can I="create" a="ambulance" ability={ability}> */}
                    <Button
                        variant="default"
                        onClick={() => route.push("/doctor/ambulance/generateBill")}
                    >
                        <Plus size={16} /> Add Ambulance
                    </Button>
                    {/* </Can> */}
                </div>
            </div>

            <Table data={paginated} columns={columns} fallback={"No Ambulance Bills found"} />

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

            <AmbulanceDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => setIsDetailsDialogOpen(false)}
                ambulance={selectedAmbulance}
            />

            <AmbulancePaymentDialog
                open={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                bill={selectedAmbulance}
            />
        </div>
    );
}
