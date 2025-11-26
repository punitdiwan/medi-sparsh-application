"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";

type Bed = {
    id: string;
    name: string;
    floorName: string;
    bedGroupName: string;
    bedTypeName: string;
    ward: string;
    status?: "occupied" | "vacant" | "reserved" | "cleaning";
    patientName?: string;
    updatedAt?: string;
};

type FullScreenBedModalProps = {
    isOpen: boolean;
    onClose: () => void;
    fetchUrl?: string;
    initialData?: Bed[];
    pollInterval?: number;
};

export const FullScreenBedModal = ({
    isOpen,
    onClose,
    fetchUrl,
    initialData = [],
    pollInterval = 0,
}: FullScreenBedModalProps) => {
    const [beds, setBeds] = useState<Bed[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [wardFilter, setWardFilter] = useState("All");
    const [sortBy, setSortBy] = useState("bedNumber");
    const [onlyVacant, setOnlyVacant] = useState(false);

    async function fetchBeds(signal?: AbortSignal) {
        if (!fetchUrl) return;
        try {
            setLoading(true);
            const res = await fetch(fetchUrl, { signal });
            const data = await res.json();
            const mapped = data.map((b: any) => ({
                id: b.id,
                name: b.name,
                floorName: b.floorName,
                bedGroupName: b.bedGroupName,
                bedTypeName: b.bedTypeName,
                ward: b.ward,
                patientName: b.patientName ?? "",
                status: b.status || "vacant",
                updatedAt: b.updatedAt,
            }));
            setBeds(mapped);
            setError(null);
        } catch (err: any) {
            if (err.name !== "AbortError") setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isOpen || !fetchUrl) return;
        const controller = new AbortController();
        fetchBeds(controller.signal);

        let timer: any = null;
        if (pollInterval > 0) {
            timer = setInterval(() => fetchBeds(new AbortController().signal), pollInterval);
        }

        return () => {
            controller.abort();
            if (timer) clearInterval(timer);
        };
    }, [isOpen, fetchUrl, pollInterval]);

    const wards = useMemo(() => {
        const setW = new Set(beds.map((b) => b.ward || "Unknown"));
        return ["All", ...Array.from(setW)];
    }, [beds]);

    const visibleBeds = useMemo(() => {
        let list = beds.slice();
        if (query) {
            const q = query.toLowerCase();
            list = list.filter(
                (b) =>
                    b.name.toLowerCase().includes(q) ||
                    (b.patientName && b.patientName.toLowerCase().includes(q)) ||
                    (b.ward && b.ward.toLowerCase().includes(q))
            );
        }
        if (wardFilter !== "All") list = list.filter((b) => (b.ward || "Unknown") === wardFilter);
        if (onlyVacant) list = list.filter((b) => b.status === "vacant");

        // Sort by bedNumber or status
        list.sort((a, b) => {
            if (sortBy === "bedNumber") return a.name.localeCompare(b.name, undefined, { numeric: true });
            if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
            return 0;
        });

        return list;
    }, [beds, query, wardFilter, sortBy, onlyVacant]);

    // Group by floor -> ward -> bed group
    const groupedBeds = useMemo(() => {
        const result: Record<string, Record<string, Record<string, Bed[]>>> = {};
        visibleBeds.forEach((bed) => {
            const floor = bed.floorName || "Unknown Floor";
            const ward = bed.ward || "Unknown Ward";
            const group = bed.bedGroupName || "Unknown Group";

            if (!result[floor]) result[floor] = {};
            if (!result[floor][ward]) result[floor][ward] = {};
            if (!result[floor][ward][group]) result[floor][ward][group] = [];

            result[floor][ward][group].push(bed);
        });

        const orderedResult: typeof result = {};
        ["Ground", "First", "Second"].forEach((floor) => {
            if (result[floor]) orderedResult[floor] = result[floor];
        });
        Object.keys(result).forEach((floor) => {
            if (!["Ground", "First", "Second"].includes(floor)) orderedResult[floor] = result[floor];
        });

        return orderedResult;
    }, [visibleBeds]);

    const summary = useMemo(() => {
        const total = beds.length;
        const occupied = beds.filter((b) => b.status === "occupied").length;
        const vacant = beds.filter((b) => b.status === "vacant").length;
        const reserved = beds.filter((b) => b.status === "reserved").length;
        const cleaning = beds.filter((b) => b.status === "cleaning").length;
        return { total, occupied, vacant, reserved, cleaning };
    }, [beds]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Hospital bed status full screen modal"
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose?.();
            }}
        >
            <div className="relative h-[92vh] w-full max-w-[1400px] overflow-hidden rounded-2xl bg-background shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 border-b p-4">
                    <div>
                        <h2 className="text-xl font-semibold">Hospital Bed Status</h2>
                        <p className="text-sm text-muted-foreground">Live overview of bed occupancy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 text-sm">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">Total</span>
                                <span className="font-medium">{summary.total}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">Vacant</span>
                                <span className="font-medium text-[var(--chart-1)]">{summary.vacant}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">Occupied</span>
                                <span className="font-medium text-[var(--destructive)]">{summary.occupied}</span>
                            </div>
                        </div>

                        <Button onClick={() => fetchBeds()} className="rounded-md border px-3 py-2 text-sm">
                            Refresh
                        </Button>
                        <Button onClick={onClose} className="rounded-md px-3 py-2 text-sm">
                            Close
                        </Button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by bed, patient, or ward"
                            className="w-[260px] rounded-md border px-3 py-2 text-sm"
                        />

                        <select
                            value={wardFilter}
                            onChange={(e) => setWardFilter(e.target.value)}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            {wards.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>

                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={onlyVacant} onChange={(e) => setOnlyVacant(e.target.checked)} /> Only
                            vacant
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm">Sort</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="bedNumber">Bed number</option>
                            <option value="status">Status</option>
                        </select>

                        <div className="text-sm text-muted-foreground">
                            {loading ? "Loading..." : error ? `Error: ${error}` : `${visibleBeds.length} shown`}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="h-[calc(92vh-160px)] overflow-auto p-4 scrollbar-show">
                    {Object.keys(groupedBeds).length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center text-sm text-muted-foreground">No beds to show.</div>
                        </div>
                    ) : (
                        Object.entries(groupedBeds).map(([floorName, wards]) => (
                            <div key={floorName} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    {floorName.includes("Floor") ? floorName : `${floorName} Floor`}
                                </h3>
                                {Object.entries(wards).map(([wardName, groups]) => (
                                    <div key={wardName} className="mb-4 ml-4">
                                        <h4 className="text-md font-medium mb-2">{wardName}</h4>
                                        {Object.entries(groups).map(([groupName, beds]) => (
                                            <div key={groupName} className="mb-3 ml-4">
                                                <h5 className="text-sm font-medium mb-1">{groupName}</h5>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                    {beds.map((bed) => (
                                                        <BedCard key={bed.id} bed={bed} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 border-t p-3 text-sm">
                    <div className="text-xs text-muted-foreground">Last refreshed: {new Date().toLocaleString()}</div>
                    <div>Tip: Click a bed card to view or navigate to details.</div>
                </div>
            </div>
        </div>
    );
};

type BedCardProps = { bed: Bed };

const BedCard = ({ bed }: BedCardProps) => {
    const statusColor = {
        occupied: "bg-[var(--destructive)] text-[var(--card-foreground)]",
        vacant: "bg-[var(--chart-1)] text-[var(--card-foreground)]",
        reserved: "bg-[var(--chart-4)] text-[var(--card-foreground)]",
        cleaning: "bg-[var(--chart-3)] text-[var(--card-foreground)]",
    }[bed.status || "vacant"];

    return (
        <div className="flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground">Bed No</div>
                    <div className="text-lg font-semibold">{bed.name}</div>
                    <div className="text-xs text-muted-foreground">Floor: {bed.floorName}</div>
                    <div className="text-xs text-muted-foreground">Ward: {bed.bedGroupName}</div>
                    <div className="text-xs text-muted-foreground">Type: {bed.bedTypeName}</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>{bed.status}</div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    <div className="text-xs text-muted-foreground">Patient</div>
                    <div className="text-sm">{bed.patientName || "—"}</div>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                    <div>Updated</div>
                    <div>{bed.updatedAt ? new Date(bed.updatedAt).toLocaleString() : "-"}</div>
                </div>
            </div>
        </div>
    );
};
