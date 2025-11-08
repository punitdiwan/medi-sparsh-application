"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export function PaginationControl({
  currentPage,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions = [5, 10, 20, 50],
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  if (totalPages <= 1 && !onRowsPerPageChange) return null;

  return (
    <div className="flex flex-wrap justify-center items-center mt-6 gap-4 text-sm">
      {/* Rows per page selector */}
      {onRowsPerPageChange && (
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(val) => onRowsPerPageChange(Number(val))}
          >
            <SelectTrigger className="w-[80px] h-8 text-sm">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        <span>
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
