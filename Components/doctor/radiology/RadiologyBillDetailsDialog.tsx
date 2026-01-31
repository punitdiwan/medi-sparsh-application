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
    Activity,
    FlaskConical,
    ClipboardCheck,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface TestItem {
    id: string;
    testName: string;
    technicianName?: string;
    scanDate?: string;
    imagingCenter?: string;
    reportDate?: string;
    reportHours?: number;
    approvedBy?: string;
    approveDate?: string;
    tax: number;
    netAmount: number;
    status: "Pending" | "Scanned" | "Reported" | "Approved";
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

function TechnicianDialog({
    open,
    onClose,
    onSave,
    testName,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    testName: string;
}) {
    const [formData, setFormData] = useState({
        personName: "",
        scanDate: new Date().toISOString().split("T")[0],
        imagingCenter: "Main Radiology Wing",
    });

    const handleSave = () => {
        if (!formData.personName) {
            toast.error("Please enter technician name");
            return;
        }
        onSave(formData);
        toast.success("Technician details saved");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Technician / Scan Info</DialogTitle>
                    <p className="text-sm text-muted-foreground">{testName}</p>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Technician Name *</Label>
                        <Input value={formData.personName} onChange={(e) => setFormData({ ...formData, personName: e.target.value })} placeholder="Enter name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Scan Date *</Label>
                        <Input type="date" value={formData.scanDate} onChange={(e) => setFormData({ ...formData, scanDate: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Details</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReportEditorDialog({
    open,
    onClose,
    onSave,
    test,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    test: TestItem | null;
}) {
    const [formData, setFormData] = useState({
        approvedBy: "Dr. Radiology Expert",
        approveDate: new Date().toISOString().split("T")[0],
        findings: "",
    });

    const handleSave = () => {
        onSave(formData);
        toast.success("Report approved successfully");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add/Edit Radiology Report</DialogTitle>
                    {test && <p className="text-sm text-muted-foreground">{test.testName}</p>}
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Approved By</Label>
                            <Input value={formData.approvedBy} onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Approve Date</Label>
                            <Input type="date" value={formData.approveDate} onChange={(e) => setFormData({ ...formData, approveDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Findings / Remarks</Label>
                        <textarea
                            className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                            placeholder="Enter findings..."
                            value={formData.findings}
                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Approve Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------- MAIN DIALOG -------------------- */

export default function RadiologyBillDetailsDialog({
    open,
    onClose,
    bill: billId,
}: RadiologyBillDetailsDialogProps) {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
    const [isCollectorOpen, setIsCollectorOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

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

    const [items, setItems] = useState<TestItem[]>([
        {
            id: "1",
            testName: "X-Ray Chest PA View",
            status: "Approved",
            technicianName: "John Doe",
            scanDate: "20/01/2024",
            approvedBy: "Dr. Smith",
            approveDate: "20/01/2024",
            reportHours: 2,
            tax: 5,
            netAmount: 1575
        },
        {
            id: "2",
            testName: "CT Scan Whole Abdomen",
            status: "Pending",
            tax: 5,
            netAmount: 2100
        },
    ]);

    const handleSaveTechnician = (data: any) => {
        if (!selectedTest) return;
        setItems(prev => prev.map(item =>
            item.id === selectedTest.id
                ? { ...item, technicianName: data.personName, scanDate: data.scanDate, status: "Scanned" as const }
                : item
        ));
    };

    const handleSaveReport = (data: any) => {
        if (!selectedTest) return;
        setItems(prev => prev.map(item =>
            item.id === selectedTest.id
                ? { ...item, approvedBy: data.approvedBy, approveDate: data.approveDate, status: "Approved" as const }
                : item
        ));
    };

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
                                <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> {bill.date}</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Bill: {bill.billNo}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-dialog-surface text-dialog">
                    <div className="space-y-6">

                        {/* Expandable Summary Card - 3 Columns like Pathology */}
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
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Patient & Billing Summary</h3>
                                        <div className="h-4 w-px bg-border hidden md:block" />
                                        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Patient:</span> {bill.customerName}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Net:</span> ₹{bill.netAmount}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Due:</span> ₹{bill.balanceAmount}</span>
                                        </div>
                                    </div>
                                </div>
                                {isSummaryExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isSummaryExpanded && (
                                <CardContent className="p-6 border-t border-overview-strong animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Patient Details */}
                                        <SummarySection title="Patient Information" icon={User}>
                                            <SummaryItem label="Patient Name" value={bill.customerName} />
                                            <SummaryItem label="Mobile No" value={bill.customerPhone} />
                                            <SummaryItem label="Age" value={bill.age} />
                                            <SummaryItem label="Gender" value={bill.gender} />
                                            <SummaryItem label="Blood Group" value={bill.bloodGroup} />
                                            <SummaryItem label="Prescription No" value={bill.prescriptionNo} />
                                            <SummaryItem label="Email" value={bill.email} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Address" value={bill.address} />
                                            </div>
                                        </SummarySection>

                                        {/* Billing Details */}
                                        <SummarySection title="Billing Details" icon={Building2}>
                                            <SummaryItem label="Doctor Name" value={bill.doctorName} />
                                            <SummaryItem label="Generated By" value={bill.generatedBy} />
                                            <SummaryItem label="Bill No" value={bill.billNo} />
                                            <SummaryItem label="Bill Date" value={bill.date} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Note" value={bill.note} />
                                            </div>
                                        </SummarySection>

                                        {/* Payment Summary */}
                                        <SummarySection title="Payment Summary" icon={ClipboardCheck}>
                                            <SummaryItem label="Total" value={`₹${bill.totalAmount}`} />
                                            <SummaryItem label="Total Discount" value={`₹${bill.totalDiscount || 0}`} />
                                            <SummaryItem label="Total Tax" value={`₹${bill.totalTax || 0}`} />
                                            <SummaryItem label="Net Amount" value={`₹${bill.netAmount}`} />
                                            <SummaryItem label="Total Deposit" value={`₹${bill.totalDeposit || 0}`} />
                                            <div className="col-span-2">
                                                <div className="flex items-center justify-between p-2 bg-primary/5 rounded border border-primary/20 mt-1">
                                                    <span className="text-xs font-bold uppercase text-primary">Balance Amount</span>
                                                    <span className="text-base font-bold text-primary">₹{bill.balanceAmount || 0}</span>
                                                </div>
                                            </div>
                                        </SummarySection>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Applied Tests Table - Matching Pathology UI */}
                        <Card className="border-none bg-overview-card shadow-sm overflow-hidden">
                            <CardHeader className="bg-overview-card border-overview-strong border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Camera className="h-5 w-5 text-primary" />
                                        Applied Tests
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {items.length} Total Tests
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toast.info("Printing all reports...")}
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead>Test Name</TableHead>
                                                <TableHead>Technician Assigned</TableHead>
                                                <TableHead>Report Hours</TableHead>
                                                <TableHead>Approved By / Date</TableHead>
                                                <TableHead className="text-center">Tax (%)</TableHead>
                                                <TableHead className="text-right">Net Amount</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right pr-6">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium py-4">{item.testName}</TableCell>
                                                    <TableCell>
                                                        {item.technicianName ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium">{item.technicianName}</span>
                                                                <span className="text-[10px] text-muted-foreground">{item.scanDate}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Not Assigned</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.reportHours ? (
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-sm font-medium">{item.reportHours}</span>
                                                                <span className="text-[10px] text-muted-foreground">hours</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.approvedBy ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium">{item.approvedBy}</span>
                                                                <span className="text-[10px] text-muted-foreground">{item.approveDate}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">{item.tax}</TableCell>
                                                    <TableCell className="text-right font-semibold">₹{item.netAmount}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={
                                                                item.status === "Approved" ? "default" :
                                                                    item.status === "Scanned" ? "secondary" : "outline"
                                                            }
                                                            className="h-5 px-1.5 text-[10px]"
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end gap-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                            onClick={() => {
                                                                                setSelectedTest(item);
                                                                                setIsCollectorOpen(true);
                                                                            }}
                                                                        >
                                                                            <ClipboardCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Technician Assignment</TooltipContent>
                                                                </Tooltip>

                                                                {item.technicianName && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                                onClick={() => {
                                                                                    setSelectedTest(item);
                                                                                    setIsReportOpen(true);
                                                                                }}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Add/Edit Report</TooltipContent>
                                                                    </Tooltip>
                                                                )}

                                                                {item.approvedBy && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                                                onClick={() => toast.info("Printing report...")}
                                                                            >
                                                                                <Printer className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Print Report</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-dialog-header border-t border-dialog text-dialog-muted px-6 py-4 flex justify-between items-center shadow-lg relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Customer</span>
                            <span className="text-sm font-semibold">{bill.customerName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Balance Amount</span>
                            <span className="text-sm font-bold text-destructive">₹{bill.balanceAmount || 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Close View</Button>
                        <Button className="gap-2" onClick={() => toast.success("Printing bill...")}>
                            <Printer size={16} /> Print Bill
                        </Button>
                    </div>
                </div>

                {/* MODALS */}
                <TechnicianDialog
                    open={isCollectorOpen}
                    onClose={() => setIsCollectorOpen(false)}
                    onSave={handleSaveTechnician}
                    testName={selectedTest?.testName || ""}
                />

                <ReportEditorDialog
                    open={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    onSave={handleSaveReport}
                    test={selectedTest}
                />
            </div>
        </div>
    );
}
