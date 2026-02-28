"use client";

import React, { useState, useEffect } from "react";
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
    Camera,
    Eye,
    FileUp,
    FileText,
    XCircle
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
import { pdf } from "@react-pdf/renderer";
import { RadiologyTestReportPdf } from "@/Components/pdf/RadiologyTestReportPdf";
import { RadiologyBillPdf } from "@/Components/pdf/radiologyBillPdf";
import { format } from "date-fns";

/* -------------------- TYPES -------------------- */

interface TestParameter {
    id: string;
    name: string;
    value: string;
    range: string;
}

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
    findings?: string;
    reportFileName?: string;
    reportFilePath?: string;
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
    test,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    test: TestItem | null;
}) {
    const [formData, setFormData] = useState({
        personName: "",
        scanDate: new Date().toISOString().split("T")[0],
        imagingCenter: "Main Radiology Wing",
    });

    useEffect(() => {
        if (open && test) {
            setFormData({
                personName: test.technicianName || "",
                scanDate: test.scanDate || new Date().toISOString().split("T")[0],
                imagingCenter: "Main Radiology Wing",
            });
        }
    }, [open, test]);

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
            <DialogContent className="sm:max-w-md border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                    <DialogTitle>Assign Technician / Scan Info</DialogTitle>
                    {test && <p className="text-sm text-muted-foreground">{test.testName}</p>}
                </DialogHeader>
                <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto ">
                    <div className="space-y-2">
                        <Label>Technician Name *</Label>
                        <Input value={formData.personName} onChange={(e) => setFormData({ ...formData, personName: e.target.value })} placeholder="Enter name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Scan Date *</Label>
                        <Input type="date" value={formData.scanDate} onChange={(e) => setFormData({ ...formData, scanDate: e.target.value })} />
                    </div>
                </div>
                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                    <Button variant="outline" onClick={onClose}
                        className="text-dialog-muted">Cancel</Button>
                    <Button onClick={handleSave}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">Save Details</Button>
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
    patientId,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    test: TestItem | null;
    patientId?: string;
}) {
    const [formData, setFormData] = useState({
        approvedBy: "Dr. Radiology Expert",
        approveDate: new Date().toISOString().split("T")[0],
        findings: "",
        parameterValues: [] as TestParameter[],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingParams, setIsLoadingParams] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingFileName, setExistingFileName] = useState<string>("");
    const [existingFilePath, setExistingFilePath] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!open || !test) {
            setFormData({
                approvedBy: "Dr. Radiology Expert",
                approveDate: new Date().toISOString().split("T")[0],
                findings: "",
                parameterValues: [],
            });
            setSelectedFile(null);
            setExistingFileName("");
            setExistingFilePath("");
            return;
        }

        const loadData = async () => {
            setIsLoadingParams(true);
            try {
                // Fetch default parameters for this test
                const paramsRes = await getParametersByOrderTest(test.id);
                let parameters: TestParameter[] = [];
                if (paramsRes.success && paramsRes.data) {
                    parameters = paramsRes.data.map((p: any) => ({
                        id: p.id,
                        name: p.paramName,
                        value: "",
                        range: `${p.fromRange} - ${p.toRange}`,
                    }));
                }

                // Fetch existing result data
                const reportRes = await getReportByOrderTest(test.id);
                if (reportRes.success && reportRes.data) {
                    const reportData = reportRes.data;
                    const savedValues = reportData.parameterValues || [];

                    setFormData({
                        approvedBy: reportData.approvedBy || "Dr. Radiology Expert",
                        approveDate: reportData.approvedAt
                            ? new Date(reportData.approvedAt).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        findings: reportData.remarks || "",
                        parameterValues: parameters.map(p => {
                            const savedVal = savedValues.find((sv: any) => sv.parameterID === p.id);
                            return { ...p, value: savedVal?.resultValue || "" };
                        }),
                    });
                    
                    // Load existing file info
                    setExistingFileName(reportData.reportFileName || "");
                    setExistingFilePath(reportData.reportFilePath || "");
                } else {
                    setFormData(prev => ({ ...prev, parameterValues: parameters }));
                    setExistingFileName("");
                    setExistingFilePath("");
                }
            } catch (error) {
                console.error("Error loading report data:", error);
                toast.error("Failed to load parameters");
            } finally {
                setIsLoadingParams(false);
            }
        };

        loadData();
    }, [open, test]);

    const handleSave = async () => {
        if (!formData.approvedBy || !formData.approveDate) {
            toast.error("Please fill in Approved By and Approve Date");
            return;
        }

        const hasParameterValues = formData.parameterValues.some(p => p.value.trim() !== "");
        if (!hasParameterValues) {
            toast.error("Please fill in at least one test parameter value");
            return;
        }

        setIsLoading(true);
        try {
            let reportFileName: string | undefined = existingFileName || undefined;
            let reportFilePath: string | undefined = existingFilePath || undefined;

            // If no existing file and new file selected, upload it
            if (selectedFile && patientId) {
                setIsUploading(true);
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", selectedFile);
                    uploadFormData.append("patientId", patientId);

                    const uploadRes = await fetch("/api/upload/radiology-report", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    const uploadData = await uploadRes.json();
                    if (!uploadData.success) {
                        toast.error(uploadData.error || "Failed to upload report file");
                        return;
                    }

                    reportFileName = uploadData.data.fileName;
                    reportFilePath = uploadData.data.fileUrl;
                } catch (error) {
                    console.error("Error uploading file:", error);
                    toast.error("Failed to upload report file");
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            // If existing file was deleted (empty strings), pass empty strings to clear in DB
            if (!existingFileName && !existingFilePath && !selectedFile) {
                reportFileName = "";
                reportFilePath = "";
            }

            await onSave({
                ...formData,
                reportFileName,
                reportFilePath,
            });
            onClose();
        } catch (error) {
            console.error("Error saving report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!test) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl border border-dialog bg-dialog-surface p-0 overflow-y-auto">
                <DialogHeader className="p-6 bg-dialog-header text-header border-b border-dialog">
                    <DialogTitle>Add/Edit Radiology Report</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                        <div>
                            <Label className="text-xs text-muted-foreground">Test Name</Label>
                            <p className="font-medium text-sm">{test.testName}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Technician</Label>
                            <p className="font-medium text-sm">{test.technicianName || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Scan Date</Label>
                            <p className="font-medium text-sm">{test.scanDate || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <Label>Approved By *</Label>
                            <Input
                                value={formData.approvedBy}
                                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                                placeholder="Dr. Name"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Approve Date *</Label>
                            <Input
                                type="date"
                                value={formData.approveDate}
                                onChange={(e) => setFormData({ ...formData, approveDate: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Findings / Remarks</Label>
                            <textarea
                                className="w-full min-h-[100px] p-2 border rounded-md text-sm bg-background"
                                placeholder="Enter findings..."
                                value={formData.findings}
                                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                            <FileUp className="h-4 w-4 text-primary" />
                            Upload Report (JPEG/PNG/PDF)
                        </h3>
                        
                        {existingFilePath ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-green-800">{existingFileName}</span>
                                        <span className="text-xs text-green-600">Report uploaded</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-green-700 border-green-300 hover:bg-green-100"
                                        onClick={() => window.open(existingFilePath, "_blank")}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={async () => {
                                            if (existingFilePath) {
                                                try {
                                                    const deleteRes = await fetch(
                                                        `/api/upload/radiology-report?filePath=${encodeURIComponent(existingFilePath)}`,
                                                        { method: "DELETE" }
                                                    );
                                                    const deleteData = await deleteRes.json();
                                                    if (!deleteData.success) {
                                                        toast.error(deleteData.error || "Failed to delete file");
                                                        return;
                                                    }
                                                } catch (error) {
                                                    console.error("Error deleting file:", error);
                                                    toast.error("Failed to delete file");
                                                    return;
                                                }
                                            }
                                            setExistingFileName("");
                                            setExistingFilePath("");
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : selectedFile ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-blue-800">{selectedFile.name}</span>
                                        <span className="text-xs text-blue-600">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                    <FileUp className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Choose File</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".jpeg,.jpg,.png,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
                                                if (!allowedTypes.includes(file.type)) {
                                                    toast.error("Only JPEG, PNG, and PDF files are allowed");
                                                    return;
                                                }
                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error("File size must be less than 10MB");
                                                    return;
                                                }
                                                setSelectedFile(file);
                                            }
                                        }}
                                        disabled={isLoading}
                                    />
                                </label>
                                <span className="text-xs text-gray-500">Max size: 10MB (JPEG, PNG, PDF)</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-primary" />
                            Test Parameters
                        </h3>
                        {isLoadingParams ? (
                            <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                                <p className="text-muted-foreground animate-pulse">Loading parameters...</p>
                            </div>
                        ) : formData.parameterValues.length === 0 ? (
                            <div className="border rounded-lg p-4 bg-muted/30 text-center">
                                <p className="text-muted-foreground text-sm">No parameters found for this test</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden border-dialog">
                                <Table>
                                    <TableHeader className="bg-muted/50 border-b border-dialog">
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Test Parameter Name</TableHead>
                                            <TableHead className="w-[200px]">Report Value *</TableHead>
                                            <TableHead>Reference Range</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.parameterValues.map((p, idx) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={p.value}
                                                        onChange={(e) => {
                                                            const newVals = [...formData.parameterValues];
                                                            newVals[idx].value = e.target.value;
                                                            setFormData({ ...formData, parameterValues: newVals });
                                                        }}
                                                        className="h-8"
                                                        disabled={isLoading}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{p.range}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        className="bg-primary text-primary-foreground hover:opacity-90"
                        disabled={isLoading || isUploading}
                    >
                        {isLoading || isUploading ? "Saving..." : "Save Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { getBillById } from "@/lib/actions/radiologyBills";
import {
    saveRadiologyTechnician,
    saveRadiologyReport,
    getParametersByOrderTest,
    getReportByOrderTest
} from "@/lib/actions/radiologyResults";

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
    const [loading, setLoading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const [billData, setBillData] = useState<any>(null);
    const [items, setItems] = useState<TestItem[]>([]);

    const fetchBill = async () => {
        setLoading(true);
        const res = await getBillById(billId);
        if (res.success && res.data) {
            setBillData(res.data);
            setItems(res.data.tests.map((t: any) => ({
                id: t.id,
                testName: t.testName,
                status: t.status || "Pending",
                reportHours: t.reportHours,
                tax: Number(t.tax),
                netAmount: Number(t.price) + (Number(t.price) * Number(t.tax) / 100),
                technicianName: t.technicianName,
                scanDate: t.scanDate ? new Date(t.scanDate).toISOString().split("T")[0] : undefined,
                approvedBy: t.approvedBy,
                approveDate: t.approveDate ? new Date(t.approveDate).toISOString().split("T")[0] : undefined,
                findings: t.findings,
                reportFileName: t.reportFileName,
                reportFilePath: t.reportFilePath,
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open && billId) {
            fetchBill();
        }
    }, [open, billId]);

    const handleSaveTechnician = async (data: any) => {
        if (!selectedTest) return;

        const res = await saveRadiologyTechnician({
            orderTestId: selectedTest.id,
            technicianName: data.personName,
            scanDate: new Date(data.scanDate),
        });

        if (res.success) {
            toast.success(res.message);
            fetchBill();
        } else {
            toast.error(res.error || "Failed to save technician");
        }
    };

    const handleSaveReport = async (data: any) => {
        if (!selectedTest) return;

        const res = await saveRadiologyReport({
            orderTestId: selectedTest.id,
            approvedBy: data.approvedBy,
            approveDate: new Date(data.approveDate),
            findings: data.findings,
            parameterValues: data.parameterValues,
            reportFileName: data.reportFileName,
            reportFilePath: data.reportFilePath,
        });

        if (res.success) {
            toast.success(res.message);
            fetchBill();
        } else {
            toast.error(res.error || "Failed to save report");
        }
    };

    const handlePrintReport = async (testItems: TestItem[]) => {
        try {
            setIsPrinting(true);
            toast.loading("Preparing Radiology Report PDF...", { id: "print-report" });

            // Ensure all test items have parameters loaded
            const reportsData = await Promise.all(testItems.map(async (item) => {
                let parameters: any[] = [];

                const paramsResult = await getParametersByOrderTest(item.id);
                const reportResult = await getReportByOrderTest(item.id);

                if (paramsResult.success && paramsResult.data) {
                    const reportData = reportResult.success ? reportResult.data : null;
                    const paramValues = reportData?.parameterValues || [];

                    parameters = paramsResult.data.map((p: any) => {
                        const valObj = paramValues.find((pv: any) => pv.parameterID === p.id);
                        return {
                            id: p.id,
                            name: p.paramName,
                            value: valObj?.resultValue || "N/A",
                            range: `${p.fromRange} - ${p.toRange}`,
                        };
                    });
                }

                return {
                    testName: item.testName,
                    technicianName: item.technicianName,
                    scanDate: item.scanDate,
                    approvedBy: item.approvedBy,
                    approveDate: item.approveDate,
                    findings: item.findings,
                    parameters: parameters
                };
            }));

            const pdfDoc = (
                <RadiologyTestReportPdf
                    patient={{
                        name: bill.patientName,
                        phone: bill.patientPhone,
                        age: bill.patientDob ? `${new Date().getFullYear() - new Date(bill.patientDob).getFullYear()} Years` : "-",
                        gender: bill.patientGender,
                        address: bill.patientAddress
                    }}
                    billDetails={{
                        billNo: bill.id.substring(0, 8).toUpperCase(),
                        date: format(new Date(bill.billDate), "dd/MM/yyyy")
                    }}
                    reports={reportsData}
                    organization={billData.organization}
                    orgModeCheck={true}
                    doctorName={bill.doctorName}
                />
            );

            const blob = await pdf(pdfDoc).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            toast.success("Radiology report ready", { id: "print-report" });
        } catch (error) {
            console.error("Error generating report PDF:", error);
            toast.error("Failed to generate report PDF", { id: "print-report" });
        } finally {
            setIsPrinting(false);
        }
    };

    const handlePrintBill = async () => {
        try {
            toast.loading("Preparing Bill PDF...", { id: "print-bill" });
            const pdfDoc = (
                <RadiologyBillPdf
                    billNumber={bill.id.substring(0, 8).toUpperCase()}
                    billDate={format(new Date(bill.billDate), "dd/MM/yyyy")}
                    customerName={bill.patientName}
                    customerPhone={bill.patientPhone}
                    paymentMode={bill.payments?.[0]?.paymentMode || "Cash"}
                    items={bill.tests.map((t: any) => {
                        const price = Number(t.price) || 0;
                        const taxPercent = Number(t.tax) || 0;
                        const taxAmount = (price * taxPercent) / 100;
                        const total = price + taxAmount;
                        return {
                            testName: t.testName,
                            price,
                            tax: taxPercent,
                            total,
                        };
                    })}
                    discount={Number(bill.billDiscount)}
                    organization={billData.organization}
                    orgModeCheck={true}
                    payments={billData.payments?.map((p: any) => ({
                        date: format(new Date(p.paymentDate), "dd/MM/yyyy"),
                        amount: Number(p.paymentAmount),
                        mode: p.paymentMode,
                    })) || []}
                    totalPaid={billData.totalPaid}
                    balanceAmount={billData.balanceAmount}
                    doctorName={billData.doctorName || ""}
                />
            );

            const blob = await pdf(pdfDoc).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            toast.success("Bill ready for printing", { id: "print-bill" });
        } catch (error) {
            console.error("Print error:", error);
            toast.error("Failed to generate PDF", { id: "print-bill" });
        }
    };

    if (!open || !billData) return null;

    const bill = billData;
    const billNo = bill.id.substring(0, 8).toUpperCase();
    const formattedDate = bill.billDate ? new Date(bill.billDate).toLocaleDateString() : "";

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
                                <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3" /> {bill.patientName}</span>
                                <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> {formattedDate}</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Bill: {billNo}</span>
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
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Patient:</span> {bill.patientName}</span>
                                            <span><span className="text-[10px] uppercase opacity-70 mr-1">Net:</span> ₹{bill.billNetAmount}</span>
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
                                            <SummaryItem label="Patient Name" value={bill.patientName} />
                                            <SummaryItem label="Mobile No" value={bill.patientPhone} />
                                            <SummaryItem label="Age" value={bill.patientDob ? `${new Date().getFullYear() - new Date(bill.patientDob).getFullYear()} Years` : "-"} />
                                            <SummaryItem label="Gender" value={bill.patientGender} />
                                            <SummaryItem label="Blood Group" value={bill.patientBloodGroup} />
                                            <SummaryItem label="Prescription No" value={"-"} />
                                            <SummaryItem label="Email" value={bill.patientEmail} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Address" value={bill.patientAddress} />
                                            </div>
                                        </SummarySection>

                                        {/* Billing Details */}
                                        <SummarySection title="Billing Details" icon={Building2}>
                                            <SummaryItem label="Doctor Name" value={bill.doctorName} />
                                            <SummaryItem label="Generated By" value={"System"} />
                                            <SummaryItem label="Bill No" value={billNo} />
                                            <SummaryItem label="Bill Date" value={formattedDate} />
                                            <div className="col-span-2">
                                                <SummaryItem label="Note" value={bill.remarks} />
                                            </div>
                                        </SummarySection>

                                        {/* Payment Summary */}
                                        <SummarySection title="Payment Summary" icon={ClipboardCheck}>
                                            <SummaryItem label="Total" value={`₹${bill.billTotalAmount}`} />
                                            <SummaryItem label="Total Discount" value={`₹${bill.billDiscount || 0}`} />
                                            <SummaryItem label="Total Tax" value={`₹${bill.totalTax || 0}`} />
                                            <SummaryItem label="Net Amount" value={`₹${bill.billNetAmount}`} />
                                            <SummaryItem label="Total Deposit" value={`₹${bill.totalPaid || 0}`} />
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
                                            onClick={() => handlePrintReport(items.filter(i => i.status === "Approved"))}
                                            disabled={isPrinting || items.filter(i => i.status === "Approved").length === 0}
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
                                                                                onClick={() => handlePrintReport([item])}
                                                                                disabled={isPrinting}
                                                                            >
                                                                                <Printer className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Print Report</TooltipContent>
                                                                    </Tooltip>
                                                                )}

                                                                {item.reportFilePath && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                                                onClick={() => window.open(item.reportFilePath, "_blank")}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>View Uploaded Report</TooltipContent>
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
                            <span className="text-sm font-semibold">{bill.patientName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Balance Amount</span>
                            <span className="text-sm font-bold text-destructive">₹{bill.balanceAmount || 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Close View</Button>
                        <Button className="gap-2" onClick={handlePrintBill}>
                            <Printer size={16} /> Print Bill
                        </Button>
                    </div>
                </div>

                {/* MODALS */}
                <TechnicianDialog
                    open={isCollectorOpen}
                    onClose={() => setIsCollectorOpen(false)}
                    onSave={handleSaveTechnician}
                    test={selectedTest}
                />

                <ReportEditorDialog
                    open={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    onSave={handleSaveReport}
                    test={selectedTest}
                    patientId={billData?.patientId}
                />
            </div>
        </div>
    );
}
