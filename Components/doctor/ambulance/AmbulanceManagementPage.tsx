"use client";

import { useState, useMemo, useEffect } from "react";
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
    getAmbulances,
    saveAmbulance,
} from "@/lib/actions/ambulanceActions";
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
    vehicleType: "owned" | "rented";
    driverName: string;
    driverContactNo: string;
    driverLicenseNo: string;
    status: "active" | "maintenance" | "inactive";
    vehicleYear: string;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

export default function AmbulanceManagementPage() {
    const [vehicles, setVehicles] = useState<AmbulanceVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isActiveOnly, setIsActiveOnly] = useState(true);
    const ability = useAbility();
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "vehicleNumber",
        "vehicleModel",
        "vehicleType",
        "driverName",
        "status",
    ]);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [editingVehicle, setEditingVehicle] = useState<AmbulanceVehicle | null>(null);

    const fetchVehicles = async () => {
        setLoading(true);
        const res = await getAmbulances(isActiveOnly);
        if (res.data) {
            setVehicles(res.data as AmbulanceVehicle[]);
        } else {
            toast.error(res.error || "Failed to fetch vehicles");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, [isActiveOnly]);

    const filteredVehicles = useMemo(() => {
        const query = search.toLowerCase().trim();
        let filtered = vehicles;

        if (!query) return filtered;

        return filtered.filter((v) =>
            v.vehicleNumber.toLowerCase().includes(query) ||
            (v.driverName && v.driverName.toLowerCase().includes(query))
        );
    }, [search, vehicles]);

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

    const handleStatusChange = async (id: string, newStatus: AmbulanceVehicle["status"]) => {
        const res = await saveAmbulance({ id, status: newStatus });
        if (res.data) {
            setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
            toast.success(`Vehicle status updated to ${newStatus}`);
            fetchVehicles();
        } else {
            toast.error(res.error || "Failed to update status");
        }
    };

    const handleDialogSubmit = async (data: AmbulanceVehicleFormData) => {
        const res = await saveAmbulance({
            ...(editingVehicle && { id: editingVehicle.id }),
            ...data,
        });

        if (res.data) {
            if (dialogMode === "add") {
                setVehicles([res.data as AmbulanceVehicle, ...vehicles]);
                toast.success("Vehicle added successfully");
            } else {
                setVehicles(prev => prev.map(v => v.id === editingVehicle?.id ? (res.data as AmbulanceVehicle) : v));
                toast.success("Vehicle updated successfully");
            }
            setIsDialogOpen(false);
        } else {
            toast.error(res.error || "Failed to save vehicle");
        }
    };


    const allColumns: ColumnDef<AmbulanceVehicle>[] = [
        {
            id: "sno",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        { accessorKey: "vehicleNumber", header: "Vehicle Number" },
        { accessorKey: "vehicleModel", header: "Vehicle Model" },
        { accessorKey: "vehicleYear", header: "Year Made" },
        { accessorKey: "vehicleType", header: "Ambulance Type" },
        { accessorKey: "driverName", header: "Driver Name" },
        { accessorKey: "driverContactNo", header: "Driver Contact" },
        { accessorKey: "driverLicenseNo", header: "Driver License" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const colors = {
                    active: "bg-green-100 text-green-800 hover:bg-green-200",
                    maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    inactive: "bg-red-100 text-red-800 hover:bg-red-200",
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors capitalize ${colors[status] || "bg-gray-100"}`}>
                                {status}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "active")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "maintenance")}>
                                Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "inactive")}>
                                Inactive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
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
                            id="view-mode"
                            checked={isActiveOnly}
                            onCheckedChange={setIsActiveOnly}
                        />
                        <Label htmlFor="view-mode">
                            {isActiveOnly ? "Active" : "In Active"}
                        </Label>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <FieldSelectorDropdown
                        columns={allColumns.filter(col => col.id !== "actions") as TypedColumn<AmbulanceVehicle>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                    <Button variant="default" onClick={handleAddVehicle}>
                        <Plus size={16} /> Add Vehicle
                    </Button>
                </div>
            </div>

            <Table data={filteredVehicles} columns={columns} loading={loading} />

            <AmbulanceManagementDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                defaultValues={editingVehicle || undefined}
                onSubmit={handleDialogSubmit}
            />
        </div>
    );
}
