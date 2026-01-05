import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bed, Ward } from "./bedNavType";
import { BedDouble } from "lucide-react";
import { PatientHoverCard } from "./patientHover";
import { zIndex } from "./bedNav";


export function WardCard({ ward }: { ward: Ward }) {
  return (
    <div className="rounded-2xl shadow-lg border border-border-surface bg-card p-4 hover:shadow-2xl transition-all duration-200">
       <div className="flex items-center justify-between mb-4">
        <h4 className="text-foreground">
          {ward.name}
        </h4>
        <span className="text-sm font-medium text-muted-foreground">
          {ward.beds.length} Beds
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {ward.beds.map((bed) => (
          <BedIcon key={bed.id} bed={bed} />
        ))}
      </div>
    </div>
  );
}
const bedStatusStyles: Record<
  "EMPTY" | "OCCUPIED" | "CLEANING",
  string
> = {
  EMPTY:
    "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300",
  OCCUPIED:
    "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300",
  CLEANING:
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
};


export function BedIcon({ bed }: { bed: Bed }) {
  const isEmpty = bed.status === "EMPTY";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            if (isEmpty) {
              // redirect or open admit modal
            }
          }}
          className={`h-20 w-20 rounded-xl flex flex-col items-center justify-center shadow-md
            ${bedStatusStyles[bed.status]}`}
        >
          <BedDouble className="h-8 w-8" />
          <span className="text-sm font-medium">{bed.bedNo}</span>
        </button>
      </TooltipTrigger>

      {bed.status === "OCCUPIED" && bed.patient && (
        <TooltipContent className="w-72 p-0"
            style={{ zIndex: zIndex.tooltip }}>
          <PatientHoverCard patient={bed.patient} bedNo={bed.bedNo} />
        </TooltipContent>
      )}
    </Tooltip>
  );
}
