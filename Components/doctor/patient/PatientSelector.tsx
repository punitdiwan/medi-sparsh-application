"use client";

import  { useEffect, useState } from "react";
import PatientSearchBox from "../appointment/searchPatient";
import { User, Phone, Mail, IdCard, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getShortId } from "@/utils/getShortId";

type Patient = {
    id: string;
    patient_id: string;
    name: string;
    email: string;
    mobileNumber: string;
};

interface PatientSelectorProps {
    value: Patient | null;
    onSelect: (patient: Patient | null) => void;
    title?: string;
    disabled?: boolean;
}

export default function PatientSelector({
    value,
    onSelect,
    title = "Search Patient",
    disabled
}: PatientSelectorProps) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        onSelect(patient);
    };

    const handleClear = () => {
        setSelectedPatient(null);
        onSelect(null);
    };

    useEffect(() => {
        setSelectedPatient(value);
    }, [value]);

    return (
        <div className="space-y-4 w-full">
            {!selectedPatient ? (
                <div className="space-y-2">
                    {title && <label className="text-sm font-medium text-foreground">{title}</label>}
                    <div className="relative">
                            <PatientSearchBox onSelect={handlePatientSelect} />
                    </div>
                </div>
            ) : (
                <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-foreground">{selectedPatient.name}</h3>
                                <Badge variant="outline" className="text-[10px] h-4 font-normal px-1">
                                    ID: {getShortId(selectedPatient.id)}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 h-6 px-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Selected
                            </Badge>
                            {!disabled&&<Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-foreground font-medium">{selectedPatient.mobileNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-foreground font-medium truncate">{selectedPatient.email || "N/A"}</span>
                        </div>
                    </div>

                    {/* Subtle background decoration */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User className="h-24 w-24" />
                    </div>
                </Card>
            )}
        </div>
    );
}
