"use client";

import React, { useState } from "react";
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

/* -------------------- MAIN DIALOG -------------------- */

export default function RadiologyPaymentDialog({
    open,
    onClose,
    bill: billId,
}: RadiologyPaymentDialogProps) {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

    // Dummy Data
    const bill = {
        id: billId || "RAD-00100200",
        billNo: (billId || "RAD-00100200").substring(0, 8).toUpperCase(),
        date: "20/01/2024",
        customerName: "Rajesh Kumar",
        customerPhone: "9876543210",
        age: "35 Years",
        gender: "Male",
        doctorName: "Dr. Amit Sharma",
        netAmount: 3675,
        totalPaid: 3675,
        balanceAmount: 0,
    };

    const transactions: Transaction[] = [
        { id: "TXN001", date: "2024-01-20", mode: "Cash", note: "Initial Payment", amount: 3675 },
    ];

    const [paymentData, setPaymentData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        mode: "Cash",
        referenceNo: "",
        note: "",
    });

    if (!open) return null;

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
                            <h2 className="text-xl font-bold">Radiology Payments</h2>
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
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Bill Summary</h3>
                                </div>
                                {isSummaryExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isSummaryExpanded && (
                                <CardContent className="p-6 border-t border-overview-strong animate-in slide-in-from-top-2 duration-300">
                                    <SummarySection title="Quick Overview" icon={Building2}>
                                        <SummaryItem label="Bill No" value={bill.billNo} />
                                        <SummaryItem label="Patient" value={bill.customerName} />
                                        <SummaryItem label="Doctor" value={bill.doctorName} />
                                        <SummaryItem label="Net Amount" value={`₹${bill.netAmount}`} />
                                    </SummarySection>
                                </CardContent>
                            )}
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment Form */}
                            <div className="space-y-6">
                                <Card className="border-overview-strong bg-overview-card shadow-sm">
                                    <CardHeader className="py-3 px-4 border-b border-overview-strong">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                            <IndianRupee className="h-4 w-4 text-primary" />
                                            Add Payment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Date</Label>
                                                <Input type="date" value={paymentData.date} onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Amount (₹)</Label>
                                                <Input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Mode</Label>
                                                <Select value={paymentData.mode} onValueChange={(val) => setPaymentData({ ...paymentData, mode: val })}>
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
                                                <Input placeholder="TXN ID" value={paymentData.referenceNo} onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })} />
                                            </div>
                                        </div>
                                        {dueAmount <= 0 ? (
                                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-semibold text-green-700">Fully Paid</span>
                                            </div>
                                        ) : (
                                            <Button className="w-full mt-6 gap-2" onClick={() => toast.success("Dummy payment recorded")}>
                                                <Save className="h-4 w-4" /> Save Payment
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Transaction History */}
                            <Card className="border-overview-strong bg-overview-card shadow-sm overflow-hidden flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-overview-strong bg-muted/20">
                                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                        <History className="h-4 w-4 text-primary" />
                                        History
                                    </h3>
                                </CardHeader>
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="text-xs">Date</TableHead>
                                            <TableHead className="text-xs">Mode</TableHead>
                                            <TableHead className="text-xs">Amount</TableHead>
                                            <TableHead className="text-right text-xs pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="text-xs">{t.date}</TableCell>
                                                <TableCell className="text-xs"><Badge variant="secondary">{t.mode}</Badge></TableCell>
                                                <TableCell className="text-xs font-bold">₹{t.amount}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" onClick={() => toast.info("Deleting...")}>
                                                        <Trash2 size={14} className="text-destructive" />
                                                    </Button>
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
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                            <span className="text-sm font-semibold">₹{bill.netAmount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Paid</span>
                            <span className="text-sm font-bold text-green-600">₹{totalPaid}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Due</span>
                            <span className="text-sm font-bold text-destructive">₹{dueAmount}</span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
