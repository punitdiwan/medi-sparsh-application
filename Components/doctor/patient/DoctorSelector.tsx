"use client";

import React, { useState, useEffect } from "react";
import { User, Search, Plus, CheckCircle2, X, Hospital, UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

interface Doctor {
    id: string;
    name: string;
    specialization?: string;
    isInternal: boolean;
}

interface DoctorSelectorProps {
    value: Doctor | null;
    onSelect: (doctor: Doctor | null) => void;
    title?: string;
    appMode: "hospital" | "manual";
    disabled?: boolean;
}

export default function DoctorSelector({
    value,
    onSelect,
    title = "Select Doctor",
    appMode,
    disabled
}: DoctorSelectorProps) {
    const [mode, setMode] = useState<"hospital" | "manual">(
        appMode === "hospital" ? "hospital" : "manual"
    );
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [manualName, setManualName] = useState("");
    const [search, setSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (mode === "hospital") {
            fetchDoctors();
        }
    }, [mode]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/employees");
            const result = await response.json();
            if (result.success) {
                const doctorsList = result.data
                    .filter((emp: any) => emp.doctorData)
                    .map((doc: any) => ({
                        id: doc.user.id,
                        name: doc.user.name,
                        specialization: doc.doctorData?.specialization?.[0]?.name || "General",
                        isInternal: true,
                    }));
                setDoctors(doctorsList);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error("Failed to load hospital doctors");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        onSelect(doctor);
        setIsDropdownOpen(false);
        setSearch("");
    };

    const handleManualSubmit = () => {
        if (!manualName.trim()) return;
        const doctor = {
            id: `manual-${Date.now()}`,
            name: manualName,
            isInternal: false,
        };
        setSelectedDoctor(doctor);
        onSelect(doctor);
    };

    const handleClear = () => {
        setSelectedDoctor(null);
        setManualName("");
        onSelect(null);
    };
    useEffect(() => {
        setSelectedDoctor(value);
    }, [value]);

    return (
        <div className="space-y-4 w-full">
            {!selectedDoctor ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        {title && <label className="text-sm font-medium text-foreground">{title}</label>}
                        {appMode === "hospital" && <div className="flex bg-muted p-1 rounded-md">
                            <Button
                                variant={mode === "hospital" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setMode("hospital")}
                                className="h-7 text-xs px-2 gap-1.5"
                            >
                                <Hospital className="h-3.5 w-3.5" />
                                Hospital
                            </Button>
                            <Button
                                variant={mode === "manual" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setMode("manual")}
                                className="h-7 text-xs px-2 gap-1.5"
                            >
                                <UserCog className="h-3.5 w-3.5" />
                                Manual
                            </Button>
                        </div>}
                    </div>

                    {mode === "hospital" ? (
                        <div className="relative">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search hospital doctor..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="pl-9 bg-white/50 focus:bg-white transition-all shadow-sm"
                                />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
                                    <Command>
                                        <CommandList className="max-h-60">
                                            {loading ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                                            ) : (
                                                <>
                                                    <CommandEmpty>No doctors found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {doctors
                                                            .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
                                                            .map((doc) => (
                                                                <CommandItem
                                                                    key={doc.id}
                                                                    onSelect={() => handleSelect(doc)}
                                                                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <User className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-sm">{doc.name}</span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            {doc.specialization}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </>
                                            )}
                                        </CommandList>
                                    </Command>
                                    <div className="p-2 border-t bg-muted/30">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full h-8 text-xs"
                                        >
                                            Close Search
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter doctor name..."
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                className="bg-white/50 focus:bg-white transition-all shadow-sm"
                            />
                            <Button onClick={handleManualSubmit} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                {selectedDoctor.isInternal ? (
                                    <Hospital className="h-5 w-5 text-primary" />
                                ) : (
                                    <UserCog className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-foreground">{selectedDoctor.name}</h3>
                                <Badge variant="outline" className="text-[10px] h-4 font-normal px-1">
                                    {selectedDoctor.isInternal ? "Hospital Doctor" : "External Doctor"}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none flex items-center gap-1 h-6 px-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Assigned
                            </Badge>
                            {!disabled && <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>}
                        </div>
                    </div>

                    {selectedDoctor.isInternal && selectedDoctor.specialization && (
                        <p className="text-xs text-muted-foreground ml-13 pl-1">
                            Specialization: <span className="text-foreground font-medium">{selectedDoctor.specialization}</span>
                        </p>
                    )}

                    {/* Subtle background decoration */}
                    {selectedDoctor.isInternal && selectedDoctor.specialization && (<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                        <Hospital className="h-20 w-20" />
                    </div>)}
                </Card>
            )}
        </div>
    );
}
