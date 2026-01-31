"use client";

import React, { useState } from "react";
import {
    X,
    FileText,
    User,
    Calendar,
    FlaskConical,
    Printer,
    Edit,
    ClipboardCheck,
    Building2,
    Trash2,
    ChevronDown,
    ChevronUp,
    Info
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
import { getBillById } from "@/lib/actions/pathologyBills";
import { saveSampleCollector, getSampleByOrderTest } from "@/lib/actions/pathologySampleCollector";
import { saveReportData, getReportByOrderTest, getParametersByOrderTest } from "@/lib/actions/pathologyReports";
import { differenceInYears, format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { PathologyTestReportPdf } from "@/Components/pdf/PathologyTestReportPdf";

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
    sampleCollectedBy?: string;
    collectedDateRaw?: Date | null;
    collectedDate?: string;
    pathologyCenter?: string;
    reportDate?: string;
    reportHours?: number;
    approvedBy?: string;
    approveDate?: string;
    tax: number;
    netAmount: number;
    parameters: TestParameter[];
    status: "Pending" | "Collected" | "Reported" | "Approved";
}

interface Bill {
    id: string;
    billNo: string;
    date: string;
    customerName: string;
    customerPhone: string;
    // Enhanced fields
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
    items: any[];
}

interface PathologyBillDetailsDialogProps {
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

function SampleCollectorDialog({
    open,
    onClose,
    onSave,
    testName,
    testId,
    billDate,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    testName: string;
    testId?: string;
    billDate?: string;
}) {
    const [formData, setFormData] = useState({
        personName: "",
        collectedDate: new Date().toISOString().split("T")[0],
        pathologyCenter: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [existingDataId, setExistingDataId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Load existing sample data when dialog opens
    React.useEffect(() => {
        if (!open || !testId) {
            // Reset form when dialog closes
            setFormData({
                personName: "",
                collectedDate: new Date().toISOString().split("T")[0],
                pathologyCenter: "",
            });
            setExistingDataId(null);
            setIsEditing(false);
            return;
        }
        const loadSampleData = async () => {
            try {
                const result = await getSampleByOrderTest(testId);
                if (result.success && result.data) {
                    setFormData({
                        personName: result.data.collectedBy || "",
                        collectedDate: result.data.sampleDate
                            ? new Date(result.data.sampleDate).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        pathologyCenter: result.data.sampleType || "",
                    });
                    // Mark that we're editing existing data
                    setExistingDataId(result.data.id || testId);
                    setIsEditing(true);
                } else {
                    // No existing data - fresh insert
                    setFormData({
                        personName: "",
                        collectedDate: new Date().toISOString().split("T")[0],
                        pathologyCenter: "",
                    });
                    setExistingDataId(null);
                    setIsEditing(false);
                }
            } catch (error) {
                console.error("Error loading sample data:", error);
                setIsEditing(false);
                setExistingDataId(null);
            }
        };

        loadSampleData();
    }, [open, testId]);

    const handleSave = async () => {
        if (!formData.personName || !formData.collectedDate || !formData.pathologyCenter) {
            toast.error("Please fill all required fields");
            return;
        }
        if (billDate && new Date(formData.collectedDate) < new Date(billDate)) {
            toast.error("Sample date cannot be earlier than bill date");
            return;
        }

        setIsLoading(true);
        try {
            // Save to database if testId is available
            if (testId) {
                const result = await saveSampleCollector({
                    orderTestId: testId,
                    personName: formData.personName,
                    collectedDate: formData.collectedDate,
                    pathologyCenter: formData.pathologyCenter,
                    isUpdate: isEditing, // Pass flag to indicate update vs insert
                    sampleId: existingDataId, // Pass existing ID for update
                });

                if (!result.success) {
                    toast.error(result.error || "Failed to save sample");
                    return;
                }
            }

            onSave(formData);
            setFormData({
                personName: "",
                collectedDate: new Date().toISOString().split("T")[0],
                pathologyCenter: "",
            });
            setExistingDataId(null);
            setIsEditing(false);
            onClose();
            toast.success(isEditing ? "Sample data updated successfully" : "Sample data saved successfully");
        } catch (error) {
            console.error("Error saving sample:", error);
            toast.error("An error occurred while saving");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border border-dialog bg-dialog-surface rounded-lg p-0">
                <DialogHeader className="px-6 py-4 rounded-t-lg bg-dialog-header text-header border-b border-dialog">
                    <DialogTitle>Add/Edit Sample Collector</DialogTitle>
                    <p className="text-sm text-muted-foreground">{testName}</p>
                </DialogHeader>
                <div className="space-y-4 px-6 py-5 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
                    <div className="space-y-2">
                        <Label htmlFor="personName">Sample Collected Person Name *</Label>
                        <Input
                            id="personName"
                            value={formData.personName}
                            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                            placeholder="Enter name"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="collectedDate">Collected Date *</Label>
                        <Input
                            id="collectedDate"
                            type="date"
                            min={billDate ? new Date(billDate).toISOString().split("T")[0] : undefined}
                            value={formData.collectedDate}
                            onChange={(e) => setFormData({ ...formData, collectedDate: e.target.value })}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pathologyCenter">Pathology Center *</Label>
                        <Input
                            id="pathologyCenter"
                            value={formData.pathologyCenter}
                            onChange={(e) => setFormData({ ...formData, pathologyCenter: e.target.value })}
                            placeholder="Enter center name"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter className="px-6 py-4 rounded-b-lg bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-dialog-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
                        disabled={!formData.personName || !formData.collectedDate || !formData.pathologyCenter || isLoading}
                    >
                        {isLoading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Details" : "Save Details")}
                    </Button>
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
        approvedBy: "",
        approveDate: new Date().toISOString().split("T")[0],
        uploadReport: "",
        result: "",
        parameterValues: [] as Array<{
            id: string;
            name: string;
            value: string;
            range: string;
        }>,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingParams, setIsLoadingParams] = useState(false);

    // Load parameters and report data when dialog opens
    React.useEffect(() => {
        if (!open || !test) {
            // Reset form when dialog closes
            setFormData({
                approvedBy: "",
                approveDate: new Date().toISOString().split("T")[0],
                uploadReport: "",
                result: "",
                parameterValues: [],
            });
            return;
        }

        const loadData = async () => {
            setIsLoadingParams(true);
            try {
                // Fetch parameters from database
                const paramsResult = await getParametersByOrderTest(test.id);
                let parameters: any[] = [];

                if (paramsResult.success && paramsResult.data) {
                    parameters = paramsResult.data.map((p: any) => ({
                        id: p.id,
                        name: p.paramName,
                        value: "",
                        range: `${p.fromRange} - ${p.toRange}`,
                    }));
                }

                // Fetch existing report data
                const reportResult = await getReportByOrderTest(test.id);
                if (reportResult.success && reportResult.data) {
                    const reportData = reportResult.data;
                    const paramValues = reportData.parameterValues || [];

                    setFormData({
                        approvedBy: reportData.approvedBy || "",
                        approveDate: reportData.approvedAt
                            ? new Date(reportData.approvedAt).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        uploadReport: "",
                        result: reportData.remarks || "",
                        parameterValues: parameters.map((p: any) => {
                            const paramValue = paramValues.find((pv: any) => pv.parameterID === p.id);
                            return {
                                ...p,
                                value: paramValue?.resultValue || "",
                            };
                        }),
                    });
                } else {
                    // No existing report, just set parameters
                    setFormData(prev => ({
                        ...prev,
                        parameterValues: parameters,
                    }));
                }
            } catch (error) {
                console.error("Error loading data:", error);
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

        setIsLoading(true);
        try {
            // Save to database
            const result = await saveReportData({
                orderTestId: currentTest.id,
                approvedBy: formData.approvedBy,
                approveDate: formData.approveDate,
                remarks: formData.result,
                parameterValues: formData.parameterValues,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to save report");
                return;
            }

            onSave(formData);
            onClose();
            toast.success("Report saved successfully");
        } catch (error) {
            console.error("Error saving report:", error);
            toast.error("An error occurred while saving report");
        } finally {
            setIsLoading(false);
        }
    };

    // Return null if no test is provided
    if (!test) {
        return null;
    }

    // Type assertion to ensure test is not null in JSX
    const currentTest = test as TestItem;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl border border-dialog bg-dialog-surface p-0 overflow-y-auto">
                <DialogHeader className="p-6 bg-dialog-header text-header border-b border-dialog">
                    <DialogTitle>Add/Edit Report</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                        <div>
                            <Label className="text-xs text-muted-foreground">Test Name</Label>
                            <p className="font-medium text-sm">{currentTest.testName}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Expected Date</Label>
                            <p className="font-medium text-sm">{currentTest.reportDate || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Approve Date</Label>
                            <p className="font-medium text-sm">{currentTest.approveDate || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Date Of Collection</Label>
                            <p className="font-medium text-sm">{currentTest.collectedDate || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Collection By</Label>
                            <p className="font-medium text-sm">{currentTest.sampleCollectedBy || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Pathology Center</Label>
                            <p className="font-medium text-sm">{currentTest.pathologyCenter || "N/A"}</p>
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
                                min={
                                    currentTest.collectedDateRaw
                                        ? format(new Date(currentTest.collectedDateRaw), "yyyy-MM-dd")
                                        : undefined
                                }
                                value={formData.approveDate}
                                onChange={(e) => setFormData({ ...formData, approveDate: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Upload Report</Label>
                            <Input
                                type="file"
                                onChange={(e) => setFormData({ ...formData, uploadReport: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Result</Label>
                            <Input
                                value={formData.result}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                placeholder="Overall summary"
                                disabled={isLoading}
                            />
                        </div>
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
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
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
                                                        disabled={isLoading || isLoadingParams}
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
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-dialog-muted">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
                        disabled={!formData.approvedBy || !formData.approveDate || isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------- MAIN DIALOG -------------------- */

export default function PathologyBillDetailsDialog({
    open,
    onClose,
    bill: billId,
}: PathologyBillDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [billData, setBillData] = useState<any>(null);
    const [items, setItems] = useState<TestItem[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
    const [isCollectorOpen, setIsCollectorOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrintReport = async (testItems: TestItem[]) => {
        try {
            setIsPrinting(true);
            toast.loading("Preparing Test Report PDF...", { id: "print-report" });

            // Ensure all test items have parameters loaded
            const reportsData = await Promise.all(testItems.map(async (item) => {
                let parameters = item.parameters || [];

                // If parameters are empty, fetch them
                if (parameters.length === 0) {
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
                }

                return {
                    testName: item.testName,
                    sampleCollectedBy: item.sampleCollectedBy,
                    collectedDate: item.collectedDate,
                    pathologyCenter: item.pathologyCenter,
                    approvedBy: item.approvedBy,
                    approveDate: item.approveDate,
                    parameters: parameters.map(p => ({
                        name: p.name,
                        value: p.value,
                        range: p.range
                    }))
                };
            }));

            const pdfDoc = (
                <PathologyTestReportPdf
                    patient={{
                        name: bill.customerName,
                        phone: bill.customerPhone,
                        age: bill.age,
                        gender: bill.gender,
                        address: bill.address
                    }}
                    billDetails={{
                        billNo: bill.billNo,
                        date: bill.date
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
            toast.success("Test report ready", { id: "print-report" });
        } catch (error) {
            console.error("Error generating report PDF:", error);
            toast.error("Failed to generate report PDF", { id: "print-report" });
        } finally {
            setIsPrinting(false);
        }
    };

    // Initialize detailed items from bill when it changes
    React.useEffect(() => {
        const fetchBillDetails = async () => {
            if (!billId || !open) return;
            try {
                setLoading(true);
                const result = await getBillById(billId);
                if (result.success && result.data) {
                    setBillData(result.data);
                    // Map items from fetched data and fetch sample info for each
                    const detailedItems: TestItem[] = await Promise.all(
                        result.data.tests.map(async (item: any, idx: number) => {
                            // Fetch sample data if exists
                            const sampleResult = await getSampleByOrderTest(item.id);
                            const sampleData = sampleResult.success ? sampleResult.data : null;
                            const approvedResult = await getReportByOrderTest(item.id);
                            const approvedData = approvedResult.success ? approvedResult?.data : null;
                            const collectedDate = sampleData?.sampleDate ? new Date(sampleData.sampleDate): null;
                            const expectedReportDate = collectedDate && item.reportHours ? new Date(collectedDate.getTime() + item.reportHours * 60 * 60 * 1000) : null;
                            const collectedDateRaw = sampleData?.sampleDate ? new Date(sampleData.sampleDate) : null;
                            return {
                                id: item.id,
                                testName: item.testName,
                                reportHours: item.reportHours,
                                tax: Number(item.tax),
                                netAmount: Number(item.price),
                                status: sampleData ? "Collected" : "Pending",
                                sampleCollectedBy: sampleData?.collectedBy || undefined,
                                collectedDateRaw,
                                collectedDate: collectedDate ? format(collectedDate, "dd/MM/yyyy ") : undefined,
                                reportDate: expectedReportDate ? format(expectedReportDate, "dd/MM/yyyy ") : undefined,
                                approvedBy: approvedData?.approvedBy || undefined,
                                approveDate: approvedData ? format(new Date(approvedData?.approvedAt), "dd/MM/yyyy") : undefined,
                                pathologyCenter: sampleData?.sampleType || undefined,
                                parameters: []
                            };
                        })
                    );
                    setItems(detailedItems);
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
                <p className="text-muted-foreground animate-pulse">Loading bill details...</p>
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
        generatedBy: "System", // Or fetch from staff
        note: billData.remarks,
        totalAmount: Number(billData.billTotalAmount),
        totalDiscount: Number(billData.billDiscount),
        totalTax: 0, // Calculate if needed
        netAmount: Number(billData.billNetAmount),
        totalDeposit: billData.totalPaid,
        balanceAmount: billData.balanceAmount,
        items: items,
        prescriptionNo: "N/A",
    };

    const handleSaveCollector = (data: any) => {
        if (!selectedTest) return;
        setItems(prev => prev.map(item =>
            item.id === selectedTest.id
                ? {
                    ...item,
                    ...data,
                    sampleCollectedBy: data.personName,
                    status: "Collected" as const
                }
                : item
        ));
        setIsCollectorOpen(false);
        toast.success("Sample collection details updated");
    };

    const handleSaveReport = (data: any) => {
        if (!selectedTest) return;
        setItems(prev => prev.map(item =>
            item.id === selectedTest.id
                ? {
                    ...item,
                    ...data,
                    status: "Approved" as const
                }
                : item
        ));
        setIsReportOpen(false);
        toast.success("Report details updated successfully");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0 flex flex-col bg-background max-h-screen overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 bg-dialog-header border-b border-dialog shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-lg ">
                            <FileText className="bg-dialog-header text-dialog-icon" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Pathology Bill Details</h2>
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
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-dialog-surface text-dialog">
                    <div className=" mx-auto space-y-6">

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

                        <Card className="border-none bg-overview-card shadow-sm overflow-hidden">
                            <CardHeader className="bg-overview-card border-overview-strong border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5 text-primary" />
                                        Applied Tests
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {items.length} Total Tests
                                        </Badge>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePrintReport(items)}
                                                        disabled={isPrinting}
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Print All Test Reports</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead>Test Name</TableHead>
                                                <TableHead>Sample Collected</TableHead>
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
                                                        {item.sampleCollectedBy ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium">{item.sampleCollectedBy}</span>
                                                                <span className="text-[10px] text-muted-foreground">{item.collectedDate}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Not Collected</span>
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
                                                                    item.status === "Collected" ? "secondary" : "outline"
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
                                                                    <TooltipContent>Add/Edit Sample Collector</TooltipContent>
                                                                </Tooltip>

                                                                {item.sampleCollectedBy && <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            onClick={() => {
                                                                                setSelectedTest(item);
                                                                                setIsReportOpen(true);
                                                                            }}
                                                                            disabled={!item.sampleCollectedBy}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Add/Edit Report</TooltipContent>
                                                                </Tooltip>}

                                                                {item.sampleCollectedBy && item.approvedBy && (<Tooltip>
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
                                                                    <TooltipContent>Print Test Report</TooltipContent>
                                                                </Tooltip>)}
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
                    <Button variant="outline" onClick={onClose} className="gap-2">
                        Close View
                    </Button>
                </div>

                {/* MODALS */}
                <SampleCollectorDialog
                    open={isCollectorOpen}
                    onClose={() => setIsCollectorOpen(false)}
                    onSave={handleSaveCollector}
                    testName={selectedTest?.testName || ""}
                    testId={selectedTest?.id}
                    billDate={billData?.billDate}
                />

                <ReportEditorDialog
                    open={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    onSave={handleSaveReport}
                    test={selectedTest}
                />
            </div>
        </div >
    );
}
