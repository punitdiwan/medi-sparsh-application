"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, Search, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { useAbility } from "@/components/providers/AbilityProvider";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { AmbulanceManagementDialog, AmbulanceVehicleFormData } from "./AmbulanceManagementDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AmbulanceVehicle = {
    id: string;
    vehicleNumber: string;
    vehicleModel: string;
    ambulanceType: "Owned" | "Rented";
    driverName?: string;
    driverContactNumber?: string;
    driverLicense?: string;
    status: "Active" | "Maintenance" | "Inactive";
    yearMade: string;
    notes?: string;
    isDeleted: boolean;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const DUMMY_VEHICLES: AmbulanceVehicle[] = [
    {
        id: "1",
        vehicleNumber: "KA-01-AB-1234",
        vehicleModel: "Toyota Innova",
        ambulanceType: "Owned",
        driverName: "Michael Smith",
        driverContactNumber: "9876543210",
        driverLicense: "DL-1234567890",
        status: "Active",
        yearMade: "2010",
        isDeleted: false,
        notes: "This is a dummy vehicle",
    },
    {
        id: "2",
        vehicleNumber: "KA-05-XY-5678",
        vehicleModel: "Force Traveller",
        ambulanceType: "Rented",
        driverName: "David Johnson",
        driverContactNumber: "1234509876",
        driverLicense: "DL-0987654321",
        status: "Maintenance",
        yearMade: "2012",
        isDeleted: false,
        notes: "This is a dummy vehicle",
    },
    {
        id: "3",
        vehicleNumber: "KA-02-CD-9999",
        vehicleModel: "Maruti Omni",
        ambulanceType: "Owned",
        driverName: "Sarah Williams",
        driverContactNumber: "5551234567",
        driverLicense: "DL-1122334455",
        status: "Active",
        yearMade: "2008",
        isDeleted: false,
        notes: "This is a dummy vehicle",
    },
];

export default function AmbulanceManagementPage() {
    const [vehicles, setVehicles] = useState<AmbulanceVehicle[]>(DUMMY_VEHICLES);
    const [search, setSearch] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);
    const ability = useAbility();
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "vehicleNumber",
        "vehicleModel",
        "ambulanceType",
        "driverName",
        "status",
    ]);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [editingVehicle, setEditingVehicle] = useState<AmbulanceVehicle | null>(null);

    const filteredVehicles = useMemo(() => {
        const query = search.toLowerCase().trim();
        let filtered = vehicles;

        if (!showDeleted) {
            filtered = filtered.filter(v => !v.isDeleted);
        }

        if (!query) return filtered;

        return filtered.filter((v) =>
            v.vehicleNumber.toLowerCase().includes(query) ||
            (v.driverName && v.driverName.toLowerCase().includes(query))
        );
    }, [search, vehicles, showDeleted]);

    const handleAddVehicle = () => {
        setDialogMode("add");
        setEditingVehicle(null);
        setIsDialogOpen(true);
    };

    const handleEditVehicle = (vehicle: AmbulanceVehicle) => {
        setDialogMode("edit");
        setEditingVehicle(vehicle);
        setIsDialogOpen(true);
    };

    const handleStatusChange = (id: string, newStatus: AmbulanceVehicle["status"]) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        toast.success(`Vehicle status updated to ${newStatus}`);
    };

    const handleDialogSubmit = (data: AmbulanceVehicleFormData) => {
        if (dialogMode === "add") {
            const newVehicle: AmbulanceVehicle = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                status: "Active",
                yearMade: "2010",
                isDeleted: false,
            };
            setVehicles([...vehicles, newVehicle]);
            toast.success("Vehicle added successfully");
        } else if (dialogMode === "edit" && editingVehicle) {
            setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...data } : v));
            toast.success("Vehicle updated successfully");
        }
    };

    const handleDelete = (id: string) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isDeleted: true } : v));
        toast.success("Vehicle deleted (dummy)");
    };

    const handleRestore = (id: string) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isDeleted: false } : v));
        toast.success("Vehicle restored (dummy)");
    };

    const allColumns: ColumnDef<AmbulanceVehicle>[] = [
        {
            id: "sno",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        { accessorKey: "vehicleNumber", header: "Vehicle Number" },
        { accessorKey: "vehicleModel", header: "Vehicle Model" },
        { accessorKey: "yearMade", header: "Year Made" },
        { accessorKey: "ambulanceType", header: "Ambulance Type" },
        { accessorKey: "driverName", header: "Driver Name" },
        { accessorKey: "driverContactNumber", header: "Driver Contact" },
        { accessorKey: "driverLicense", header: "Driver License" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const colors = {
                    Active: "bg-green-100 text-green-800 hover:bg-green-200",
                    Maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    Inactive: "bg-red-100 text-red-800 hover:bg-red-200",
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${colors[status] || "bg-gray-100"}`}>
                                {status}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "Active")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "Maintenance")}>
                                Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "Inactive")}>
                                Inactive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        },
        {
            accessorKey: "notes",
            header: "Notes",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {!row.original.isDeleted ? (
                        <>
                            {/* <Can I="update" a="ambulanceManagement" ability={ability}> */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditVehicle(row.original)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit Vehicle</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {/* </Can> */}
                            {/* <Can I="delete" a="ambulanceManagement" ability={ability}> */}
                            <ConfirmDialog
                                title="Delete Vehicle"
                                description={`Are you sure you want to delete ${row.original.vehicleNumber}?`}
                                onConfirm={() => handleDelete(row.original.id)}
                                trigger={
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                }
                            />
                            {/* </Can> */}
                        </>
                    ) : (
                        // <Can I="update" a="ambulanceManagement" ability={ability}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleRestore(row.original.id)}>
                                        <RotateCcw className="w-4 h-4 text-green-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Restore Vehicle</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        // </Can>
                    )}
                </div>
            ),
        },
    ];

    const columns = useMemo(() => {
        const filtered = allColumns.filter((col) => {
            if (col.id === "actions" || col.id === "sno") return true;
            const key = "accessorKey" in col ? col.accessorKey : undefined;
            return key && visibleFields.includes(key as string);
        });
        const actionCol = allColumns.find((c) => c.id === "actions");
        const finalCols = filtered.filter(c => c.id !== "actions");
        if (actionCol) finalCols.push(actionCol);
        return finalCols;
    }, [visibleFields, allColumns]);

    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-6 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Ambulance Management</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Manage ambulance fleet, drivers, and maintenance schedules.
                    </p>
                </div>
            </Card>

            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vehicle, driver..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-deleted"
                            checked={showDeleted}
                            onCheckedChange={setShowDeleted}
                        />
                        <Label htmlFor="show-deleted">Show Deleted</Label>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <FieldSelectorDropdown
                        columns={allColumns as TypedColumn<AmbulanceVehicle>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                    {/* <Can I="create" a="ambulanceManagement" ability={ability}> */}
                    <Button variant="default" onClick={handleAddVehicle}>
                        <Plus size={16} /> Add Vehicle
                    </Button>
                    {/* </Can> */}
                </div>
            </div>

            <Table data={filteredVehicles} columns={columns} />

            <AmbulanceManagementDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                defaultValues={editingVehicle ? {
                    vehicleNumber: editingVehicle.vehicleNumber,
                    vehicleModel: editingVehicle.vehicleModel,
                    ambulanceType: editingVehicle.ambulanceType,
                    driverName: editingVehicle.driverName,
                    driverContactNumber: editingVehicle.driverContactNumber,
                    driverLicense: editingVehicle.driverLicense,
                } : undefined}
                onSubmit={handleDialogSubmit}
            />
        </div>
    );
}
