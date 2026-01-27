"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { ArrowUp, ArrowDown } from "lucide-react";

interface TrendCardProps {
    title: string;
    unit: string;
    values: number[];
    labels: string[];
}

export const TrendCard: React.FC<TrendCardProps> = ({
    title,
    unit,
    values,
    labels,
}) => {
    const isImproving = values[values.length - 1] < values[0];

    const data = labels.map((label, i) => ({
        name: label,
        min: values[i] - 5,
        max: values[i] + 5,
        avg: values[i],
    }));


    return (
        <div className="
      rounded-lg border p-4 space-y-3
      bg-white border-slate-200
      dark:bg-slate-900 dark:border-slate-700
    ">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {title}
                </h4>

                <span
                    className={`flex items-center gap-1 text-xs font-medium
            ${isImproving ? "text-emerald-600" : "text-rose-600"}
          `}
                >
                    {isImproving ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                    {isImproving ? "Improving" : "Worsening"}
                </span>
            </div>

            {/* Chart */}
            <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip />

                        {/* Wick (min → max) */}
                        <Bar dataKey="max" fill="#c4b5fd" barSize={2} />

                        {/* Body (avg) */}
                        <Bar dataKey="avg" fill="#7c3aed" barSize={8} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Footer */}
            <div className="text-xs text-slate-600 dark:text-slate-400">
                Latest:{" "}
                <span className="font-semibold">
                    {values[values.length - 1]} {unit}
                </span>
            </div>
        </div>
    );
};
