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
import { Info, Plus, Trash2, User, Printer, ReceiptIndianRupee, ClipboardList, BadgeInfo, FileText, Scan } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

const radiologyTests = [
    {
        id: "1",
        testName: "X-Ray Chest",
        shortName: "XRAY-CHEST",
        tax: 5,
        standardCharge: 1500,
        amount: 1575,
    },
    {
        id: "2",
        testName: "CT Scan Abdomen",
        shortName: "CT-ABD",
        tax: 12,
        standardCharge: 4000,
        amount: 4480,
    },
    {
        id: "3",
        testName: "Ultrasound Abdomen",
        shortName: "USG-ABD",
        tax: 5,
        standardCharge: 800,
        amount: 840,
    },
    {
        id: "4",
        testName: "MRI Brain",
        shortName: "MRI-BRAIN",
        tax: 12,
        standardCharge: 5000,
        amount: 5600,
    },
];

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
                testName: "X-Ray Chest",
                amount: 1500,
                tax: 5,
            },
            {
                id: "3",
                testName: "Ultrasound Abdomen",
                amount: 800,
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
                id: "2",
                testName: "CT Scan Abdomen",
                amount: 4000,
                tax: 12,
            },
        ],
    },
];

const HOME_COLLECTION_CHARGE = 100;

export default function RadiologyBillingForm() {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [remarks, setRemarks] = useState("");
    const [items, setItems] = useState<Item[]>([]);

    // Modal state for adding item
    const [selectedTestId, setSelectedTestId] = useState("");

    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [netAmount, setNetAmount] = useState<number>(0);

    const [ipdId, setIpdId] = useState("");

    const [sampleCollectionType, setSampleCollectionType] =
        useState<"lab" | "home">("lab");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

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

    const selectedTest = radiologyTests.find(t => t.id === selectedTestId);

    const handleAddItem = () => {
        if (!selectedTest) {
            toast.error("Please select a test");
            return;
        }

        const existingItemIndex = items.findIndex(item => item.testId === selectedTest.id);

        if (existingItemIndex > -1) {
            toast.error(`${selectedTest.testName} is already added to the bill`);
            return;
        }

        const price = Number(selectedTest.standardCharge || 0);
        const taxPercent = Number(selectedTest.tax || 0);

        const basePaise = Math.round(price * 100);
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

    const handleSubmit = async () => {
        if (!selectedPatient || !selectedDoctor || items.length === 0) {
            toast.error("Please fill all required fields (Patient, Doctor, Items)");
            return;
        }

        try {
            setIsSubmitting(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Radiology bill generated successfully (Dummy Data)");
            router.push("/doctor/radiology");
        } catch (error) {
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

        setSelectedPatient(ipd.patient);
        setSelectedDoctor({
            id: ipd.doctor.id,
            name: ipd.doctor.name,
            isInternal: true,
        });

        const ipdItems: Item[] = ipd.tests.map((t) => {
            const basePaise = Math.round(t.amount * 100);
            const taxPaise = Math.round(basePaise * t.tax / 100);

            return {
                id: crypto.randomUUID(),
                testId: t.id,
                name: t.testName,
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

    const appMode = "hospital";

    return (
        <div className="p-6 space-y-6 w-full mx-auto mt-4">
            <BackButton />
            <Card className="bg-Module-header text-white shadow-lg px-6 py-5 rounded-2xl mb-4">
                <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-white/90 mt-0.5" />
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Generate Radiology Bill
                        </h1>
                        <p className="text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
                            Add patient, assign doctor, select radiology tests, apply discounts,
                            and enable home sample collection if required.
                        </p>
                    </div>
                </div>
            </Card>

            {appMode === "hospital" && (
                <div className="space-y-2 mb-6">
                    <Label>IPD ID</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter IPD ID (e.g. IPD-001)"
                            value={ipdId}
                            onChange={(e) => setIpdId(e.target.value)}
                            className="max-w-80"
                        />
                        <Button onClick={handleIpdSearch}>
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
                        disabled={!!ipdId}
                    />

                    <div className="pt-2 border-t border-dashed">
                        <DoctorSelector
                            value={selectedDoctor}
                            onSelect={handleDoctorSelect}
                            title="Referring Doctor"
                            appMode={appMode}
                            disabled={!!ipdId}
                        />
                    </div>
                </Card>

                <Card className="p-4 space-y-4 bg-overview-card border-overview-strong">
                    <div className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Scan className="h-5 w-5" />
                        <h2>Add Test</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Select Test</Label>
                            <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Radiology Test" />
                                </SelectTrigger>
                                <SelectContent>
                                    {radiologyTests.map(test => (
                                        <SelectItem key={test.id} value={test.id}>
                                            {test.testName} ({test.shortName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={Number(selectedTest?.standardCharge || 0).toFixed(2)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Tax (%)</Label>
                                <Input
                                    type="number"
                                    value={Number(selectedTest?.tax || 0).toFixed(2)}
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
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <ClipboardList className="h-5 w-5" />
                            Bill Items
                        </h2>
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
                                                            Items can't be removed <br />after processing
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
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
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
                            <ReceiptIndianRupee className="h-5 w-5" />
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
                                    value={discountPercent}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (val >= 0 && val <= 100) {
                                            setDiscountPercent(val);
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

                        <div className="flex flex-col gap-2 mt-4">
                            <Label>Remarks</Label>
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Internal notes..."
                            />
                        </div>

                        <div className="border-t pt-3 space-y-2 mt-2">
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] whitespace-normal wrap-break-word">
                                                Tick this box to include a home collection charge in the bill.
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

                        <Button
                            size="lg"
                            className="w-full mt-4"
                            disabled={isSubmitting || items.length === 0 || !selectedPatient || !selectedDoctor}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? "Generating..." : "Generate Bill & Print"}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
