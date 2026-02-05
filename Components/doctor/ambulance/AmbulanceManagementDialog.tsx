"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { Ambulance } from "lucide-react";

const formSchema = z.object({
    vehicleNumber: z.string().min(1, "Vehicle number is required"),
    vehicleModel: z.string().min(1, "Vehicle model is required"),
    vehicleType: z.enum(["owned", "rented"]),
    vehicleYear: z.string().min(1, "Vehicle year is required"),
    driverName: z.string().min(1, "Driver name is required"),
    driverContactNo: z.string().min(1, "Driver contact is required"),
    driverLicenseNo: z.string().min(1, "Driver license is required"),
    status: z.enum(["active", "inactive", "maintenance"]),
});

export type AmbulanceVehicleFormData = z.infer<typeof formSchema>;

interface AmbulanceManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "edit";
    defaultValues?: Partial<AmbulanceVehicleFormData>;
    onSubmit: (data: AmbulanceVehicleFormData) => void;
}

export function AmbulanceManagementDialog({
    open,
    onOpenChange,
    mode,
    defaultValues,
    onSubmit,
}: AmbulanceManagementDialogProps) {
    const form = useForm<AmbulanceVehicleFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicleNumber: "",
            vehicleModel: "",
            vehicleType: "owned",
            vehicleYear: "",
            driverName: "",
            driverContactNo: "",
            driverLicenseNo: "",
            status: "active",
        },
    });

    useEffect(() => {
        if (open) {
            if (mode === "edit" && defaultValues) {
                form.reset({
                    vehicleNumber: defaultValues.vehicleNumber || "",
                    vehicleModel: defaultValues.vehicleModel || "",
                    vehicleType: defaultValues.vehicleType || "owned",
                    vehicleYear: defaultValues.vehicleYear || "",
                    driverName: defaultValues.driverName || "",
                    driverContactNo: defaultValues.driverContactNo || "",
                    driverLicenseNo: defaultValues.driverLicenseNo || "",
                    status: defaultValues.status || "active",
                });
            } else {
                form.reset({
                    vehicleNumber: "",
                    vehicleModel: "",
                    vehicleType: "owned",
                    vehicleYear: "",
                    driverName: "",
                    driverContactNo: "",
                    driverLicenseNo: "",
                    status: "active",
                });
            }
        }
    }, [open, mode, defaultValues, form]);

    const handleSubmit = (data: AmbulanceVehicleFormData) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg">
                <DialogHeader className="border-b border-dialog px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg ">
                            <Ambulance className="bg-dialog-header text-dialog-icon" />
                        </div>
                        <DialogTitle className="text-lg font-semibold tracking-wide">
                            {mode === "add" ? "Add New Vehicle" : "Edit Vehicle"}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="px-6 py-2 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Number <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="KA-01-AB-1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicleModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Model <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Toyota Innova" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicleYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Year <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="2022" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="driverName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverContactNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Contact <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverLicenseNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver License <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="DL-1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Type <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="owned">Owned</SelectItem>
                                                    <SelectItem value="rented">Rented</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pb-1 text-dialog-muted flex justify-between">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                                    className="text-dialog-muted">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">
                                    {mode === "add" ? "Add Vehicle" : "Update Vehicle"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
