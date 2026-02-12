"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
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
import {
    getAmbulances,
    saveAmbulanceBooking,
    getBookingById,
} from "@/lib/actions/ambulanceActions";
import { getChargeCategories, getCharges } from "@/lib/actions/chargeActions";


export default function AmbulanceBillingForm({ id }: { id?: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic data state
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [chargeCategories, setChargeCategories] = useState<any[]>([]);
    const [charges, setCharges] = useState<any[]>([]);

    // Form State
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [vehicleId, setVehicleId] = useState("");
    const [driverName, setDriverName] = useState("");
    const [driverContactNo, setDriverContactNo] = useState("");

    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [pickupDate, setPickupDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const [chargeCategoryId, setChargeCategoryId] = useState("");
    const [chargeId, setChargeId] = useState("");

    const [standardCharge, setStandardCharge] = useState(0);
    const [discountAmt, setDiscountAmt] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [isPaid, setIsPaid] = useState(false);
    const [paymentMode, setPaymentMode] = useState("cash");
    const [referenceNo, setReferenceNo] = useState(""); const [tripType, setTripType] = useState("Emergency");
    const [bookingTime, setBookingTime] = useState(format(new Date(), "HH:mm"));

    // Fetch master data
    useEffect(() => {
        const fetchMasterData = async () => {
            const [vRes, catRes, chRes] = await Promise.all([
                getAmbulances(true),
                getChargeCategories(),
                getCharges()
            ]);

            if (vRes.data) setVehicles(vRes.data);
            if (catRes.data) {
                const ambulanceCategories = catRes.data.filter(
                    (cat) => cat.categoryType === "Ambulance"
                );
                setChargeCategories(ambulanceCategories);
            }

            if (chRes.data) setCharges(chRes.data);
        };
        fetchMasterData();
    }, []);

    // Fetch existing booking for edit mode
    useEffect(() => {
        if (id) {
            const fetchBooking = async () => {
                const res = await getBookingById(id);
                if (res.data) {
                    const booking = res.data;
                    // Set patient with available data
                    setSelectedPatient({
                        id: booking.patientId,
                        name: booking.patientName,
                        phone: booking.patientMobile,
                        email: booking.patientEmail,
                        address: booking.pickupLocation
                    });
                    setVehicleId(booking.ambulanceId);
                    setDriverName(booking.driverName);
                    setDriverContactNo(booking.driverContactNo || "");
                    setPickupLocation(booking.pickupLocation);
                    setDropoffLocation(booking.dropLocation);
                    setPickupDate(format(new Date(booking.bookingDate), "yyyy-MM-dd"));
                    setBookingTime(booking.bookingTime);
                    setChargeCategoryId(booking.chargeCategory);
                    setChargeId(booking.chargeId);
                    setStandardCharge(Number(booking.standardCharge));
                    setTaxPercent(Number(booking.taxPercent));
                    setDiscountAmt(Number(booking.discountAmt));
                    setPaymentMode(booking.paymentMode || "cash");
                    setReferenceNo(booking.referenceNo || "");
                    setTripType(booking.tripType || "Emergency");
                    setIsPaid(booking.paymentStatus === "paid");
                }
            };
            fetchBooking();
        }
    }, [id]);

    useEffect(() => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setDriverName(vehicle.driverName || "");
            setDriverContactNo(vehicle.driverContactNo || "");
        }
    }, [vehicleId, vehicles]);


    // Auto-fill pickup location from patient address
    useEffect(() => {
        if (selectedPatient?.address) {
            setPickupLocation(selectedPatient.address);
        } else {
            setPickupLocation("");
        }
    }, [selectedPatient]);

    useEffect(() => {
        const charge = charges.find(c => c.id === chargeId);
        if (charge) {
            setStandardCharge(Number(charge.amount));
            // Set tax percent from charge's tax category
            if (charge.taxPercent) {
                setTaxPercent(Number(charge.taxPercent));
            }
        } else {
            setStandardCharge(0);
        }
    }, [chargeId, charges]);

    // Calculate Totals
    const calculation = useMemo(() => {
        const base = standardCharge;
        const safeDiscount = Math.min(discountAmt, base);
        const taxableAmt = Math.max(base - safeDiscount, 0);
        const taxAmt = taxableAmt * (taxPercent / 100);
        const netAmt = taxableAmt + taxAmt;
        const paidAmt = isPaid ? netAmt : 0;
        const balanceAmt = netAmt - paidAmt;

        let status: "paid" | "pending" | "partially_paid" = "pending";
        if (isPaid && netAmt > 0) status = "paid";
        else if (paidAmt > 0) status = "partially_paid";

        return {
            discountAmt: safeDiscount,
            taxAmt,
            totalAmount: netAmt,
            netAmt,
            paidAmt,
            balanceAmt,
            status
        };
    }, [standardCharge, discountAmt, taxPercent, isPaid]);


    const handleSubmit = async () => {
        if (!selectedPatient || !vehicleId || !chargeId) {
            toast.error("Please select a patient, vehicle, and charge category.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await saveAmbulanceBooking({
                ...(id && { id }),
                patientId: selectedPatient.id,
                ambulanceId: vehicleId,
                chargeCategory: chargeCategoryId,
                chargeId: chargeId,
                standardCharge: standardCharge.toString(),
                taxPercent: taxPercent.toString(),
                discountAmt: discountAmt.toString(),
                totalAmount: calculation.totalAmount.toString(),
                paidAmount: calculation.paidAmt.toString(),
                paymentMode: paymentMode as any,
                paymentStatus: calculation.status as any,
                bookingStatus: "confirmed" as any,
                tripType: tripType,
                referenceNo: referenceNo,
                pickupLocation: pickupLocation,
                dropLocation: dropoffLocation,
                bookingDate: pickupDate,
                bookingTime: bookingTime,
                driverName: driverName,
                driverContactNo: driverContactNo,
            });

            if (res.data) {
                toast.success(id ? "Ambulance bill updated" : "Ambulance bill generated successfully");
                router.push("/doctor/ambulance");
            } else {
                toast.error(res.error || "Failed to save bill");
            }
        } catch (error) {
            toast.error("Failed to generate bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCharges = charges.filter(c => c.chargeCategoryId === chargeCategoryId);

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
                            disabled={!!id}
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
                            <div className="flex justify-between gap-4">
                                <div className="flex-1">
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
                                <div className="flex-1">
                                    <Label>Pickup Time</Label>
                                    <div className="relative mt-1">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            className="pl-9"
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                        />
                                    </div>
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

                        <div className="grid grid-cols-1 gap-4 grow">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Vehicle */}
                                <div>
                                    <Label>Vehicle Number</Label>
                                    <Select value={vehicleId} onValueChange={setVehicleId}>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Select Vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.vehicleNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Driver Name */}
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

                            {/* Driver Phone */}
                            <div className="grid grid-cols-2 gap-4 items-end">
                                {/* Driver Phone */}
                                <div className="col-span-1">
                                    <Label>Driver Phone Number</Label>
                                    <Input
                                        placeholder="Driver mobile number"
                                        className="mt-1 "
                                        value={driverContactNo}
                                        onChange={(e) => setDriverContactNo(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Label>Trip Type</Label>
                                    <Select value={tripType} onValueChange={setTripType}>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Select Trip Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Emergency">Emergency</SelectItem>
                                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                                            <SelectItem value="Transfer">Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-dashed">
                                <div className="col-span-1">
                                    <Label>Charge Category</Label>
                                    <Select value={chargeCategoryId} onValueChange={setChargeCategoryId}>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chargeCategories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <Label>Select Charge</Label>
                                    <Select
                                        value={chargeId}
                                        onValueChange={setChargeId}
                                        disabled={!chargeCategoryId}
                                    >
                                        <SelectTrigger className="w-full mt-1">
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
                                        className="mt-1 bg-muted"
                                        value={taxPercent}
                                        disabled={!!chargeId}
                                        onChange={(e) => setTaxPercent(Number(e.target.value))}
                                    />
                                </div>
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
                                    <span className="text-xs text-muted-foreground">Discount Amount (₹)</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={standardCharge}
                                        className="h-6 w-20 text-xs px-1"
                                        value={discountAmt}
                                        onChange={(e) => {
                                            let value = Number(e.target.value);
                                            if (isNaN(value) || value < 0) value = 0;
                                            if (value > standardCharge) {
                                                value = standardCharge;
                                                toast.warning("Discount cannot exceed total charge");
                                            }
                                            setDiscountAmt(value);
                                        }}
                                    />

                                </div>
                                <span className="text-lg font-semibold text-destructive">- ₹{discountAmt.toFixed(2)}</span>
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
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="dd">DD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMode !== "cash" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                                    <Label>Reference No.</Label>
                                    <Input
                                        placeholder="Transaction ID / Ref"
                                        value={referenceNo}
                                        onChange={(e) => setReferenceNo(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center px-3 gap-3 rounded-md border">
                                <Input
                                    id="paid"
                                    type="checkbox"
                                    checked={isPaid}
                                    onChange={(e) => setIsPaid(e.target.checked)}
                                    className="h-4 w-4 accent-green-600"
                                />

                                <Label htmlFor="paid" className="text-sm font-medium">
                                    Mark as Paid
                                </Label>

                                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold 
                                    ${isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {isPaid ? "Paid" : "Pending"}
                                </span>
                            </div>



                            <div className="flex items-end">
                                <Button
                                    className="w-full h-10 shadow-lg hover:shadow-xl transition-all font-semibold"
                                    disabled={isSubmitting || !selectedPatient || standardCharge === 0}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting
                                        ? (id ? "Updating..." : "Processing...")
                                        : (id ? "Update Bill" : "Generate Bill")
                                    }
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
