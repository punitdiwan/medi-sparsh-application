"use client";

import React, { useState } from "react";
import {
    X,
    User,
    Calendar,
    Printer,
    Edit,
    Building2,
    Trash2,
    ChevronDown,
    ChevronUp,
    Info,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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

interface TestItem {
    id: string;
    testName: string;
    status: "Pending" | "Completed" | "Reported" | "Approved";
    price: number;
    tax: number;
    netAmount: number;
}

interface RadiologyBillDetailsDialogProps {
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
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
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

export default function RadiologyBillDetailsDialog({
    open,
    onClose,
    bill: billId,
}: RadiologyBillDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
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
        email: "rajesh@example.com",
        address: "123, Street Name, City",
        bloodGroup: "O+",
        doctorName: "Dr. Amit Sharma",
        generatedBy: "System",
        note: "Patient has history of cough",
        totalAmount: 3500,
        totalDiscount: 0,
        totalTax: 175,
        netAmount: 3675,
        totalDeposit: 3675,
        balanceAmount: 0,
        prescriptionNo: "PR-2024-001",
    };

    const items: TestItem[] = [
        { id: "1", testName: "X-Ray Chest PA View", status: "Approved", price: 1500, tax: 75, netAmount: 1575 },
        { id: "2", testName: "CT Scan Whole Abdomen", status: "Pending", price: 2000, tax: 100, netAmount: 2100 },
    ];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0 flex flex-col bg-background max-h-screen overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-dialog-header border-b border-dialog shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-lg ">
                            <Activity className="bg-dialog-header text-dialog-icon" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Radiology Bill Details</h2>
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

                        {/* Expandable Summary Card */}
                        <Card className="border-overview-strong bg-overview-card/30 shadow-sm overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                className="w-full flex items-center justify-between px-6 py-3 bg-overview-card hover:bg-muted/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <Info className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Patient & Bill Overview</h3>
                                </div>
                                {isSummaryExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isSummaryExpanded && (
                                <CardContent className="p-6 border-t border-overview-strong animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <SummarySection title="Patient Information" icon={User}>
                                            <SummaryItem label="Patient Name" value={bill.customerName} />
                                            <SummaryItem label="Phone" value={bill.customerPhone} />
                                            <SummaryItem label="Age / Gender" value={`${bill.age} / ${bill.gender}`} />
                                            <SummaryItem label="Blood Group" value={bill.bloodGroup} />
                                            <SummaryItem label="Email" value={bill.email} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Address" value={bill.address} />
                                            </div>
                                        </SummarySection>

                                        <SummarySection title="Bill Information" icon={Building2}>
                                            <SummaryItem label="Bill Date" value={bill.date} />
                                            <SummaryItem label="Prescription No" value={bill.prescriptionNo} />
                                            <SummaryItem label="Ref. Doctor" value={bill.doctorName} />
                                            <SummaryItem label="Generated By" value={bill.generatedBy} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Notes" value={bill.note} />
                                            </div>
                                        </SummarySection>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Test Items Table */}
                        <Card className="border-overview-strong bg-overview-card shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-overview-strong bg-muted/20 flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Radiology Tests
                                </h3>
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Printing report...")}>
                                    <Printer size={14} /> Print All Reports
                                </Button>
                            </div>
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Test Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Tax</TableHead>
                                        <TableHead className="text-right">Net Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="font-medium">{item.testName}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">₹{item.price}</TableCell>
                                            <TableCell className="text-right">₹{item.tax}</TableCell>
                                            <TableCell className="text-right font-bold">₹{item.netAmount}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => toast.info("Editing report...")}>
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => toast.info("Printing individual report...")}>
                                                        <Printer size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-dialog-header border-t border-dialog text-dialog-muted px-6 py-4 flex justify-between items-center shadow-lg relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sub Total</span>
                            <span className="text-sm font-semibold">₹{bill.totalAmount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Discount</span>
                            <span className="text-sm font-semibold text-destructive">-₹{bill.totalDiscount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Net Amount</span>
                            <span className="text-lg font-black text-primary">₹{bill.netAmount}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button className="gap-2" onClick={() => toast.success("Bill printed successfully")}>
                            <Printer size={16} /> Print Bill
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
