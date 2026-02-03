"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Printer,
    Building2,
    Trash2,
    CreditCard,
    History,
    IndianRupee,
    Save,
    ChevronDown,
    ChevronUp,
    Info,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

/* -------------------- TYPES -------------------- */

interface Transaction {
    id: string;
    date: string;
    mode: string;
    note: string;
    amount: number;
}

interface AmbulanceBill {
    id: string;
    patientName: string;
    patientPhone: string;
    vehicleNumber: string;
    driverName: string;
    pickupLocation: string;
    dropoffLocation: string;
    billTotalAmount: number;
    discountPercentage: number;
    taxPercentage: number;
    netAmount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    billStatus: "paid" | "pending" | "partially_paid";
    createdAt: string;
}

interface AmbulancePaymentDialogProps {
    open: boolean;
    onClose: () => void;
    bill: AmbulanceBill | null;
}

/* -------------------- SUB-COMPONENTS -------------------- */

function SummarySection({ title, children, icon: Icon, className = "" }: { title: string; children: React.ReactNode; icon: any; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-overview-strong/50">
                <Icon className="h-4 w-4 text-overview-info" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-dialog-muted">{title}</h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-4">
                {children}
            </div>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string | number | undefined }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-dialog-muted font-bold uppercase tracking-tight">{label}</span>
            <span className="text-sm font-medium truncate text-dialog" title={String(value || "-")}>{value || "-"}</span>
        </div>
    );
}

/* -------------------- MAIN DIALOG -------------------- */

export default function AmbulancePaymentDialog({
    open,
    onClose,
    bill: billData,
}: AmbulancePaymentDialogProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentData, setPaymentData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        mode: "Cash",
        referenceNo: "",
        note: "",
    });
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; amount: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize when bill changes
    useEffect(() => {
        if (billData && open) {
            const bill = billData.billTotalAmount || 0;
            const discountPercent = billData.discountPercentage || 0;
            const taxPercent = billData.taxPercentage || 0;
            const discountAmount = bill * (discountPercent / 100);
            const taxableAmount = bill - discountAmount;
            const taxAmount = taxableAmount * (taxPercent / 100);
            const netAmount = taxableAmount + taxAmount;

            setPaymentData(prev => ({ 
                ...prev, 
                amount: billData.balanceAmount || (netAmount - (billData.paidAmount || 0)) 
            }));
        }
    }, [billData, open]);

    if (!open || !billData) return null;

    // Calculate net amount
    const bill = billData.billTotalAmount || 0;
    const discountPercent = billData.discountPercentage || 0;
    const taxPercent = billData.taxPercentage || 0;
    const discountAmount = bill * (discountPercent / 100);
    const taxableAmount = bill - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const netAmount = taxableAmount + taxAmount;

    const totalPaid = (billData.paidAmount || 0) + transactions.reduce((sum, t) => sum + t.amount, 0);
    const dueAmount = netAmount - totalPaid;

    const handleAddPayment = () => {
        if (paymentData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (paymentData.mode !== "Cash" && !paymentData.referenceNo) {
            toast.error("Please enter Reference # for non-cash payments");
            return;
        }

        const newTransaction: Transaction = {
            id: `TXN-${Date.now()}`,
            date: paymentData.date,
            mode: paymentData.mode,
            note: paymentData.referenceNo || paymentData.note,
            amount: paymentData.amount,
        };

        setTransactions([...transactions, newTransaction]);
        toast.success("Payment added successfully");

        // Reset form
        setPaymentData({
            date: new Date().toISOString().split("T")[0],
            amount: dueAmount - paymentData.amount > 0 ? dueAmount - paymentData.amount : 0,
            mode: "Cash",
            referenceNo: "",
            note: "",
        });
    };

    const handleDeleteTrx = (id: string, amount: number) => {
        setDeleteConfirm({ id, amount });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        setIsDeleting(true);
        try {
            setTransactions(transactions.filter(t => t.id !== deleteConfirm.id));
            toast.success("Transaction deleted successfully");
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0 flex flex-col bg-dialog max-h-screen overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-dialog-header border-b border-dialog shadow-md">
                    <div className="flex items-center gap-4">
                        <CreditCard className="h-5 w-5 text-overview-info" />
                        <div>
                            <h1 className="text-xl font-bold text-header">Payment Receipt</h1>
                            <p className="text-xs text-header/70">{billData.id}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 text-header hover:bg-dialog"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* SUMMARY SECTION */}
                    <Card className="bg-dialog-surface border-dialog">
                        <CardHeader
                            className="pb-3 cursor-pointer hover:bg-overview-muted transition-colors"
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        >
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold text-dialog flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    BILL INFORMATION
                                </CardTitle>
                                {isSummaryExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-dialog-muted" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-dialog-muted" />
                                )}
                            </div>
                        </CardHeader>
                        {isSummaryExpanded && (
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-dialog-muted font-bold">Patient Name</Label>
                                        <p className="text-sm font-semibold text-dialog">{billData.patientName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-dialog-muted font-bold">Phone</Label>
                                        <p className="text-sm font-semibold text-dialog">{billData.patientPhone}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-dialog-muted font-bold">Vehicle Number</Label>
                                        <p className="text-sm font-semibold text-dialog">{billData.vehicleNumber}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-dialog-muted font-bold">Driver Name</Label>
                                        <p className="text-sm font-semibold text-dialog">{billData.driverName}</p>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* BILLING SUMMARY */}
                    <Card className="bg-dialog-surface border-dialog">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-dialog flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                AMOUNT SUMMARY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm border-b border-dialog/30 pb-2">
                                <span className="text-dialog-muted">Total Amount</span>
                                <span className="font-semibold text-dialog">₹{bill.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-dialog/30 pb-2">
                                <span className="text-dialog-muted">Discount ({discountPercent}%)</span>
                                <span className="font-semibold text-overview-danger">-₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-dialog/30 pb-2">
                                <span className="text-dialog-muted">Tax ({taxPercent}%)</span>
                                <span className="font-semibold text-overview-success">+₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold bg-dialog p-3 rounded-lg border border-dialog/50">
                                <span className="text-dialog">Net Amount</span>
                                <span className="text-overview-teal">₹{netAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-dialog/30 pb-2">
                                <span className="text-dialog-muted">Paid Amount</span>
                                <span className="font-semibold text-overview-success">₹{totalPaid.toFixed(2)}</span>
                            </div>
                            <div className={`flex justify-between text-base font-bold p-3 rounded-lg border ${dueAmount > 0 ? "bg-overview-danger/10 border-overview-danger/30" : "bg-overview-success/10 border-overview-success/30"}`}>
                                <span className={dueAmount > 0 ? "text-overview-danger" : "text-overview-success"}>Due Amount</span>
                                <span className={dueAmount > 0 ? "text-overview-danger" : "text-overview-success"}>₹{dueAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PAYMENT FORM */}
                    <Card className="bg-dialog-surface border-dialog">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-dialog flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                ADD PAYMENT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payment-date" className="text-xs text-dialog-muted font-bold">Payment Date</Label>
                                    <Input
                                        id="payment-date"
                                        type="date"
                                        value={paymentData.date}
                                        onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                        className="bg-dialog-input border-dialog text-dialog"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment-amount" className="text-xs text-dialog-muted font-bold">Amount</Label>
                                    <Input
                                        id="payment-amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                                        className="bg-dialog-input border-dialog text-dialog"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment-mode" className="text-xs text-dialog-muted font-bold">Payment Mode</Label>
                                    <Select value={paymentData.mode} onValueChange={(mode) => setPaymentData({ ...paymentData, mode })}>
                                        <SelectTrigger id="payment-mode" className="bg-dialog-input border-dialog text-dialog">
                                            <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dialog-surface border-dialog">
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference-no" className="text-xs text-dialog-muted font-bold">Reference No</Label>
                                    <Input
                                        id="reference-no"
                                        placeholder="Trans ID / Cheque No"
                                        value={paymentData.referenceNo}
                                        onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
                                        disabled={paymentData.mode === "Cash"}
                                        className="bg-dialog-input border-dialog text-dialog"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-note" className="text-xs text-dialog-muted font-bold">Note</Label>
                                <Input
                                    id="payment-note"
                                    placeholder="Additional notes"
                                    value={paymentData.note}
                                    onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                    className="bg-dialog-input border-dialog text-dialog"
                                />
                            </div>
                            <Button onClick={handleAddPayment} className="w-full bg-overview-info hover:bg-overview-info/90 text-white font-semibold gap-2">
                                <Save className="h-4 w-4" />
                                Record Payment
                            </Button>
                        </CardContent>
                    </Card>

                    {/* TRANSACTION HISTORY */}
                    {transactions.length > 0 && (
                        <Card className="bg-dialog-surface border-dialog">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-dialog flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    PAYMENT HISTORY
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-dialog hover:bg-transparent">
                                                <TableHead className="text-dialog-muted text-xs font-bold">Date</TableHead>
                                                <TableHead className="text-dialog-muted text-xs font-bold">Mode</TableHead>
                                                <TableHead className="text-dialog-muted text-xs font-bold">Amount</TableHead>
                                                <TableHead className="text-dialog-muted text-xs font-bold">Reference</TableHead>
                                                <TableHead className="text-right text-dialog-muted text-xs font-bold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((trx) => (
                                                <TableRow key={trx.id} className="border-dialog hover:bg-overview-muted">
                                                    <TableCell className="text-sm text-dialog font-medium">
                                                        {format(new Date(trx.date), "dd MMM yyyy")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="text-[10px] uppercase font-bold" variant="secondary">
                                                            {trx.mode}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-bold text-overview-success">₹{trx.amount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-xs text-dialog-muted font-mono">{trx.note || "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteTrx(trx.id, trx.amount)}
                                                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* DELETE CONFIRMATION */}
                {deleteConfirm && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Card className="bg-dialog border-dialog max-w-sm">
                            <CardHeader>
                                <CardTitle className="text-dialog flex items-center gap-2">
                                    <Info className="h-5 w-5 text-overview-warning" />
                                    Confirm Delete
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-dialog-muted">
                                    Are you sure you want to delete this transaction of <span className="font-bold text-overview-danger">₹{deleteConfirm.amount.toFixed(2)}</span>?
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 border-dialog text-dialog hover:bg-dialog-surface"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* FOOTER */}
                <div className="flex gap-3 px-6 py-4 bg-dialog-header border-t border-dialog">
                    <Button variant="outline" onClick={onClose} className="flex-1 border-dialog text-dialog hover:bg-dialog-surface">
                        Close
                    </Button>
                    <Button className="flex-1 bg-overview-info hover:bg-overview-info/90 text-white font-semibold gap-2">
                        <Printer className="h-4 w-4" />
                        Save & Print
                    </Button>
                </div>
            </div>
        </div>
    );
}
