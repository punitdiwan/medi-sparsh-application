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
import BackButton from "@/Components/BackButton";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Item = {
    id: string;
    name: string;
    quantity: number;
    price: number;       // per unit price
    taxPercent: number;  // test.tax
    baseAmount: number;  // without tax
    taxAmount: number;   // tax value
    total: number;       // with tax
};

const tests = [
  {
    id: "1",
    testName: "Glucose Fasting",
    shortName: "GLU-F",
    testType: "Blood",
    categoryId: "cat1",
    categoryName: "Blood Chemistry",
    subCategory: "Sugar",
    method: "Enzymatic",
    reportDays: 1,
    chargeCategoryId: "cc1",
    chargeNameId: "cn1",
    tax: 5,
    standardCharge: 200,
    amount: 210,
    parameters: [
      {
        id: "p1",
        parameterId: "param1",
        testParameterName: "Blood Glucose",
        referenceRange: "70-110",
        unit: "mg/dL",
      },
    ],
  },

  {
    id: "2",
    testName: "Complete Blood Count",
    shortName: "CBC",
    testType: "Blood",
    categoryId: "cat2",
    categoryName: "Hematology",
    subCategory: "Routine",
    method: "Automated Analyzer",
    reportDays: 1,
    chargeCategoryId: "cc2",
    chargeNameId: "cn2",
    tax: 5,
    standardCharge: 350,
    amount: 367.5,
    parameters: [
      {
        id: "p2",
        parameterId: "param2",
        testParameterName: "Hemoglobin",
        referenceRange: "13-17",
        unit: "g/dL",
      },
      {
        id: "p3",
        parameterId: "param3",
        testParameterName: "WBC Count",
        referenceRange: "4000-11000",
        unit: "/µL",
      },
    ],
  },

  {
    id: "3",
    testName: "Lipid Profile",
    shortName: "LIPID",
    testType: "Blood",
    categoryId: "cat1",
    categoryName: "Blood Chemistry",
    subCategory: "Cholesterol",
    method: "Enzymatic Colorimetric",
    reportDays: 2,
    chargeCategoryId: "cc3",
    chargeNameId: "cn3",
    tax: 12,
    standardCharge: 800,
    amount: 896,
    parameters: [
      {
        id: "p4",
        parameterId: "param4",
        testParameterName: "Total Cholesterol",
        referenceRange: "<200",
        unit: "mg/dL",
      },
      {
        id: "p5",
        parameterId: "param5",
        testParameterName: "Triglycerides",
        referenceRange: "<150",
        unit: "mg/dL",
      },
    ],
  },

  {
    id: "4",
    testName: "Urine Routine Examination",
    shortName: "URINE-RE",
    testType: "Urine",
    categoryId: "cat3",
    categoryName: "Clinical Pathology",
    subCategory: "Routine",
    method: "Manual & Microscopy",
    reportDays: 1,
    chargeCategoryId: "cc4",
    chargeNameId: "cn4",
    tax: 0,
    standardCharge: 150,
    amount: 150,
    parameters: [
      {
        id: "p6",
        parameterId: "param6",
        testParameterName: "Protein",
        referenceRange: "Negative",
        unit: "",
      },
      {
        id: "p7",
        parameterId: "param7",
        testParameterName: "Sugar",
        referenceRange: "Negative",
        unit: "",
      },
    ],
  },
];


export default function PathologyBillingForm() {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [note, setNote] = useState("");
    const [items, setItems] = useState<Item[]>([]);

    // Modal state for adding item
    const [selectedTestId, setSelectedTestId] = useState("");
    const [newItemQty, setNewItemQty] = useState(1);


    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [netAmount, setNetAmount] = useState<number>(0);
    const [paymentMode, setPaymentMode] = useState("");

    const router = useRouter();

    useEffect(() => {
        const base = items.reduce(
            (acc, i) => acc + Math.round(i.baseAmount * 100),
            0
        );

        const tax = items.reduce(
            (acc, i) => acc + Math.round(i.taxAmount * 100),
            0
        );

        const discount = Math.round(discountAmount * 100);

        const net = base + tax - discount;

        setTotalAmount((base + tax) / 100);
        setTaxAmount(tax / 100);
        setNetAmount(net / 100);
    }, [items, discountAmount]);



    const selectedTest = tests.find(t => t.id === selectedTestId);

    const handleAddItem = () => {
        if (!selectedTest) {
            toast.error("Please select a test");
            return;
        }

        const qty = newItemQty;
        const price = selectedTest.amount;
        const taxPercent = selectedTest.tax;

        // work in paise
        const basePaise = Math.round(qty * price * 100);
        const taxPaise = Math.round(basePaise * taxPercent / 100);
        const totalPaise = basePaise + taxPaise;

        const newItem: Item = {
            id: Math.random().toString(36).slice(2),
            name: selectedTest.testName,
            quantity: qty,
            price,
            taxPercent,
            baseAmount: basePaise / 100,
            taxAmount: taxPaise / 100,
            total: totalPaise / 100,
        };

        setItems(prev => [...prev, newItem]);
        setSelectedTestId("");
        setNewItemQty(1);
    };




    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleSubmit = () => {
        if (!customerName || !customerPhone || items.length === 0 || !paymentMode) {
            toast.error("Please fill all required fields");
            return;
        }
        toast.success("Bill generated successfully (Dummy Data)");
        router.push("/doctor/pathology");
    };

    return (
        <div className="p-6 space-y-6 w-full mx-auto mt-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Generate Pathology Bill</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold">Patient Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Patient Name</Label>
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter patient name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>
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
                                    {tests.map(test => (
                                        <SelectItem key={test.id} value={test.id}>
                                            {test.testName} ({test.shortName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={newItemQty}
                                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={selectedTest?.amount ?? 0}
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
                                            <TableHead className="text-center">Qty</TableHead>
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
                                                <TableCell className="text-center">{item.quantity}</TableCell>
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
                    <Card className="p-4 ">
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

                            <div className="flex flex-col gap-1">
                                <Label>Discount</Label>
                                <Input
                                    type="number"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex justify-between border-t pt-2 mt-2">
                                <Label className="text-lg">Net Amount</Label>
                                <span className="text-lg font-bold text-primary">
                                    ₹{netAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>


                        <div className="flex flex-col gap-2">
                            <Label>Payment Mode</Label>
                            <Select value={paymentMode} onValueChange={setPaymentMode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Note</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Internal notes..."
                            />
                        </div>

                        <Button onClick={handleSubmit} className="w-full" size="lg">
                            Generate Bill & Print
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
