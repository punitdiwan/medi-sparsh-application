"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import PatientSelector from "../patient/PatientSelector";
import DoctorSelector from "../patient/DoctorSelector";
import { toast } from "sonner";
import BackButton from "@/Components/BackButton";
import { Info, Plus, Trash2, User, Printer, TestTubeDiagonal, ReceiptIndianRupee, ClipboardList, BadgeInfo, FileText } from "lucide-react";
import { getPathologyTests } from "@/lib/actions/pathologyTests";
import { createPathologyBill, updatePathologyBill, getBillById } from "@/lib/actions/pathologyBills";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

type Item = {
    id: string; // for list keys
    testId: string; // from database
    name: string;
    price: number;       // per unit price
    taxPercent: number;  // test.tax
    baseAmount: number;  // without tax
    taxAmount: number;   // tax value
    total: number;       // with tax
    isLocked: boolean;
};


const dummyIpdData = [
    {
        ipdId: "IPD-001",
        patient: {
            id: "pat1",
            name: "Rahul Kumar",
            phone: "9999999999",
        },
        doctor: {
            id: "doc1",
            name: "Dr. Amit Sharma",
        },
        tests: [
            {
                id: "1",
                testName: "Glucose Fasting",
                amount: 200,
                tax: 5,
            },
            {
                id: "2",
                testName: "Complete Blood Count",
                amount: 350,
                tax: 5,
            },
        ],
    },
    {
        ipdId: "IPD-002",
        patient: {
            id: "pat2",
            name: "Sita Devi",
            phone: "8888888888",
        },
        doctor: {
            id: "doc2",
            name: "Dr. Neha Verma",
        },
        tests: [
            {
                id: "3",
                testName: "Lipid Profile",
                amount: 800,
                tax: 12,
            },
        ],
    },
];

const HOME_COLLECTION_CHARGE = 100;

interface PathologyBillingFormProps {
    billId?: string;
    mode?: string;
}

export default function PathologyBillingForm({ billId, mode }: PathologyBillingFormProps) {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [remarks, setRemarks] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [availableTests, setAvailableTests] = useState<any[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [isEditMode, setIsEditMode] = useState(mode === "edit" && !!billId);
    const [isLoadingBill, setIsLoadingBill] = useState(isEditMode);

    // Modal state for adding item
    const [selectedTestId, setSelectedTestId] = useState("");


    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [netAmount, setNetAmount] = useState<number>(0);

    const [ipdId, setIpdId] = useState("");

    const [sampleCollectionType, setSampleCollectionType] =
        useState<"lab" | "home">("lab");

    const [sampleAddress, setSampleAddress] = useState("");
    const [sampleDate, setSampleDate] = useState("");
    const [sampleTimeSlot, setSampleTimeSlot] = useState("");

    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [pendingPrint, setPendingPrint] = useState(false);

    const [usePatientAddress, setUsePatientAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchTests = async () => {
            setLoadingTests(true);
            try {
                const result = await getPathologyTests();
                if (result.data) {
                    setAvailableTests(result.data);
                } else if (result.error) {
                    toast.error(result.error);
                }
            } catch (error) {
                toast.error("Failed to fetch tests");
            } finally {
                setLoadingTests(false);
            }
        };
        fetchTests();
    }, []);

    // Load bill data when in edit mode
    useEffect(() => {
        const loadBillData = async () => {
            if (!isEditMode || !billId) {
                setIsLoadingBill(false);
                return;
            }

            try {
                setIsLoadingBill(true);
                const result = await getBillById(billId);

                if (!result.success || !result.data) {
                    toast.error(result.error || "Failed to load bill");
                    router.push("/doctor/pathology");
                    return;
                }

                const billData = result.data;

                // Set patient - create a mock patient object from bill data
                if (billData.orderId) {
                    setSelectedPatient({
                        id: billData.patientId,
                        name: billData.patientName,
                        mobileNumber: billData.patientPhone,
                        email: billData.patientEmail,
                        dob: billData.patientDob,
                        gender: billData.patientGender,
                        address: billData.patientAddress,
                    });
                }

                // Set doctor
                if (billData.doctorName) {
                    setSelectedDoctor({
                        id: billData.doctorId || "",
                        name: billData.doctorName,
                    });
                }

                // Set remarks
                setRemarks(billData.remarks || "");

                // Set discount
                const discount = Number(billData.billDiscount) || 0;
                const totalAmount = Number(billData.billTotalAmount) || 0;
                if (totalAmount > 0) {
                    const discountPercentage = (discount / totalAmount) * 100;
                    setDiscountPercent(Math.round(discountPercentage * 100) / 100);
                }

                // Convert tests to items
                const billItems: Item[] = billData.tests.map((test: any) => {
                    const price = Number(test.price) || 0;
                    const taxPercent = Number(test.tax) || 0;
                    const baseAmount = price;
                    const taxAmount = (baseAmount * taxPercent) / 100;
                    const total = baseAmount + taxAmount;

                    return {
                        id: test.id,
                        testId: test.testId,
                        name: test.testName,
                        price,
                        taxPercent,
                        baseAmount,
                        taxAmount,
                        total,
                        isLocked: test.hasSampleCollected === true
                    };
                });
                setItems(billItems);
                toast.success("Bill loaded for editing");
            } catch (error) {
                console.error("Error loading bill:", error);
                toast.error("Failed to load bill data");
                router.push("/doctor/pathology");
            } finally {
                setIsLoadingBill(false);
            }
        };

        loadBillData();
    }, [isEditMode, billId, router]);
    useEffect(() => {
        const basePaise = items.reduce(
            (acc, i) => acc + Math.round(i.baseAmount * 100),
            0
        );

        const taxPaise = items.reduce(
            (acc, i) => acc + Math.round(i.taxAmount * 100),
            0
        );

        const totalWithoutDiscountPaise = basePaise + taxPaise;
        const discountAmountPaise = Math.round(totalWithoutDiscountPaise * (discountPercent / 100));

        const homeChargePaise =
            sampleCollectionType === "home" ? HOME_COLLECTION_CHARGE * 100 : 0;

        const netPaise =
            totalWithoutDiscountPaise + homeChargePaise - discountAmountPaise;

        setTotalAmount(totalWithoutDiscountPaise / 100);
        setTaxAmount(taxPaise / 100);
        setNetAmount(netPaise / 100);
    }, [items, discountPercent, sampleCollectionType]);




    const selectedTest = availableTests.find(t => t.id === selectedTestId);


    const handleAddItem = () => {
        if (!selectedTest) {
            toast.error("Please select a test");
            return;
        }

        const existingItemIndex = items.findIndex(item => item.testId === selectedTest.id);

        if (existingItemIndex > -1) {
            // Test already exists in bill
            toast.error(`${selectedTest.testName} is already added to the bill`);
            return;
        }

        // Add new item with quantity = 1
        const qty = 1;
        const price = Number(selectedTest.amount || 0); // Base price from DB
        const taxPercent = Number(selectedTest.taxPercent || 0);

        // work in paise
        const basePaise = Math.round(qty * price * 100);
        const taxPaise = Math.round(basePaise * taxPercent / 100);
        const totalPaise = basePaise + taxPaise;

        const newItem: Item = {
            id: Math.random().toString(36).slice(2),
            testId: selectedTest.id,
            name: selectedTest.testName,
            price,
            taxPercent,
            baseAmount: basePaise / 100,
            taxAmount: taxPaise / 100,
            total: totalPaise / 100,
            isLocked: false,
        };

        setItems(prev => [...prev, newItem]);
        setSelectedTestId("");
        toast.success(`Added ${selectedTest.testName} to bill`);
    };




    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    useEffect(() => {
        if (!selectedPatient) {
            setUsePatientAddress(false);
            return;
        }

        // agar patient ke paas address hai & checkbox ON hai
        if (usePatientAddress && selectedPatient.address) {
            setSampleAddress(selectedPatient.address);
        }
    }, [selectedPatient, usePatientAddress]);


    const handlePatientSelect = (patient: any) => {
        setSelectedPatient(patient);
        if (patient) {
            toast.success(`Patient ${patient.name} selected`);
        }
    };

    const handleDoctorSelect = (doctor: any) => {
        setSelectedDoctor(doctor);
        if (doctor) {
            toast.success(`Doctor ${doctor.name} assigned`);
        }
    };

    const handleSubmit = async (print: Boolean) => {
        if (!selectedPatient || !selectedDoctor || items.length === 0) {
            toast.error("Please fill all required fields (Patient, Doctor, Items)");
            return;
        }

        try {
            setIsSubmitting(true);

            const billDiscount = totalAmount * (discountPercent / 100);
            const finalNetAmount = netAmount;

            const billData = {
                tests: items.map(item => ({
                    testId: item.testId,
                    price: item.price,
                    tax: item.taxPercent,
                })),
                billDiscount: Number(billDiscount.toFixed(2)),
                billTotalAmount: Number(totalAmount.toFixed(2)),
                billNetAmount: Number(finalNetAmount.toFixed(2)),
                remarks,
            };
            let result;

            if (isEditMode && billId) {
                // Update existing bill
                result = await updatePathologyBill(billId, billData);
            } else {
                // Create new bill
                result = await createPathologyBill({
                    patientId: selectedPatient.id,
                    doctorId: selectedDoctor.isInternal ? selectedDoctor.id : undefined,
                    doctorName: selectedDoctor.name,
                    remarks,
                    tests: billData.tests,
                    billDiscount: billData.billDiscount,
                    billTotalAmount: billData.billTotalAmount,
                    billNetAmount: billData.billNetAmount,
                });
            }

            if (result.success) {
                const successMessage = isEditMode ? "Bill updated successfully" : "Bill created successfully";
                toast.success(successMessage);
                // Reset form
                setSelectedPatient(null);
                setSelectedDoctor(null);
                setItems([]);
                setRemarks("");
                setDiscountPercent(0);
                if (print) {
                    // TODO: Implement print functionality
                    toast.info("Print feature coming soon");
                }
                // Navigate to bills list
                router.push("/doctor/pathology");
            } else {
                toast.error(result.error || (isEditMode ? "Failed to update bill" : "Failed to create bill"));
            }
        } catch (error) {
            console.error("Error saving bill:", error);
            toast.error("An error occurred while saving the bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIpdSearch = () => {
        if (!ipdId) return;

        const ipd = dummyIpdData.find(
            (i) => i.ipdId.toLowerCase() === ipdId.toLowerCase()
        );

        if (!ipd) {
            toast.error("IPD ID not found");
            return;
        }

        // ✅ auto patient
        setSelectedPatient(ipd.patient);

        // ✅ auto doctor
        setSelectedDoctor({
            id: ipd.doctor.id,
            name: ipd.doctor.name,
            isInternal: true,
        });

        // ✅ auto tests
        const ipdItems: Item[] = ipd.tests.map((t) => {
            const basePaise = Math.round(t.amount * 100);
            const taxPaise = Math.round(basePaise * t.tax / 100);

            return {
                id: crypto.randomUUID(),
                testId: t.id,
                name: t.testName,
                quantity: 1,
                price: t.amount,
                taxPercent: t.tax,
                baseAmount: basePaise / 100,
                taxAmount: taxPaise / 100,
                total: (basePaise + taxPaise) / 100,
                isLocked: false
            };
        });

        setItems(ipdItems);

        toast.success("IPD data auto-filled");
    };

    const appMode = "hospital"; //| "manual";

    if (isLoadingBill) {
        return (
            <div className="p-6 space-y-6 w-full mx-auto mt-4">
                <BackButton />
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">Loading bill data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 w-full mx-auto mt-4">
            <BackButton />
            <Card className="bg-Module-header text-white shadow-lg px-6 py-5 rounded-2xl mb-4">
                <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-white/90 mt-0.5" />

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {isEditMode ? "Edit Pathology Bill" : "Generate Pathology Bill"}
                        </h1>

                        <p className="text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
                            {isEditMode ? (<>
                                You can modify test selection and update discounts.
                                Patient, doctor, and home collection details are locked.
                                    Tests cannot be deleted once the sample has been collected.
                            </>) : (<>
                                Add patient, assign doctor, select tests, apply discounts,
                                and enable home sample collection if required.
                            </>
                            )}
                        </p>
                    </div>
                </div>
            </Card>
            {appMode === "hospital" && (
                <div className="space-y-2 mb-6">
                    <Label>IPD ID</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter IPD ID (e.g. IPD-1234)"
                            value={ipdId}
                            onChange={(e) => setIpdId(e.target.value)}
                            className="max-w-80"
                        />
                        <Button onClick={handleIpdSearch}
                            disabled={isEditMode}>
                            Search
                        </Button>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 space-y-0 bg-overview-card border-overview-strong ">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <User className="h-5 w-5" />
                        Patient Information
                    </h2>

                    <PatientSelector
                        value={selectedPatient}
                        onSelect={handlePatientSelect}
                        title="Search Existing Patient"
                        disabled={!!ipdId || isEditMode}
                    />

                    <div className="pt-2 border-t border-dashed">
                        <DoctorSelector
                            value={selectedDoctor}
                            onSelect={handleDoctorSelect}
                            title="Referring Doctor"
                            appMode={appMode}
                            disabled={!!ipdId || isEditMode}
                        />
                    </div>
                </Card>

                <Card className="p-4 space-y-4 bg-overview-card border-overview-strong">
                    <div className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <TestTubeDiagonal className="h-5 w-5" />
                        <h2>Add Test</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Select Test</Label>
                            <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Pathology Test" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingTests ? (
                                        <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
                                    ) : (
                                        availableTests.map(test => (
                                            <SelectItem key={test.id} value={test.id}>
                                                {test.testName} {test.shortName ? `(${test.shortName})` : ""}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={Number(selectedTest?.amount || 0).toFixed(2)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Tax (%)</Label>
                                <Input
                                    type="number"
                                    value={Number(selectedTest?.taxPercent || 0).toFixed(2)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddItem} className="w-full">
                            <Plus size={16} className="mr-2" /> Add to Bill
                        </Button>
                    </div>
                </Card>
            </div>
            <div className="flex gap-4 w-full flex-col lg:flex-row">
                <div className="w-full lg:w-[65%]">
                    <Card className="p-4 bg-overview-card border-overview-strong">
                        <div className="">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                <ClipboardList className="h-5 w-5" />
                                Bill Items
                            </h2>

                        </div>
                        {items.length === 0 ? (
                            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded text-muted-foreground text-lg">
                                No items added yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Test</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Tax</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center flex gap-1 justify-center items-center">
                                                Action
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <BadgeInfo className="h-4 w-4 text-black/40 dark:text-white/40 cursor-pointer" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Items can't be removed <br />after sample collection
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    ₹{item.taxAmount.toFixed(2)} ({item.taxPercent}%)
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    ₹{item.total.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    disabled={isEditMode && item.isLocked}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            {isEditMode && item.isLocked && (
                                                                <TooltipContent>
                                                                    Cannot remove items after sample collection
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="w-full lg:w-[35%]">
                    <Card className="p-4 bg-overview-card border-overview-strong">
                        <div className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <ReceiptIndianRupee />
                            Summary
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Total (Incl. Tax)</Label>
                                <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Tax</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-row justify-between gap-1">
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={Math.round(discountPercent * 100) / 100}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (val >= 0 && val <= 100) {
                                            setDiscountPercent(Math.round(val * 100) / 100);
                                        } else if (val > 100) {
                                            setDiscountPercent(100);
                                        } else {
                                            setDiscountPercent(0);
                                        }
                                    }}
                                    className="max-w-25"
                                />
                            </div>

                            <div className="flex justify-between border-t pt-1 mt-2">
                                <Label className="text-lg">Net Amount</Label>
                                <span className="text-lg font-bold text-primary">
                                    ₹{netAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Remarks</Label>
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Internal notes..."
                            />
                        </div>
                        <div className="border-t pt-3 space-y-2">
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] whitespace-normal wrap-break-word">
                                                This is an optional charge for collecting samples from the patient's home. Tick this box to include the home collection charge in the bill.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Label className="font-medium text-gray-700 dark:text-gray-300 cursor-default">
                                        Home Sample Collection
                                    </Label>

                                </div>
                                <input
                                    type="checkbox"
                                    checked={sampleCollectionType === "home"}
                                    onChange={(e) =>
                                        setSampleCollectionType(e.target.checked ? "home" : "lab")
                                    }
                                    disabled={isEditMode}
                                    className="h-4 w-4 accent-primary"
                                />
                            </div>

                            {sampleCollectionType === "home" && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Home Collection Charge</span>
                                    <span>₹{HOME_COLLECTION_CHARGE.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Generate & Print */}
                            {/* <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full flex gap-2"
                                            onClick={() => handleSubmit(true)}
                                        >
                                            <Printer size={18} />
                                            Generate & Print
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Generate bill and send to printer</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider> */}

                            {/* Generate Only */}
                            <Button
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting || items.length === 0 || !selectedPatient || !selectedDoctor}
                                onClick={() => {
                                    if (
                                        sampleCollectionType === "home" &&
                                        (!sampleAddress || !sampleDate || !sampleTimeSlot)
                                    ) {
                                        setPendingPrint(false);
                                        setOpenAddressDialog(true);
                                        return;
                                    }
                                    handleSubmit(false);
                                }}
                            >
                                {isSubmitting ? (isEditMode ? "Updating Bill..." : "Creating Bill...") : (isEditMode ? "Update Bill" : "Generate Bill")}
                            </Button>
                        </div>

                    </Card>
                </div>
            </div>

            <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
                <DialogContent className="max-w-md border border-dialog bg-dialog-surface p-0">
                    <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                        <DialogTitle>Home Sample Collection Details</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4 space-y-4">
                        {selectedPatient?.address && (
                            <div className="flex items-center border-b pb-1 gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[200px] whitespace-normal wrap-break-word">
                                            Select this to automatically use the patient’s saved address for home sample collection.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Label className="text-sm text-gray-700 dark:text-gray-300 ">
                                    Use patient’s existing address
                                </Label>
                                <input
                                    type="checkbox"
                                    checked={usePatientAddress}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setUsePatientAddress(checked);

                                        if (checked) {
                                            setSampleAddress(selectedPatient.address);
                                        } else {
                                            setSampleAddress("");
                                        }
                                    }}
                                    className="h-4 w-4 accent-primary cursor-pointer"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label>Collection Address</Label>
                            <Textarea
                                value={sampleAddress}
                                onChange={(e) => setSampleAddress(e.target.value)}
                                placeholder="Enter full address"
                                disabled={usePatientAddress}
                                className={usePatientAddress ? "bg-muted cursor-not-allowed" : ""}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 ">
                            <div className="space-y-1">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={sampleDate}
                                    onChange={(e) => setSampleDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Time Slot</Label>
                                <Select value={sampleTimeSlot} onValueChange={setSampleTimeSlot}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">Morning</SelectItem>
                                        <SelectItem value="afternoon">Afternoon</SelectItem>
                                        <SelectItem value="evening">Evening</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>


                    <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setOpenAddressDialog(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => {
                                if (!sampleAddress || !sampleDate || !sampleTimeSlot) {
                                    toast.error("Please fill all address details");
                                    return;
                                }
                                setOpenAddressDialog(false);
                                handleSubmit(pendingPrint);
                            }}
                        >
                            Confirm Address
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
