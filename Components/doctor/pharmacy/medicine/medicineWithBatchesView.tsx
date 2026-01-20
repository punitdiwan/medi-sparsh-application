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

        const fetchMedicineData = async () => {
            setLoading(true);
            setMedicine(null);

            try {
                const { getPharmacyMedicineWithBatches } = await import("@/lib/actions/pharmacyMedicines");
                const result = await getPharmacyMedicineWithBatches(medicineId);

                if (result.error) {
                    console.error("Error fetching medicine:", result.error);
                    setMedicine(null);
                } else if (result.data) {
                    setMedicine(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch medicine data:", error);
                setMedicine(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMedicineData();
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
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{medicine.name}</CardTitle>
                                            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                                                <Box className="h-5 w-5 text-primary" />
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Total Available</p>
                                                    <p className="text-lg font-bold text-primary">
                                                        {medicine.batches.reduce((sum: number, batch: any) => sum + Number(batch.quantity), 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
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
                                                        const isEmpty = qty === 0;
                                                        const isLow = qty > 0 && (qty <= 50 || qty <= batch.lowStockAlert);
                                                        return (
                                                            <TableRow key={batch.id}>
                                                                <TableCell>{batch.batchNumber}</TableCell>
                                                                <TableCell className="flex items-center gap-1">
                                                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                                                    {format(new Date(batch.expiryDate), "dd MMM yyyy")}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">

                                                                    {isLow && !isEmpty && (
                                                                        <AlertTriangle className="inline h-4 w-4 text-yellow-500 mr-1" />
                                                                    )}
                                                                    {qty}
                                                                </TableCell>
                                                                <TableCell className="text-right">₹{batch.costPrice}</TableCell>
                                                                <TableCell className="text-right">₹{batch.mrp}</TableCell>
                                                                <TableCell className="text-right">₹{batch.sellingPrice}</TableCell>
                                                                <TableCell>
                                                                    {batch.isDeleted ? (
                                                                        <Badge className="flex items-center gap-1 bg-red-500 text-white">
                                                                            <Trash2 className="h-3 w-3" />
                                                                            Deleted
                                                                        </Badge>
                                                                    ) : isEmpty ? (
                                                                        <Badge className="flex items-center gap-1 bg-red-600 text-white">
                                                                            <XCircle className="h-3 w-3" />
                                                                            Empty
                                                                        </Badge>
                                                                    ) : isLow ? (
                                                                        <Badge className="flex items-center gap-1 bg-yellow-400 text-black">
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            Low Stock
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="flex items-center gap-1 bg-green-600 text-white">
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                            In Stock
                                                                        </Badge>
                                                                    )}
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

