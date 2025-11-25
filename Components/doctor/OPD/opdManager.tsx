"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import OpdModal from "./opdModel";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { TfiWrite } from "react-icons/tfi";
import { FiMoreVertical } from "react-icons/fi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export const dynamic = "force-dynamic";

export default function OpdScreen() {
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("today");
    const [openModal, setOpenModal] = useState(false);

    const [page, setPage] = useState(1);
    const pageSize = 5;

    const [filters, setFilters] = useState<{ consultant: string | null }>({ consultant: null });


    useEffect(() => setMounted(true), []);

    const opdDataByTab: Record<string, any[]> = {
        today: [
            { id: 1, opdNo: "OPD101", patient: "Rahul Sharma", caseId: "C1001", date: "2025-01-05", generatedBy: "Admin", consultant: "Dr. Verma", reference: "Dr. Singh", symptoms: "Fever, Cold" },
            { id: 2, opdNo: "OPD102", patient: "Priya Patel", caseId: "C1002", date: "2025-01-05", generatedBy: "Reception", consultant: "Dr. Mehta", reference: "Dr. Rao", symptoms: "Headache" },
        ],
        upcoming: [
            { id: 3, opdNo: "OPD103", patient: "Ankit Singh", caseId: "C1003", date: "2025-01-10", generatedBy: "Admin", consultant: "Dr. Verma", reference: "Self", symptoms: "Chest Pain" },
            { id: 4, opdNo: "OPD104", patient: "Neha Sharma", caseId: "C1004", date: "2025-01-12", generatedBy: "Reception", consultant: "Dr. Mehta", reference: "Dr. Rao", symptoms: "Back Pain" },
        ],
        old: [
            { id: 5, opdNo: "OPD105", patient: "Rohan Mehta", caseId: "C1005", date: "2024-12-28", generatedBy: "Admin", consultant: "Dr. Verma", reference: "Dr. Singh", symptoms: "Fever" },
            { id: 6, opdNo: "OPD106", patient: "Sana Khan", caseId: "C1006", date: "2024-12-20", generatedBy: "Reception", consultant: "Dr. Mehta", reference: "Self", symptoms: "Headache" },
        ],
    };

    const opdData = opdDataByTab[activeTab] || [];

    const filteredData = useMemo(() => {
        return opdData
            .filter((item) => item.patient.toLowerCase().includes(search.toLowerCase()))
            .filter((item) => (filters.consultant ? item.consultant === filters.consultant : true));
    }, [search, filters, opdData]);

    const paginated = filteredData.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredData.length / pageSize);

    if (!mounted) return null;

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
                    <TabsList className="flex gap-2">
                        <TabsTrigger value="today">Today OPD</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming OPD</TabsTrigger>
                        <TabsTrigger value="old">Old OPD</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={() => setOpenModal(true)} className="ml-4">Add Appointment</Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search OPD..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-1/3"
                />

                <Select
                    value={filters.consultant ?? undefined}
                    onValueChange={(v) => setFilters({ ...filters, consultant: v })}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dr. Verma">Dr. Verma</SelectItem>
                        <SelectItem value="Dr. Mehta">Dr. Mehta</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearch("");
                        setFilters({ consultant: null });
                    }}
                >
                    Clear Filters
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>OPD No.</TableHead>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead>Case ID</TableHead>
                                    <TableHead>Appointment Date</TableHead>
                                    <TableHead>Generated By</TableHead>
                                    <TableHead>Consultant</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Symptoms</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.opdNo}</TableCell>
                                        <TableCell>{row.patient}</TableCell>
                                        <TableCell>{row.caseId}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.generatedBy}</TableCell>
                                        <TableCell>{row.consultant}</TableCell>
                                        <TableCell>{row.reference}</TableCell>
                                        <TableCell>{row.symptoms}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="cursor-pointer p-1">
                                                        <FiMoreVertical />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-20">
                                                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                        <TfiWrite /> Write
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                        <MdModeEdit /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
                                                        <MdDelete /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end items-center gap-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <span>Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>

            {openModal && <OpdModal open={openModal} onClose={() => setOpenModal(false)} />}
        </div>
    );
}
