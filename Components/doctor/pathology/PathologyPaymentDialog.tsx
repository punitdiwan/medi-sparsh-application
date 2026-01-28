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
    Info
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
import { getBillById, recordPayment } from "@/lib/actions/pathologyBills";
import { differenceInYears, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* -------------------- TYPES -------------------- */

interface Transaction {
    id: string;
    date: string;
    mode: string;
    note: string;
    amount: number;
}

interface Bill {
    id: string;
    billNo: string;
    date: string;
    customerName: string;
    customerPhone: string;
    prescriptionNo?: string;
    doctorName?: string;
    bloodGroup?: string;
    generatedBy?: string;
    note?: string;
    age?: string;
    gender?: string;
    email?: string;
    address?: string;
    totalAmount: number;
    totalDiscount: number;
    totalTax: number;
    netAmount: number;
    totalDeposit: number;
    balanceAmount: number;
}

interface PathologyPaymentDialogProps {
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

/* -------------------- MAIN DIALOG -------------------- */

export default function PathologyPaymentDialog({
    open,
    onClose,
    bill: billId,
}: PathologyPaymentDialogProps) {
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
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

    // Initialize detailed items from bill when it changes
    useEffect(() => {
        const fetchBillDetails = async () => {
            if (!billId || !open) return;
            try {
                setLoading(true);
                const result = await getBillById(billId);
                if (result.success && result.data) {
                    setBillData(result.data);

                    const history: Transaction[] = result.data.payments.map((p: any) => ({
                        id: p.id,
                        date: format(new Date(p.paymentDate), "yyyy-MM-dd"),
                        mode: p.paymentMode,
                        note: p.referenceNo || "",
                        amount: Number(p.paymentAmount)
                    }));
                    setTransactions(history);
                    setPaymentData(prev => ({ ...prev, amount: result.data.balanceAmount, referenceNo: "", note: "" }));
                } else {
                    toast.error(result.error || "Failed to load bill details");
                }
            } catch (error) {
                console.error("Error fetching bill details:", error);
                toast.error("An error occurred while fetching bill details");
            } finally {
                setLoading(false);
            }
        };

        fetchBillDetails();
    }, [billId, open]);

    if (!open) return null;
    if (loading) return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-xl">
                <p className="text-muted-foreground animate-pulse">Loading payment details...</p>
            </div>
        </div>
    );
    if (!billData) return null;

    const bill = {
        id: billData.id,
        billNo: billData.id.substring(0, 8).toUpperCase(),
        date: format(new Date(billData.billDate), "dd/MM/yyyy"),
        customerName: billData.patientName,
        customerPhone: billData.patientPhone,
        age: billData.patientDob ? `${differenceInYears(new Date(), new Date(billData.patientDob))} Years` : "N/A",
        gender: billData.patientGender,
        email: billData.patientEmail,
        address: billData.patientAddress,
        bloodGroup: billData.patientBloodGroup,
        doctorName: billData.doctorName,
        generatedBy: "System",
        note: billData.remarks,
        totalAmount: Number(billData.billTotalAmount),
        totalDiscount: Number(billData.billDiscount),
        totalTax: 0,
        netAmount: Number(billData.billNetAmount),
        totalDeposit: billData.totalPaid,
        balanceAmount: billData.balanceAmount,
    };

    const handleAddPayment = async () => {
        if (paymentData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (paymentData.mode !== "Cash" && !paymentData.referenceNo) {
            toast.error("Please enter Reference # for non-cash payments");
            return;
        }

        try {
            const result = await recordPayment(billId, {
                amount: paymentData.amount,
                mode: paymentData.mode,
                referenceNo: paymentData.referenceNo || paymentData.note
            });

            if (result.success) {
                toast.success("Payment added successfully");
                // Refresh data
                const updated = await getBillById(billId);
                if (updated.success && updated.data) {
                    setBillData(updated.data);
                    const history: Transaction[] = updated.data.payments.map((p: any) => ({
                        id: p.id,
                        date: format(new Date(p.paymentDate), "yyyy-MM-dd"),
                        mode: p.paymentMode,
                        note: p.referenceNo || "",
                        amount: Number(p.paymentAmount)
                    }));
                    setTransactions(history);
                    setPaymentData({
                        date: new Date().toISOString().split("T")[0],
                        amount: updated.data.balanceAmount,
                        mode: "Cash",
                        referenceNo: "",
                        note: "",
                    });
                }
            } else {
                toast.error(result.error || "Failed to save payment");
            }
        } catch (error) {
            console.error("Error saving payment:", error);
            toast.error("An error occurred while saving payment");
        }
    };

    const handleDeleteTrx = (id: string) => {
        // In real app, call a delete action
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success("Transaction deleted (Mock - deletion action needed)");
    };

    const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
    const dueAmount = bill.netAmount - totalPaid;

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
                            <h2 className="text-xl font-bold">Add/Edit Payment</h2>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3" /> {bill.customerName}</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Bill: {bill.billNo}</span>
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
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Bill:</span> {bill.billNo}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Name:</span> {bill.customerName}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Net:</span> ₹{bill.netAmount}</span>
                                        </div>
                                    </div>
                                </div>
                                {isSummaryExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isSummaryExpanded && (
                                <CardContent className="p-6 border-t border-overview-strong animate-in slide-in-from-top-2 duration-300">
                                    <SummarySection title="Detailed Bill Overview" icon={Building2}>
                                        <SummaryItem label="Bill No" value={bill.billNo} />
                                        <SummaryItem label="Patient Name" value={bill.customerName} />
                                        <SummaryItem label="Doctor Name" value={bill.doctorName} />
                                        <SummaryItem label="Generated By" value={bill.generatedBy} />
                                        <SummaryItem label="Age" value={bill.age} />
                                        <SummaryItem label="Gender" value={bill.gender} />
                                        <SummaryItem label="Blood Group" value={bill.bloodGroup} />
                                        <SummaryItem label="Mobile No" value={bill.customerPhone} />
                                        <SummaryItem label="Email" value={bill.email} />
                                        <div className="col-span-2 lg:col-span-3">
                                            <SummaryItem label="Address" value={bill.address} />
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
                                                    <span className="font-semibold">₹{bill.totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Discount</span>
                                                    <span className="font-semibold text-destructive">-₹{bill.totalDiscount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Tax</span>
                                                    <span className="font-semibold">+₹{bill.totalTax}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Net Amount</span>
                                                    <span className="font-bold">₹{bill.netAmount}</span>
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
                                                <Input
                                                    type="date"
                                                    value={paymentData.date}
                                                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Amount (₹) *</Label>
                                                <Input
                                                    type="number"
                                                    value={paymentData.amount}
                                                    onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs">Payment Mode</Label>
                                                <Select
                                                    value={paymentData.mode}
                                                    onValueChange={(val) => setPaymentData({ ...paymentData, mode: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Mode" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Card">Card</SelectItem>
                                                        <SelectItem value="Online">Online / UPI</SelectItem>
                                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Either show Note (for Cash) or Reference # (for other modes) */}
                                            {paymentData.mode === "Cash" ? (
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Note</Label>
                                                    <Input
                                                        placeholder="Optional note"
                                                        value={paymentData.note}
                                                        onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Reference #</Label>
                                                    <Input
                                                        placeholder="Reference number / transaction id"
                                                        value={paymentData.referenceNo}
                                                        onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {/* Shift note to next row for non-cash modes */}
                                            {paymentData.mode !== "Cash" && (
                                                <div className="col-span-2 mt-2">
                                                    <Label className="text-xs">Note</Label>
                                                    <Input
                                                        placeholder="Optional note"
                                                        value={paymentData.note}
                                                        onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <Button className="w-full mt-6 gap-2" onClick={handleAddPayment}>
                                            <Save className="h-4 w-4" /> Save Transaction
                                        </Button>
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
                                <CardContent className="p-0 flex-1">
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
                                            {transactions.length > 0 ? (
                                                transactions.map((t) => (
                                                    <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="text-xs font-mono">{t.id}</TableCell>
                                                        <TableCell className="text-xs">{t.date}</TableCell>
                                                        <TableCell className="text-xs">
                                                            <Badge variant="secondary" className="px-1.5 h-5 text-[10px]">
                                                                {t.mode}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-bold font-mono">₹{t.amount}</TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            <div className="flex justify-end gap-1">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                                                                                <Printer className="h-3 w-3" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            Print
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                                onClick={() => handleDeleteTrx(t.id)}>
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            Delete
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic text-sm">
                                                        No transactions found for this bill.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-dialog-header border-t border-dialog text-dialog-muted px-6 py-4 flex justify-between items-center shadow-lg relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Net Amount</span>
                            <span className="text-sm font-semibold">₹{bill.netAmount}</span>
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
                    <Button variant="outline" onClick={onClose} className="gap-2">
                        Close Payment View
                    </Button>
                </div>
            </div>
        </div>
    );
}
