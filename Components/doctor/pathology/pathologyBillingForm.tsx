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
import { Info, Plus, Trash2, User, Printer } from "lucide-react";
import { getPathologyTests } from "@/lib/actions/pathologyTests";
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

export default function PathologyBillingForm() {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [remarks, setRemarks] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [availableTests, setAvailableTests] = useState<any[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);

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
        console.log("selected patients details", patient);
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

    const handleSubmit = (print: Boolean) => {
        if (!selectedPatient || !selectedDoctor || items.length === 0) {
            toast.error("Please fill all required fields (Patient, Doctor, Items, Payment)");
            return;
        }

        const payload = {
            patientId: selectedPatient.id,

            doctorId: selectedDoctor.isInternal ? selectedDoctor.id : null,
            doctorName: selectedDoctor.name,

            billing: {
                totalAmount,
                taxAmount,
                discountPercent,
                netAmount,
            },

            sampleCollection: {
                type: sampleCollectionType,
                charge:
                    sampleCollectionType === "home"
                        ? HOME_COLLECTION_CHARGE
                        : 0,

                address:
                    sampleCollectionType === "home"
                        ? sampleAddress
                        : null,

                preferredDate:
                    sampleCollectionType === "home"
                        ? sampleDate
                        : null,

                timeSlot:
                    sampleCollectionType === "home"
                        ? sampleTimeSlot
                        : null,
            },
            remarks,
            items,
        };

        console.log("Generating bill with payload:", payload);
        if (print) {
            toast.success("Bill generated and printed successfully (Dummy Data)");
            return;
        }
        toast.success("Bill generated successfully (Dummy Data)");
        // router.push("/doctor/pathology");
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
            };
        });

        setItems(ipdItems);

        toast.success("IPD data auto-filled");
    };

    const appMode = "hospital"; //| "manual";
    return (
        <div className="p-6 space-y-6 w-full mx-auto mt-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Generate Pathology Bill</h1>
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
                <Card className="p-4 space-y-0 border-primary/10 ">
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

                <Card className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold">Add Test / Medicine</h2>
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
                        <div className="grid grid-cols-3 gap-2">
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
                    <Card className="p-4">
                        <h2 className="text-lg font-semibold mb-4">Bill Items</h2>
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
                                            <TableHead className="text-center">Action</TableHead>
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
                    <Card className="p-4">
                        <h2 className="text-lg font-semibold">Summary</h2>
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
                                Generate Bill
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
