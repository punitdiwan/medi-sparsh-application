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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

/* -------------------- TYPES -------------------- */

interface Transaction {
    id: string;
    date: string;
    mode: string;
    note: string;
    amount: number;
}

interface RadiologyPaymentDialogProps {
    open: boolean;
    onClose: () => void;
    bill: string;
}

/* -------------------- SUB-COMPONENTS -------------------- */

function SummarySection({ title, children, icon: Icon, className = "" }: { title: string; children: React.ReactNode; icon: any; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-overview-strong/50">
                <Icon className="h-4 w-4 text-primary/70" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
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
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{label}</span>
            <span className="text-sm font-medium truncate" title={String(value || "-")}>{value || "-"}</span>
        </div>
    );
}

import { getBillById, getRadiologyPaymentsByBillId, recordRadiologyPayment, deleteRadiologyPayment } from "@/lib/actions/radiologyBills";

/* -------------------- MAIN DIALOG -------------------- */

export default function RadiologyPaymentDialog({
    open,
    onClose,
    bill: billId,
}: RadiologyPaymentDialogProps) {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; amount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [billData, setBillData] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [paymentData, setPaymentData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        mode: "Cash",
        referenceNo: "",
        note: "",
    });

    const fetchBillAndPayments = async () => {
        if (!billId) return;
        setLoading(true);
        const [billRes, paymentsRes] = await Promise.all([
            getBillById(billId),
            getRadiologyPaymentsByBillId(billId)
        ]);

        if (billRes.success && billRes.data) {
            setBillData(billRes.data);
        }
        if (paymentsRes.success && paymentsRes.data) {
            setTransactions(paymentsRes.data.map((p: any) => ({
                id: p.id,
                date: new Date(p.paymentDate).toLocaleDateString(),
                mode: p.paymentMode,
                note: p.note || "",
                amount: Number(p.paymentAmount),
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open && billId) {
            fetchBillAndPayments();
        }
    }, [open, billId]);

    if (!open || !billData) return null;

    const bill = billData;
    const billNo = bill.id.substring(0, 8).toUpperCase();

    const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
    const billNetAmount = Number(bill.billNetAmount) || 0;
    const dueAmount = billNetAmount - totalPaid;

    // Calculate detailed summary amounts
    const totalBaseAmount = bill.tests?.reduce((sum: number, t: any) => sum + Number(t.price || 0), 0) || 0;
    const totalTaxAmount = bill.tests?.reduce((sum: number, t: any) => sum + (Number(t.price || 0) * Number(t.tax || 0) / 100), 0) || 0;
    const totalDiscountAmount = (Number(bill.billTotalAmount || 0) * Number(bill.billDiscount || 0)) / 100;

    const handleSaveTrx = async () => {
        if (paymentData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (paymentData.amount > dueAmount) {
            toast.error("Payment amount cannot exceed due amount");
            return;
        }

        try {
            const res = await recordRadiologyPayment(billId, {
                amount: paymentData.amount,
                mode: paymentData.mode,
                referenceNo: paymentData.referenceNo,
            });

            if (res.success) {
                toast.success("Payment recorded successfully");
                setPaymentData({
                    date: new Date().toISOString().split("T")[0],
                    amount: 0,
                    mode: "Cash",
                    referenceNo: "",
                    note: "",
                });
                fetchBillAndPayments();
            } else {
                toast.error(res.error || "Failed to record payment");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteTrx = (id: string, amount: number) => {
        setDeleteConfirm({ id, amount });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await deleteRadiologyPayment(deleteConfirm.id, billId);
            if (res.success) {
                toast.success("Transaction deleted successfully");
                fetchBillAndPayments();
            } else {
                toast.error(res.error || "Failed to delete transaction");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0 flex flex-col bg-background max-h-screen overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-dialog-header border-b border-dialog shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-lg ">
                            <CreditCard className="bg-dialog-header text-dialog-icon" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Radiology Payments</h2>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3" /> {bill.patientName}</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Bill: {billNo}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-dialog-surface text-dialog">
                    <div className="space-y-6">

                        {/* Expandable Bill Summary Card */}
                        <Card className="border-overview-strong bg-overview-card/30 shadow-sm overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                className="w-full flex items-center justify-between px-6 py-3 bg-overview-card hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <Info className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Bill Summary Details</h3>
                                        <div className="h-4 w-px bg-border hidden md:block" />
                                        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Bill:</span> {billNo}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Name:</span> {bill.patientName}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Net:</span> ₹{bill.billNetAmount}</span>
                                        </div>
                                    </div>
                                </div>
                                {isSummaryExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isSummaryExpanded && (
                                <CardContent className="p-6 border-t border-overview-strong animate-in slide-in-from-top-2 duration-300">
                                    <SummarySection title="Detailed Bill Overview" icon={Building2}>
                                        <SummaryItem label="Bill No" value={billNo} />
                                        <SummaryItem label="Patient Name" value={bill.patientName} />
                                        <SummaryItem label="Doctor Name" value={bill.doctorName} />
                                        <SummaryItem label="Generated By" value={"System"} />
                                        <SummaryItem label="Age" value={bill.patientDob ? `${new Date().getFullYear() - new Date(bill.patientDob).getFullYear()} Years` : "-"} />
                                        <SummaryItem label="Gender" value={bill.patientGender} />
                                        <SummaryItem label="Blood Group" value={bill.patientBloodGroup} />
                                        <SummaryItem label="Mobile No" value={bill.patientPhone} />
                                        <SummaryItem label="Email" value={bill.patientEmail} />
                                        <div className="col-span-2 lg:col-span-3">
                                            <SummaryItem label="Address" value={bill.patientAddress} />
                                        </div>
                                    </SummarySection>
                                </CardContent>
                            )}
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment Summary & Form */}
                            <div className="space-y-6">
                                <Card className="border-overview-strong bg-overview-card shadow-sm">
                                    <CardHeader className="py-3 px-4 border-b border-overview-strong">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                            <IndianRupee className="h-4 w-4 text-primary" />
                                            Payment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 pb-6 border-b border-dashed">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Amount</span>
                                                    <span className="font-semibold">₹{totalBaseAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Discount</span>
                                                    <span className="font-semibold text-destructive">-₹{totalDiscountAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Tax</span>
                                                    <span className="font-semibold">+₹{totalTaxAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Net Amount</span>
                                                    <span className="font-bold">₹{bill.billNetAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Paid Amount</span>
                                                    <span className="font-bold text-green-600">₹{totalPaid}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-muted-foreground/20 pt-2">
                                                    <span className="text-sm font-bold uppercase text-primary">Due Amount</span>
                                                    <span className="text-lg font-black text-primary">₹{dueAmount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Date *</Label>
                                                <Input type="date" value={paymentData.date} onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })} disabled={dueAmount <= 0} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Amount (₹) *</Label>
                                                <Input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })} disabled={dueAmount <= 0} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Mode</Label>
                                                <Select value={paymentData.mode} onValueChange={(val) => setPaymentData({ ...paymentData, mode: val })} disabled={dueAmount <= 0}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="UPI">UPI / Online</SelectItem>
                                                        <SelectItem value="Card">Card</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Reference #</Label>
                                                <Input placeholder="TXN ID" value={paymentData.referenceNo} onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })} disabled={dueAmount <= 0 || paymentData.mode === "Cash"} />
                                            </div>
                                        </div>
                                        {dueAmount <= 0 ? (
                                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-semibold text-green-700">Bill Paid Successfully</span>
                                            </div>
                                        ) : (
                                            <Button className="w-full mt-6 gap-2" onClick={handleSaveTrx}>
                                                <Save className="h-4 w-4" /> Record Payment
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Transaction History */}
                            <Card className="border-overview-strong bg-overview-card shadow-sm overflow-hidden flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-overview-strong bg-muted/20">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                            <History className="h-4 w-4 text-primary" />
                                            Transactions History
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {transactions.length} Records
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="text-xs">TRX ID</TableHead>
                                            <TableHead className="text-xs">Date</TableHead>
                                            <TableHead className="text-xs">Mode</TableHead>
                                            <TableHead className="text-xs">Amount</TableHead>
                                            <TableHead className="text-right text-xs pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => (
                                            <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-xs font-mono">{t.id}</TableCell>
                                                <TableCell className="text-xs">{t.date}</TableCell>
                                                <TableCell className="text-xs"><Badge variant="secondary" className="px-1.5 h-5 text-[10px]">{t.mode}</Badge></TableCell>
                                                <TableCell className="text-xs font-bold">₹{t.amount}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTrx(t.id, t.amount)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-dialog-header border-t border-dialog text-dialog-muted px-6 py-4 flex justify-between items-center shadow-lg relative z-10">
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Net Amount</span>
                            <span className="text-sm font-semibold">₹{bill.billNetAmount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Paid</span>
                            <span className="text-sm font-bold text-green-600">₹{totalPaid}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Due Amount</span>
                            <span className="text-sm font-bold text-destructive">₹{dueAmount}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onClose}>Close Payment View</Button>
                </div>

                {/* Delete Confirmation Dialog */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Card className="w-full max-w-md border-destructive">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                                    <Trash2 className="h-5 w-5" />
                                    Delete Transaction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Are you sure you want to delete this transaction?</p>
                                <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Amount to be deleted:</span>
                                        <span className="text-lg font-bold text-destructive">₹{deleteConfirm.amount}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">This action will update the bill status and due amount. This cannot be undone.</p>
                            </CardContent>
                            <div className="flex gap-3 p-6 border-t">
                                <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
                                <Button variant="destructive" onClick={confirmDelete} className="flex-1">Delete</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
