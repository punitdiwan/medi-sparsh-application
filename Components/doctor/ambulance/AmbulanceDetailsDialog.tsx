"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, MapPin, User, Phone, Truck, Calendar, Printer } from "lucide-react";
import { format } from "date-fns";
import { getShortId } from "@/utils/getShortId";

interface AmbulanceBill {
    id: string;
    patientName: string;
    patientPhone: string;
    vehicleNumber: string;
    driverName: string;
    pickupLocation: string;
    dropoffLocation: string;
    billTotalAmount: number;
    discountAmount: number;
    taxPercentage: number;
    netAmount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    billStatus: "paid" | "pending" | "partially_paid";
    tripType: string;
    createdAt: string;
}

interface AmbulanceDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ambulance: AmbulanceBill | null;
}

export default function AmbulanceDetailsDialog({
    isOpen,
    onClose,
    ambulance,
}: AmbulanceDetailsDialogProps) {
    if (!ambulance) return null;

    // Calculate net amount
    const bill = ambulance.billTotalAmount || 0;
    const discountAmount = ambulance.discountAmount || 0;
    const taxPercent = ambulance.taxPercentage || 0;
    const taxableAmount = bill - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const netAmount = taxableAmount + taxAmount;

    // Calculate balance
    const paidAmount = ambulance.paidAmount || 0;
    const balanceAmount = netAmount - paidAmount;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-500 text-white dark:bg-green-600";

            case "pending":
                return "bg-amber-500 text-white dark:bg-amber-600";

            case "partially_paid":
                return "bg-blue-500 text-white dark:bg-blue-600";

            case "cancelled":
                return "bg-red-500 text-white dark:bg-red-600";

            case "overdue":
                return "bg-purple-500 text-white dark:bg-purple-600";

            default:
                return "bg-gray-500 text-white dark:bg-gray-600";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-hidden p-0 border border-dialog bg-dialog-surface">

                {/* HEADER */}
                {/* HEADER */}
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                    <div className="flex justify-between items-start gap-4">

                        {/* LEFT SIDE */}
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Truck className="text-dialog-icon" />
                                Ambulance Bill Details
                            </DialogTitle>

                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                    {ambulance.patientName}
                                </span>

                                <span className="font-medium">
                                    Bill ID: <span className="font-semibold text-foreground">{getShortId(ambulance.id)}</span>
                                </span>

                                <span className="hidden sm:inline">•</span>

                                <span>
                                    {format(new Date(ambulance.createdAt), "dd MMM yyyy, hh:mm a")}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(ambulance.billStatus)}`}>
                                    {getStatusLabel(ambulance.billStatus)}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>


                {/* BODY */}
                <div className="flex-1 overflow-y-auto max-h-80 p-6 space-y-6">

                    {/* LOCATIONS */}
                    <Card className="p-5 bg-overview-card border-overview-strong shadow-sm">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-red-500" />
                            Service Locations
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Pickup Location</p>
                                <p className="bg-muted/40 p-3 rounded-lg border text-sm leading-relaxed">
                                    {ambulance.pickupLocation}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Dropoff Location</p>
                                <p className="bg-muted/40 p-3 rounded-lg border text-sm leading-relaxed">
                                    {ambulance.dropoffLocation}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* PATIENT + VEHICLE GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* PATIENT */}
                        <Card className="p-5 bg-overview-card border-overview-strong shadow-sm">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Patient Details
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Patient Name</p>
                                    <p className="text-base font-bold">{ambulance.patientName}</p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" /> Phone
                                    </p>
                                    <p className="text-base font-bold">{ambulance.patientPhone}</p>
                                </div>
                            </div>
                        </Card>

                        {/* VEHICLE */}
                        <Card className="p-5 bg-overview-card border-overview-strong shadow-sm">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-orange-500" />
                                Vehicle & Driver
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Vehicle Number</p>
                                    <p className="text-base font-bold">{ambulance.vehicleNumber}</p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Driver Name</p>
                                    <p className="text-base font-bold">{ambulance.driverName}</p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Trip Type</p>
                                    <p className="text-base font-bold capitalize">{ambulance.tripType}</p>
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* BILL SUMMARY */}
                    <Card className="p-6 bg-overview-card border-overview-strong shadow-md">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-500" />
                            Billing Summary
                        </h4>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-semibold">₹{bill.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-semibold text-destructive">-₹{discountAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
                                <span className="font-semibold text-green-600">+₹{taxAmount.toFixed(2)}</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold bg-muted/40 p-3 rounded-lg">
                                <span>Net Amount</span>
                                <span className="text-green-600">₹{netAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid Amount</span>
                                <span className="font-semibold text-green-600">₹{paidAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm font-bold">
                                <span>Balance Amount</span>
                                <span className={balanceAmount > 0 ? "text-destructive" : "text-green-600"}>
                                    ₹{balanceAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* FOOTER */}
                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>

    );
}
