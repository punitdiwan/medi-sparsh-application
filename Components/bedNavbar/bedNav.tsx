"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FloorSection } from "./bedFloor";
import { Floor } from "./bedNavType";
import { Portal } from "@/components/ui/Portal";
import { getBedManagementData } from "@/lib/actions/bedActions";
import { toast } from "sonner";

export const zIndex = {
    sidebar: 10,
    header: 20,
    dropdown: 100,
    modal: 10000,
    tooltip: 11000,
};

export function BedManagementOverlay({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            window.addEventListener("keydown", handler);
            document.body.style.overflow = "hidden"; //stop background scroll

            const fetchData = async () => {
                try {
                    setLoading(true);              
                    const res = await getBedManagementData();

                    if (res.data) {
                    setFloors(res.data as Floor[]);
                    } else if (res.error) {
                    toast.error(res.error);
                    }
                } catch (err) {
                    toast.error("Failed to load bed data");
                } finally {
                    setLoading(false);             
                }
            };
            fetchData();
        }

        return () => {
            window.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    const bedStats = floors.reduce(
        (acc, floor) => {
            floor.wards.forEach((ward) => {
                ward.beds.forEach((bed) => {
                    acc.total += 1;
                    if (bed.status === "occupied") acc.occupied += 1;
                    if (bed.status === "active") acc.active += 1;
                    if (bed.status === "maintenance") acc.maintenance += 1;
                });
            });
            return acc;
        },
        { total: 0, occupied: 0, active: 0, maintenance: 0 }
    );

    const occupancyPercent = bedStats.total
        ? Math.round((bedStats.occupied / bedStats.total) * 100)
        : 0;


    if (!open) return null;

    return (
        <Portal>
            <div className={`fixed inset-0 z-[${zIndex.modal}] bg-black  p-2`}>
                {/* backdrop */}
                <div
                    className="absolute inset-0 "
                />

                {/* content */}
                <div className="relative w-full bg-overview-muted isolate rounded-xl">
                    {/* header */}
                    <div className="sticky top-0 z-99999 bg-dialog-header border-b border-dialog rounded-t-xl shadow-md">
                        <div className="flex items-center justify-between p-4">
                            <h2 className="text-2xl font-bold">Bed Status</h2>
                            {/* Stats */}
                            <div className="flex gap-4 px-4 justify-center">
                                <StatCard
                                    label="Total Beds"
                                    value={bedStats.total}
                                    color="bg-slate-100 text-slate-700"
                                />
                                <StatCard
                                    label="Occupied"
                                    value={bedStats.occupied}
                                    color="bg-red-100 text-red-700"
                                />
                                <StatCard
                                    label="Available"
                                    value={bedStats.active}
                                    color="bg-green-100 text-green-700"
                                />
                                <StatCard
                                    label="Cleaning"
                                    value={bedStats.maintenance}
                                    color="bg-yellow-100 text-yellow-700"
                                />
                                <div className="ml-4">
                                    <p className="text-sm text-muted-foreground">
                                        Occupancy Rate
                                    </p>
                                    <p className="text-lg font-bold text-red-600">
                                        {occupancyPercent}%
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-md p-2 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* body */}
                    <div className="p-6 h-[calc(95vh-64px)] overflow-y-auto">
                         {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                                        <p className="text-sm text-muted-foreground">
                                            Loading bed status...
                                        </p>
                                    </div>
                                </div>
                            ) : (<div className="space-y-8 ">
                                {floors.map((floor) => (
                                    <FloorSection key={floor.id} floor={floor} />
                                ))}
                            </div>)}
                    </div>
                </div>
            </div>
        </Portal>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div
            className={`rounded-lg px-2 py-1 min-w-[100px] ${color}`}
        >
            <p className="text-sm">{label}</p>
            <p className="text-md font-bold">{value}</p>
        </div>
    );
}
