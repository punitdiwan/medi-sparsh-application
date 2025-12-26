"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Eye, Pencil, Trash2, Printer, Receipt } from "lucide-react";
import AddIPDChargesFullScreen from "./IPDChargesModel";

interface ChargeRecord {
  id: string;
  date: string;
  chargeName: string;
  chargeType: string;
  chargeCategory: string;
  quantity: number;
  standardCharges: number;
  discount: number;
  tax: number;
  amount: number;
  createdBy: string;
}

export default function IPDChargesManagerPage() {
  const [charges, setCharges] = useState<ChargeRecord[]>([
    {
      id: "CHG-001",
      date: "2025-12-24",
      chargeName: "MRI Scan",
      chargeType: "Radiology",
      chargeCategory: "Imaging",
      quantity: 1,
      standardCharges: 5000,
      discount: 500,
      tax: 225,
      amount: 4725,
      createdBy: "Dr. Smith",
    },
    {
      id: "CHG-002",
      date: "2025-12-23",
      chargeName: "Blood Test",
      chargeType: "Lab",
      chargeCategory: "Pathology",
      quantity: 3,
      standardCharges: 300,
      discount: 30,
      tax: 12.6,
      amount: 882.6,
      createdBy: "Nurse Jane",
    },
    {
      id: "CHG-003",
      date: "2025-12-22",
      chargeName: "X-Ray",
      chargeType: "Radiology",
      chargeCategory: "Imaging",
      quantity: 2,
      standardCharges: 800,
      discount: 80,
      tax: 36,
      amount: 1556,
      createdBy: "Dr. John",
    },
  ]);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  // Filter charges based on search term
  const filtered = useMemo(() => {
    if (!search) return charges;
    const term = search.toLowerCase();
    return charges.filter(
      (c) =>
        c.id.toLowerCase().includes(term) ||
        c.chargeName.toLowerCase().includes(term) ||
        c.chargeType.toLowerCase().includes(term) ||
        c.chargeCategory.toLowerCase().includes(term)
    );
  }, [charges, search]);

  const handleEdit = (charge: ChargeRecord) => {
    alert(`Edit charge ${charge.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this charge?")) {
      setCharges((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handlePrint = (charge: ChargeRecord) => {
    alert(`Print charge ${charge.id}`);
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER / SEARCH */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <Receipt className="bg-dialog-header text-dialog-icon" />
            Charges
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">

              <Input
                placeholder="Search by bill ID / charge name / type / category"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="sm:w-72"
              />
            <Button onClick={() => setOpenAdd(true)} className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">
              <PlusCircle className="h-5 w-5" /> Add Charges
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* CHARGES TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Date</TableHead>
                <TableHead className="text-dialog-icon">Charge Name</TableHead>
                <TableHead className="text-dialog-icon">Charge Type</TableHead>
                <TableHead className="text-dialog-icon">Charge Category</TableHead>
                <TableHead className="text-dialog-icon">Quantity</TableHead>
                <TableHead className="text-dialog-icon">Standard Charges</TableHead>
                <TableHead className="text-dialog-icon">Discount</TableHead>
                <TableHead className="text-dialog-icon">Tax</TableHead>
                <TableHead className="text-dialog-icon">Amount</TableHead>
                <TableHead className="text-center text-dialog-icon">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className=" text-dialog-muted">{c.date}</TableCell>
                    <TableCell className="text-dialog-muted">{c.chargeName}</TableCell>
                    <TableCell className="text-dialog-muted">{c.chargeType}</TableCell>
                    <TableCell className="text-dialog-muted">{c.chargeCategory}</TableCell>
                    <TableCell className="text-dialog-muted">{c.quantity}</TableCell>
                    <TableCell className="text-dialog-muted">₹ {c.standardCharges.toFixed(2)}</TableCell>
                    <TableCell className="text-dialog-muted">₹ {c.discount.toFixed(2)}</TableCell>
                    <TableCell className="text-dialog-muted">₹ {c.tax.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹ {c.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <div className="flex gap-2 justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handlePrint(c)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handleEdit(c)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="destructive" onClick={() => handleDelete(c.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-400">
                    No charges found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD CHARGES FULLSCREEN */}
      <AddIPDChargesFullScreen
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      />
    </div>
  );
}
