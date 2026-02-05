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
                return "bg-overview-success text-white dark:bg-overview-success dark:text-white";
            case "pending":
                return "bg-overview-warning text-white dark:bg-overview-warning dark:text-white";
            case "partially_paid":
                return "bg-overview-info text-white dark:bg-overview-info dark:text-white";
            default:
                return "bg-gray-500 text-white dark:bg-gray-600 dark:text-white";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-dialog p-0 border-dialog">
                <DialogHeader className="px-6 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white border-b">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Ambulance Bill Details
                    </DialogTitle>
                </DialogHeader>


                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto ">
                    {/* Header with Bill ID and Status */}
                    <div className="flex items-center justify-between border-b border-dialog pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-dialog">{ambulance.id}</h3>
                            <p className="text-xs text-dialog-muted mt-1">
                                {format(new Date(ambulance.createdAt), "dd MMM yyyy, hh:mm a")}
                            </p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(ambulance.billStatus)}`}>
                            {getStatusLabel(ambulance.billStatus)}
                        </span>
                    </div>

                    {/* Patient Details Section */}
                    <Card className="p-5 rounded-xl border border-dialog shadow-sm bg-dialog-surface">

                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-dialog">
                            <User className="h-5 w-5 text-blue-500" />
                            Patient Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Patient Name</p>
                                <p className="text-base font-bold text-dialog">{ambulance.patientName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    Contact Number
                                </p>
                                <p className="text-base font-bold text-dialog">{ambulance.patientPhone}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Vehicle and Driver Details Section */}
                    <Card className="p-5 rounded-xl border border-dialog shadow-sm bg-dialog-surface">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-dialog">
                            <Truck className="h-5 w-5 text-orange-500" />
                            Vehicle & Driver
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Vehicle Number</p>
                                <p className="text-base font-bold text-dialog">{ambulance.vehicleNumber}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Driver Name</p>
                                <p className="text-base font-bold text-dialog">{ambulance.driverName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Trip Type</p>
                                <p className="text-base font-bold text-dialog capitalize">{ambulance.tripType}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Pickup and Dropoff Locations */}
                    <Card className="p-4 bg-dialog-surface border-dialog">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-3 text-dialog">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <MapPin className="h-5 w-5 text-overview-danger" />
                            </div>
                            Service Locations
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Pickup Location</p>
                                <p className="text-sm font-medium bg-muted/40 p-3 rounded-lg border border-border text-dialog leading-relaxed">
                                    {ambulance.pickupLocation}
                                </p>

                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-dialog-muted uppercase tracking-wide">Dropoff Location</p>
                                <p className="text-sm font-semibold bg-dialog-input p-3 rounded-lg border border-dialog text-dialog">
                                    {ambulance.dropoffLocation}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Billing Details Section */}
                    <Card className="p-5 rounded-xl border border-dialog shadow-sm bg-dialog-surface">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-dialog">
                            <Calendar className="h-5 w-5 text-green-500" />
                            Billing Summary
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-dialog/30">
                                <span className="text-sm font-semibold text-dialog-muted">Total Amount</span>
                                <span className="text-sm font-bold text-dialog">₹{bill.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dialog/30">
                                <span className="text-sm font-semibold text-dialog-muted">Discount</span>
                                <span className="text-sm font-bold text-overview-danger">-₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dialog/30">
                                <span className="text-sm font-semibold text-dialog-muted">Tax ({taxPercent}%)</span>
                                <span className="text-sm font-bold text-overview-success">+₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border font-semibold">
                                <span className="text-dialog">Net Amount</span>
                                <span className="text-lg font-bold text-green-600">₹{netAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dialog/30">
                                <span className="text-sm font-semibold text-dialog-muted">Paid Amount</span>
                                <span className="text-sm font-bold text-overview-success">₹{paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-semibold text-dialog-muted">Balance Amount</span>
                                <span className={`text-sm font-bold ${balanceAmount > 0 ? "text-overview-danger" : "text-overview-success"}`}>
                                    ₹{balanceAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/40 border-t flex justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>

                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Bill
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
