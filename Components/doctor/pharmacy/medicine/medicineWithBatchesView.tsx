"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";


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

        // fake API delay
        const timer = setTimeout(() => {
            setMedicine(dummyMedicine);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [open, medicineId]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Medicine & Batch Details</DialogTitle>
                </DialogHeader>

                {/* LOADER */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* DATA */}
                {!loading && medicine && (
                    <div className="space-y-6">

                        {/* MEDICINE DETAILS */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    {medicine.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Company</p>
                                    <p className="font-medium">{medicine.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p className="font-medium">{medicine.categoryName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Group</p>
                                    <p className="font-medium">{medicine.groupName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Unit</p>
                                    <p className="font-medium">{medicine.unitName}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* BATCH TABLE */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Medicine Batches
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch No</TableHead>
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
                                            const isLowStock = qty <= batch.lowStockAlert;

                                            return (
                                                <TableRow key={batch.id}>
                                                    <TableCell className="font-medium">
                                                        {batch.batchNumber}
                                                    </TableCell>

                                                    <TableCell>
                                                        {format(
                                                            new Date(batch.expiryDate),
                                                            "dd MMM yyyy"
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">{qty}</TableCell>

                                                    <TableCell className="text-right">
                                                        ₹{Number(batch.costPrice).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        ₹{Number(batch.mrp).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        ₹{Number(batch.sellingPrice).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell>
                                                        {batch.isDeleted ? (
                                                            <Badge variant="destructive">Deleted</Badge>
                                                        ) : isLowStock ? (
                                                            <Badge className="bg-yellow-100 text-yellow-700">
                                                                Low Stock
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-green-600">
                                                                In Stock
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {medicine.batches.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    No batches available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                    </div>
                )}

                {/* EMPTY */}
                {!loading && !medicine && (
                    <p className="text-center text-muted-foreground py-6">
                        No data found
                    </p>
                )}
            </DialogContent>
        </Dialog>
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
