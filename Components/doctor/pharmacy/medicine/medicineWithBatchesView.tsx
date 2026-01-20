"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";
import {
    Pill, Building2, Layers, Tag, Box, AlertTriangle, CheckCircle2, Trash2, CalendarDays, XCircle
} from "lucide-react";

interface MedicineWithBatches {
    id: string;
    name: string;
    companyName: string;
    categoryName: string;
    groupName: string;
    unitName: string;
    batches: {
        id: string;
        batchNumber: string;
        quantity: string;
        lowStockAlert: number;
        costPrice: string;
        mrp: string;
        sellingPrice: string;
        expiryDate: string;
        isDeleted: boolean;
    }[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicineId: string | null;
}

export default function MedicineWithBatchesModal({
    open,
    onOpenChange,
    medicineId,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [medicine, setMedicine] = useState<MedicineWithBatches | null>(null);

    useEffect(() => {
        if (!open || !medicineId) return;

        setLoading(true);
        const timer = setTimeout(() => {
            setMedicine(dummyMedicine);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [open, medicineId]);

    if (!open) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => onOpenChange(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-background w-[90vw] max-w-5xl max-h-[85vh] rounded-xl
                                shadow-xl flex flex-col overflow-hidden " >
                    <div className="flex items-center justify-between px-6 py-4 bg-dialog-header border-b border-dialog">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-dialog-header text-dialog-icon">
                                <Pill className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold">
                                Medicine & Batch Details
                            </h2>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition"
                        > <XCircle className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 border border-dialog bg-overview-base">
                        {loading && (
                            <div className="flex justify-center items-center min-h-[300px]">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && medicine && (
                            <>
                                <Card className="bg-dialog-surface text-dialog">
                                    <CardHeader>
                                        <CardTitle>{medicine.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ">
                                        <Info label="Company" value={medicine.companyName} icon={Building2}
                                            color="bg-indigo-500"
                                        />
                                        <Info label="Category" value={medicine.categoryName} icon={Tag}
                                            color="bg-purple-500"
                                        />
                                        <Info label="Group" value={medicine.groupName} icon={Layers}
                                            color="bg-pink-500"
                                        />
                                        <Info label="Unit" value={medicine.unitName} icon={Box}
                                            color="bg-emerald-500"
                                        />
                                    </CardContent>
                                </Card>
                                {/* TABLE */}
                                <Card className="bg-dialog-surface text-dialog">
                                    <CardHeader>
                                        <CardTitle>Medicine Batches</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 overflow-x-auto">
                                         <div className="w-full overflow-x-auto scrollbar-show scroll-smooth">
                                            <Table className="min-w-[500px]">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Batch</TableHead>
                                                        <TableHead>Expiry</TableHead>
                                                        <TableHead className="text-right">Qty</TableHead>
                                                        <TableHead className="text-right">Cost</TableHead>
                                                        <TableHead className="text-right">MRP</TableHead>
                                                        <TableHead className="text-right">Selling</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {medicine.batches.map((batch) => {
                                                        const qty = Number(batch.quantity);
                                                        const isLow = qty <= batch.lowStockAlert;
                                                        return (
                                                            <TableRow key={batch.id}>
                                                                <TableCell>{batch.batchNumber}</TableCell>
                                                                <TableCell className="flex items-center gap-1">
                                                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                                                    {format(new Date(batch.expiryDate), "dd MMM yyyy")}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {qty <= batch.lowStockAlert && (
                                                                        <AlertTriangle className="inline h-4 w-4 text-yellow-500 mr-1" />
                                                                    )}
                                                                    {qty}
                                                                </TableCell>
                                                                <TableCell className="text-right">₹{batch.costPrice}</TableCell>
                                                                <TableCell className="text-right">₹{batch.mrp}</TableCell>
                                                                <TableCell className="text-right">₹{batch.sellingPrice}</TableCell>
                                                                <TableCell> {batch.isDeleted ? (<Badge className="flex items-center gap-1 bg-red-500 text-white">
                                                                    <Trash2 className="h-3 w-3" />
                                                                    Deleted
                                                                </Badge>) : isLow ? (<Badge className="flex items-center gap-1 bg-yellow-400 text-black">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Low Stock
                                                                </Badge>) : (<Badge className="flex items-center gap-1 bg-green-600 text-white">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    In Stock
                                                                </Badge>)}
                                                                </TableCell>

                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {!loading && !medicine && (
                            <p className="text-center text-muted-foreground">
                                No data found
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Info({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: any;
    color: string;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className={`p-2 rounded-md ${color}`}>
                <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}



const dummyMedicine: MedicineWithBatches = {
    id: "med-1",
    name: "Paracetamol 650",
    companyName: "Cipla Ltd",
    categoryName: "Analgesic",
    groupName: "Pain Killer",
    unitName: "Tablet",
    batches: [
        {
            id: "batch-1",
            batchNumber: "PCM650-A1",
            quantity: "120",
            lowStockAlert: 20,
            costPrice: "1.50",
            mrp: "3.00",
            sellingPrice: "2.50",
            expiryDate: "2026-08-31",
            isDeleted: false,
        },
        {
            id: "batch-2",
            batchNumber: "PCM650-B2",
            quantity: "8",
            lowStockAlert: 10,
            costPrice: "1.40",
            mrp: "3.00",
            sellingPrice: "2.40",
            expiryDate: "2025-12-15",
            isDeleted: false,
        },
        {
            id: "batch-3",
            batchNumber: "PCM650-X9",
            quantity: "0",
            lowStockAlert: 10,
            costPrice: "1.30",
            mrp: "2.80",
            sellingPrice: "2.30",
            expiryDate: "2024-11-01",
            isDeleted: true,
        },
    ],
};
