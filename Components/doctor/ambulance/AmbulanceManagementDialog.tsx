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
    ambulanceType: z.enum(["Owned", "Rented"]),
    driverName: z.string().optional(),
    yearMade: z.string().optional(),
    driverContactNumber: z.string().optional(),
    driverLicense: z.string().optional(),
    Notes: z.string().optional(),
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
            ambulanceType: "Owned",
            driverName: "",
            yearMade: "",
            driverContactNumber: "",
            driverLicense: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (mode === "edit" && defaultValues) {
                form.reset(defaultValues);
            } else {
                form.reset({
                    vehicleNumber: "",
                    vehicleModel: "",
                    ambulanceType: "Owned",
                    driverName: "",
                    driverContactNumber: "",
                    driverLicense: "",
                });
            }
        }
    }, [open, mode, defaultValues, form]);

    const handleSubmit = (data: AmbulanceVehicleFormData) => {
        onSubmit(data);
        onOpenChange(false);
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
                                            <FormLabel>Vehicle Number</FormLabel>
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
                                            <FormLabel>Vehicle Model</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Toyota Innova" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearMade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year Made</FormLabel>
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
                                            <FormLabel>Driver Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverContactNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driverLicense"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver License</FormLabel>
                                            <FormControl>
                                                <Input placeholder="DL-1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="ambulanceType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ambulance Type</FormLabel>
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
                                                        <SelectItem value="Owned">Owned</SelectItem>
                                                        <SelectItem value="Rented">Rented</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="Notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Notes" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
