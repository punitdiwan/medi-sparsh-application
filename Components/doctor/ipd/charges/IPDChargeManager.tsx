"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Eye, Pencil, Trash2, Printer, Receipt } from "lucide-react";
import AddIPDChargesFullScreen from "./IPDChargesModel";
import { getIPDCharges } from "@/lib/actions/ipdActions";
import { format } from "date-fns";
import { toast } from "sonner";

interface ChargeRecord {
  id: string;
  chargeName: string | null;
  chargeType: string | null;
  chargeCategory: string | null;
  qty: number;
  standardCharge: string;
  totalAmount: string;
  discountPercent: string;
  taxPercent: string;
  note: string | null;
  createdAt: Date;
}

export default function IPDChargesManagerPage() {
  const params = useParams();
  const ipdAdmissionId = params?.id as string;
  
  const [charges, setCharges] = useState<ChargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    const fetchCharges = async () => {
      if (!ipdAdmissionId) return;
      
      setLoading(true);
      try {
        const result = await getIPDCharges(ipdAdmissionId);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setCharges(result.data as ChargeRecord[]);
        }
      } catch (error) {
        console.error("Error fetching IPD charges:", error);
        toast.error("Failed to fetch charges");
      } finally {
        setLoading(false);
      }
    };

    fetchCharges();
  }, [ipdAdmissionId]);

  // Filter charges based on search term
  const filtered = useMemo(() => {
    if (!search) return charges;
    const term = search.toLowerCase();
    return charges.filter(
      (c) =>
        c.id.toLowerCase().includes(term) ||
        c.chargeName?.toLowerCase().includes(term) ||
        c.chargeType?.toLowerCase().includes(term) ||
        c.chargeCategory?.toLowerCase().includes(term)
    );
  }, [charges, search]);

  const handleRefresh = async () => {
    if (!ipdAdmissionId) return;
    
    setLoading(true);
    try {
      const result = await getIPDCharges(ipdAdmissionId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCharges(result.data as ChargeRecord[]);
      }
    } catch (error) {
      console.error("Error fetching IPD charges:", error);
      toast.error("Failed to refresh charges");
    } finally {
      setLoading(false);
    }
  };

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-400">
                    Loading charges...
                  </TableCell>
                </TableRow>
              ) : filtered.length ? (
                filtered.map(c => {
                  const totalAmount = parseFloat(c.totalAmount || "0");
                  const discountPercent = parseFloat(c.discountPercent || "0");
                  const taxPercent = parseFloat(c.taxPercent || "0");
                  const standardCharge = parseFloat(c.standardCharge || "0");
                  
                  // Calculate discount amount
                  const discountAmount = (totalAmount * discountPercent) / 100;
                  // Calculate tax amount (on amount after discount)
                  const taxAmount = ((totalAmount - discountAmount) * taxPercent) / 100;
                  // Calculate net amount
                  const netAmount = totalAmount - discountAmount + taxAmount;
                  
                  return (
                    <TableRow key={c.id} className="odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors ">
                      <TableCell className="text-dialog-muted">
                        {c.createdAt ? format(new Date(c.createdAt), "yyyy-MM-dd") : "-"}
                      </TableCell>
                      <TableCell className="text-dialog-muted">{c.chargeName || "-"}</TableCell>
                      <TableCell className="text-dialog-muted">{c.chargeType || "-"}</TableCell>
                      <TableCell className="text-dialog-muted">{c.chargeCategory || "-"}</TableCell>
                      <TableCell className="text-dialog-muted">{c.qty}</TableCell>
                      <TableCell className="text-dialog-muted">₹ {standardCharge.toFixed(2)}</TableCell>
                      <TableCell className="text-dialog-muted">₹ {discountAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-dialog-muted">₹ {taxAmount.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹ {netAmount.toFixed(2)}</TableCell>
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
                  );
                })
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
        onClose={() => {
          setOpenAdd(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
