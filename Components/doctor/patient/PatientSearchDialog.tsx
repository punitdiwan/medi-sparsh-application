"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PatientSearchBox from "../appointment/searchPatient";
import { User, Phone, Mail, IdCard, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Patient = {
    id: string;
    patient_id: string;
    name: string;
    email: string;
    mobileNumber: string;
};

interface PatientSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (patient: Patient) => void;
    title?: string;
    description?: string;
}

export default function PatientSearchDialog({
    open,
    onOpenChange,
    onSelect,
    title = "Search Patient",
    description = "Search for an existing patient or add a new one to proceed.",
}: PatientSearchDialogProps) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
    };

    const handleConfirm = () => {
        if (selectedPatient) {
            onSelect(selectedPatient);
            onOpenChange(false);
            setSelectedPatient(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setSelectedPatient(null);
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-2xl border border-dialog bg-dialog-surface p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Search Patient</label>
                        <PatientSearchBox onSelect={handlePatientSelect} />
                    </div>

                    {selectedPatient && (
                        <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{selectedPatient.name}</h3>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            ID: {selectedPatient.patient_id}
                                        </Badge>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Selected
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4 text-primary/60" />
                                    <span className="text-foreground font-medium">{selectedPatient.mobileNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4 text-primary/60" />
                                    <span className="text-foreground font-medium truncate">{selectedPatient.email || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <IdCard className="h-4 w-4 text-primary/60" />
                                    <span className="text-foreground font-medium">System ID: {selectedPatient.id}</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-dialog flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-dialog-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedPatient}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Select Patient
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
