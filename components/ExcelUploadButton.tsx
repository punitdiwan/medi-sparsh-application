"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";

interface ExcelUploadButtonProps {
  onClick: () => void;
  tooltip?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ExcelUploadButton({
  onClick,
  tooltip = "Upload Excel",
  icon,
  disabled = false,
  className = "",
}: ExcelUploadButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={onClick}
            
          >
            {icon ?? <Upload className="w-5 h-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
