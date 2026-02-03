"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { useRouter } from "next/navigation";
import PatientSelector from "../patient/PatientSelector";
import { toast } from "sonner";
import BackButton from "@/Components/BackButton";
import {
    User,
    Ambulance,
    MapPin,
    Calendar as CalendarIcon,
    ReceiptIndianRupee,
    CreditCard,
    FileText,
    Truck
} from "lucide-react";
import { format } from "date-fns";

const DUMMY_VEHICLES = [
    { id: "1", vehicleNumber: "KA-01-AB-1234", driverName: "Michael Smith" },
    { id: "2", vehicleNumber: "KA-05-XY-5678", driverName: "David Johnson" },
    { id: "3", vehicleNumber: "KA-02-CD-9999", driverName: "Sarah Williams" },
];

const CHARGE_CATEGORIES = [
    { id: "cat1", name: "Distance Based" },
    { id: "cat2", name: "Facility Based" },
];

const CHARGES = [
    { id: "ch1", categoryId: "cat1", name: "Within City (Flat)", amount: 1000 },
    { id: "ch2", categoryId: "cat1", name: "Outside City (Per KM)", amount: 3000 },
    { id: "ch3", categoryId: "cat2", name: "Oxygen Support", amount: 500 },
    { id: "ch4", categoryId: "cat2", name: "Ventilator Support (ICU)", amount: 2000 },
];

export default function AmbulanceBillingForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [vehicleId, setVehicleId] = useState("");
    const [driverName, setDriverName] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [pickupDate, setPickupDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const [chargeCategoryId, setChargeCategoryId] = useState("");
    const [chargeId, setChargeId] = useState("");

    const [standardCharge, setStandardCharge] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(5); // Default 5% tax
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [referenceNo, setReferenceNo] = useState("");
    const [remarks, setRemarks] = useState("");

    // Auto-fill driver name when vehicle is selected
    useEffect(() => {
        const vehicle = DUMMY_VEHICLES.find(v => v.id === vehicleId);
        if (vehicle) {
            setDriverName(vehicle.driverName);
        }
    }, [vehicleId]);

    // Auto-fill pickup location from patient address
    useEffect(() => {
        if (selectedPatient?.address) {
            setPickupLocation(selectedPatient.address);
        } else {
            setPickupLocation("");
        }
    }, [selectedPatient]);

    // Update standard charge when charge is selected
    useEffect(() => {
        const charge = CHARGES.find(c => c.id === chargeId);
        if (charge) {
            setStandardCharge(charge.amount);
        } else {
            setStandardCharge(0);
        }
    }, [chargeId]);

    // Calculate Totals
    const calculation = useMemo(() => {
        const base = standardCharge;
        const discountAmt = base * (discountPercent / 100);
        const taxableAmt = base - discountAmt;
        const taxAmt = taxableAmt * (taxPercent / 100);
        const netAmt = taxableAmt + taxAmt;
        const balanceAmt = netAmt - paidAmount;

        let status: "paid" | "pending" | "partially_paid" = "pending";
        if (paidAmount >= netAmt && netAmt > 0) status = "paid";
        else if (paidAmount > 0) status = "partially_paid";

        return {
            discountAmt,
            taxAmt,
            netAmt,
            balanceAmt,
            status
        };
    }, [standardCharge, discountPercent, taxPercent, paidAmount]);

    const handleSubmit = async () => {
        if (!selectedPatient || !vehicleId || !chargeId) {
            toast.error("Please select a patient, vehicle, and charge category.");
            return;
        }

        try {
            setIsSubmitting(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Ambulance bill generated successfully");
            router.push("/doctor/ambulance");
        } catch (error) {
            toast.error("Failed to generate bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCharges = CHARGES.filter(c => c.categoryId === chargeCategoryId);

    return (
        <div className="p-6 space-y-6 w-full mx-auto mt-4">
            <BackButton />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Section: Patient & Location */}
                <div className="space-y-6">
                    <Card className="p-5 space-y-4 bg-overview-card border-overview-strong h-full">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <User className="h-5 w-5" />
                            Patient & Journey Details
                        </h2>

                        <PatientSelector
                            value={selectedPatient}
                            onSelect={setSelectedPatient}
                            title="Select Patient"
                        />

                        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-dashed">
                            <div>
                                <Label>Pickup Location</Label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter pickup address"
                                        className="pl-9"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Dropoff Location</Label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter dropoff destination"
                                        className="pl-9"
                                        value={dropoffLocation}
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Pickup Date</Label>
                                <div className="relative mt-1">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Section: Ambulance & Charges */}
                <div className="space-y-6">
                    <Card className="p-5 space-y-4 bg-overview-card border-overview-strong h-full flex flex-col">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Truck className="h-5 w-5" />
                            Ambulance & Charge Details
                        </h2>

                        <div className="grid grid-cols-1 gap-4 flex-grow">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Vehicle Number</Label>
                                    <Select value={vehicleId} onValueChange={setVehicleId}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select Vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DUMMY_VEHICLES.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Driver Name</Label>
                                    <Input
                                        placeholder="Driver name"
                                        className="mt-1"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-dashed">
                                <div>
                                    <Label>Charge Category</Label>
                                    <Select value={chargeCategoryId} onValueChange={setChargeCategoryId}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CHARGE_CATEGORIES.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Select Charge</Label>
                                    <Select
                                        value={chargeId}
                                        onValueChange={setChargeId}
                                        disabled={!chargeCategoryId}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Charge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCharges.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Standard Charge (₹)</Label>
                                    <Input
                                        type="number"
                                        className="mt-1 bg-muted"
                                        value={standardCharge}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <Label>Tax (%)</Label>
                                    <Input
                                        type="number"
                                        className="mt-1"
                                        value={taxPercent}
                                        onChange={(e) => setTaxPercent(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-dashed">
                                <Label>Internal Remarks</Label>
                                <Textarea
                                    placeholder="Add any specific instructions or remarks here..."
                                    className="min-h-[80px] mt-1"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Summary & Payment Section Adjusted to One Row (Horizontal Layout) */}
            <Card className="p-6 bg-overview-card border-overview-strong shadow-md">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Totals Summary */}
                    <div className="flex-1 w-full lg:w-1/2 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary border-b pb-2">
                            <ReceiptIndianRupee className="h-5 w-5" />
                            Summary
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                            <div>
                                <span className="text-xs text-muted-foreground block">Standard Charge</span>
                                <span className="text-lg font-semibold">₹{standardCharge.toFixed(2)}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground">Discount (%)</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="h-6 w-14 text-xs px-1"
                                        value={discountPercent}
                                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                    />
                                </div>
                                <span className="text-lg font-semibold text-destructive">- ₹{calculation.discountAmt.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Tax ({taxPercent}%)</span>
                                <span className="text-lg font-semibold">+ ₹{calculation.taxAmt.toFixed(2)}</span>
                            </div>
                            <div className="md:border-t md:pt-2">
                                <span className="text-sm font-bold block text-primary">Net Amount</span>
                                <span className="text-2xl font-bold text-primary">₹{calculation.netAmt.toFixed(2)}</span>
                            </div>
                            <div className="md:border-t md:pt-2">
                                <span className="text-sm font-medium text-destructive block">Balance Due</span>
                                <span className="text-2xl font-bold text-destructive">₹{calculation.balanceAmt.toFixed(2)}</span>
                            </div>
                            <div className="flex items-end pb-1 md:border-t md:pt-2">
                                <span className="text-[11px] text-primary uppercase font-bold tracking-wider bg-primary/5 px-2 py-1 rounded">
                                    Status: {calculation.status.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Inputs */}
                    <div className="flex-1 w-full lg:w-1/2 space-y-4 lg:border-l lg:pl-8">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary border-b pb-2">
                            <CreditCard className="h-5 w-5" />
                            Payment
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Mode</Label>
                                <Select value={paymentMode} onValueChange={setPaymentMode}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMode !== "Cash" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                                    <Label>Reference No.</Label>
                                    <Input
                                        placeholder="Transaction ID / Ref"
                                        value={referenceNo}
                                        onChange={(e) => setReferenceNo(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Amount Paid (₹)</Label>
                                <Input
                                    type="number"
                                    className="font-bold border-primary/20 bg-primary/5"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    className="w-full h-10 shadow-lg hover:shadow-xl transition-all font-semibold"
                                    disabled={isSubmitting || !selectedPatient || standardCharge === 0}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? "Processing..." : "Generate Bill"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Billing Policy at the very bottom */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border mt-4">
                <div className="flex items-center gap-2 mb-1 text-primary">
                    <FileText className="h-4 w-4" />
                    <h4 className="text-sm font-medium">Billing Policy</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                    All ambulance charges are calculated based on the selected category.
                    Taxes are applied on the net amount after discounts.
                    Partial payments are allowed. Reference numbers are required for non-cash transactions.
                </p>
            </div>
        </div>
    );
}
