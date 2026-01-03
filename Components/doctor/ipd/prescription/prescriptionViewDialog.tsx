"use client";

import { getShortId } from "@/utils/getShortId";
import { Prescription } from "./prescriptionPageManager";
import { X, FileText, CalendarCheck, User2, Pill, Printer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function PrescriptionViewDialog({
    open,
    onClose,
    data,
}: {
    open: boolean;
    onClose: () => void;
    data: Prescription | null;
}) {



  const handlePrint = (id: string) => {
    alert(`Print prescription: ${id}`);
  };


    if (!open || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {/* BACKDROP */}
            <div
                className="absolute inset-0"
            />

            {/* MODAL CONTENT */}
            <div className="relative bg-white dark:bg-gray-900 w-[90vw] max-w-5xl overflow-auto max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 bg-dialog-header border-b border-dialog">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Prescription Details
                        </h2>
                        <span className="ml-4 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 font-semibold">
                            #{getShortId(data.prescriptionNo)}
                        </span>
                        
                    </div>
                    <div className="flex items-center gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                    <Printer size={18} onClick={() => handlePrint(data.id)}
                                        className="cursor-pointer"
                                    />
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                        </Tooltip>
                        <button
                            onClick={onClose}
                            className="cursor-pointer"
                        >
                            <X  />
                        </button>
                    </div>
                    
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Doctor & Date */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-2">
                            <User2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {data.doctorName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {new Date(data.date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Findings */}
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Findings</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{data.findings || "—"}</p>
                    </div>

                    {/* Medicines */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Pill className="h-5 w-5 text-red-500 dark:text-red-400" />
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Medicines</p>
                        </div>

                        <div className="rounded-lg border overflow-x-auto">
                            <table className="w-full table-auto border-separate border-spacing-0">
                                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Medicine</th>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Category</th>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Frequency</th>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Duration</th>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Timing</th>
                                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Instruction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.medicines.map((med, i) => (
                                        <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                            <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{med.name}</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{med.category}</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{med.frequency}</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{med.duration} days</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{med.timing}</td>
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{med.instruction || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                            <p className="text-gray-800 dark:text-gray-100">{data.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
