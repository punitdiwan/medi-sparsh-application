"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

type PurchaseDetails = {
    id: string;
    billNumber: string;
    supplierName: string | null;
    purchaseDate: Date;
    totalAmount: string;
    discount: string | null;
    gstPercent: string | null;
    items: {
        id: string;
        medicineName: string | null;
        batchNumber: string;
        expiryDate: string;
        quantity: string;
        mrp: string;
        purchasePrice: string;
        amount: string;
    }[];
};

interface PurchaseDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchase: PurchaseDetails | null;
}

export default function PurchaseDetailsModal({
    open,
    onOpenChange,
    purchase,
}: PurchaseDetailsModalProps) {
    if (!purchase) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Purchase Details</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Bill Number</p>
                        <p className="font-medium">{purchase.billNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium">{purchase.supplierName || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                            {format(new Date(purchase.purchaseDate), "dd MMM yyyy")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium">₹{purchase.totalAmount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Discount</p>
                        <p className="font-medium">{purchase.discount || "0"}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tax</p>
                        <p className="font-medium">{purchase.gstPercent || "0"}%</p>
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Batch No</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">MRP</TableHead>
                                <TableHead className="text-right">Cost Price</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchase.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.medicineName || "-"}</TableCell>
                                    <TableCell>{item.batchNumber}</TableCell>
                                    <TableCell>{item.expiryDate}</TableCell>
                                    <TableCell className="text-right">{item.mrp}</TableCell>
                                    <TableCell className="text-right">{item.purchasePrice}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{item.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
