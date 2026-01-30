"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { PiMagnifyingGlassDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { getExpiredMedicine } from "@/lib/actions/pharmacyPurchase";


export default function ExpiredMedicinePage() {
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        fetchExpired();
    }, []);

    const fetchExpired = async () => {
        const res = await getExpiredMedicine();
        if (res?.error) {
            toast.error(res.error);
        } else if (res?.data) {
            setData(res.data);
        }
    };

    const filtered = useMemo(() => {
        return data.filter((item: any) => {
            const matchesSearch = search
                ? item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
                item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
                item.billNumber.toLowerCase().includes(search.toLowerCase()) ||
                item.supplierName.toLowerCase().includes(search.toLowerCase())
                : true;

            const expiry = new Date(item.expiryDate);

            const matchesFrom = fromDate ? expiry >= new Date(fromDate) : true;
            const matchesTo = toDate ? expiry <= new Date(toDate) : true;

            return matchesSearch && matchesFrom && matchesTo;
        });
    }, [data, search, fromDate, toDate]);

    const columns: ColumnDef<any>[] = [
        {
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: "medicineName",
            header: "Medicine",
        },
        {
            accessorKey: "batchNumber",
            header: "Batch",
        },
        {
            accessorKey: "expiryDate",
            header: "Expiry Date",
            cell: ({ row }) =>
                format(new Date(row.original.expiryDate), "dd MMM yyyy"),
        },
        {
            accessorKey: "billNumber",
            header: "Bill No",
        },
        {
            accessorKey: "stockQty",
            header: "Qty",
        },
        {
            accessorKey: "mrp",
            header: "MRP",
        },
        {
            accessorKey: "sellingPrice",
            header: "Selling Price",
        },

        {
            accessorKey: "supplierName",
            header: "Supplier",
        },
    ];

    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-6 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Expired Medicines
                    </h1>
                    <p className="text-sm text-white/90 max-w-2xl">
                        Medicines whose expiry date has passed and must not be dispensed.
                    </p>
                </div>
            </Card>

            <div className="flex flex-wrap items-center gap-4 mb-4">
                <Input
                    placeholder="Search Medicine / Batch / Bill / Supplier"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">From</label>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-[170px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">To</label>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-[170px]"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        setFromDate("");
                        setToDate("");
                    }}
                >
                    Clear Dates
                </Button>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                    <span className="text-4xl">
                        <PiMagnifyingGlassDuotone />
                    </span>
                    <p className="text-lg font-medium">No expired medicines found</p>
                    <p className="text-sm mt-1">
                        Try adjusting your search or date filters
                    </p>
                </div>
            ) : (
                <Table data={filtered} columns={columns} />
            )}
        </div>
    );
}
