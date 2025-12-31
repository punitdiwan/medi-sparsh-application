"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Trash2,
  Receipt,
  Percent,
  IndianRupee,
  Calendar,
  ClipboardEdit,
} from "lucide-react";
import { useParams } from "next/navigation";
import { createIPDCharges } from "@/lib/actions/ipdActions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

/* -------------------- TYPES -------------------- */
interface ChargeType {
  id: string;
  name: string;
}

interface ChargeCategory {
  id: string;
  name: string;
  chargeTypeId: string;
}

interface Charge {
  id: string;
  name: string;
  amount: number;
  chargeCategoryId: string;
  chargeTypeId: string;
  taxPercent: number | null;
}

interface AddedCharge {
  date: string;
  chargeType: string;
  chargeCategory: string;
  chargeName: string;
  chargeId: string;
  chargeTypeId: string;
  chargeCategoryId: string;
  note: string;
  qty: number;
  standardCharge: number;
  total: number;
  discount: number;
  tax: number;
  discountPercent: number;
  taxPercent: number;
  netAmount: number;
}

/* -------------------- COMPONENT -------------------- */
export default function AddIPDChargesFullScreen({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const params = useParams();
  const ipdAdmissionId = params?.id as string;

  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);
  const [chargeCategories, setChargeCategories] = useState<ChargeCategory[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(false);

  const [chargeTypeId, setChargeTypeId] = useState("");
  const [chargeCategoryId, setChargeCategoryId] = useState("");
  const [chargeId, setChargeId] = useState("");
  const [qty, setQty] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState<AddedCharge[]>([]);

  // Fetch charge types
  useEffect(() => {
    const fetchChargeTypes = async () => {
      try {
        const response = await fetch("/api/charge-types");
        if (response.ok) {
          const data = await response.json();
          setChargeTypes(data);
        } else {
          toast.error("Failed to fetch charge types");
        }
      } catch (error) {
        console.error("Error fetching charge types:", error);
        toast.error("Failed to fetch charge types");
      }
    };

    if (open) {
      fetchChargeTypes();
    }
  }, [open]);

  // Fetch charge categories
  useEffect(() => {
    const fetchChargeCategories = async () => {
      try {
        const response = await fetch("/api/charge-categories");
        if (response.ok) {
          const data = await response.json();
          setChargeCategories(data);
        } else {
          toast.error("Failed to fetch charge categories");
        }
      } catch (error) {
        console.error("Error fetching charge categories:", error);
        toast.error("Failed to fetch charge categories");
      }
    };

    if (open) {
      fetchChargeCategories();
    }
  }, [open]);

  // Fetch charges
  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await fetch("/api/charges");
        if (response.ok) {
          const data = await response.json();
          setCharges(data);
        } else {
          toast.error("Failed to fetch charges");
        }
      } catch (error) {
        console.error("Error fetching charges:", error);
        toast.error("Failed to fetch charges");
      }
    };

    if (open) {
      fetchCharges();
    }
  }, [open]);

  // Filter categories based on selected charge type
  const filteredCategories = useMemo(() => {
    if (!chargeTypeId) return [];
    return chargeCategories.filter((c) => c.chargeTypeId === chargeTypeId);
  }, [chargeCategories, chargeTypeId]);

  // Filter charges based on selected charge category
  const filteredCharges = useMemo(() => {
    if (!chargeCategoryId) return [];
    return charges.filter((c) => c.chargeCategoryId === chargeCategoryId);
  }, [charges, chargeCategoryId]);

  const selectedCharge = filteredCharges.find((c) => c.id === chargeId);
  const selectedChargeType = chargeTypes.find((t) => t.id === chargeTypeId);
  const selectedChargeCategory = filteredCategories.find((c) => c.id === chargeCategoryId);

  const standardCharge = selectedCharge?.amount || 0;
  const taxPercent = selectedCharge?.taxPercent || 0;
  const total = standardCharge * qty;
  const discountAmount = (total * discountPercent) / 100;
  const taxAmount = ((total - discountAmount) * taxPercent) / 100;
  const netAmount = total - discountAmount + taxAmount;

  const grandTotal = useMemo(
    () => items.reduce((s, i) => s + i.netAmount, 0),
    [items]
  );

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setChargeTypeId("");
      setChargeCategoryId("");
      setChargeId("");
      setQty(1);
      setDiscountPercent(0);
      setNote("");
      setDate("");
      setItems([]);
    }
  }, [open]);

  // Reset dependent dropdowns when parent changes
  useEffect(() => {
    if (chargeTypeId) {
      setChargeCategoryId("");
      setChargeId("");
    }
  }, [chargeTypeId]);

  useEffect(() => {
    if (chargeCategoryId) {
      setChargeId("");
    }
  }, [chargeCategoryId]);

  /* ---------- ADD ROW WITH VALIDATION ---------- */
  const handleAdd = () => {
    if (!chargeTypeId) {
      toast.error("Please select Charge Type");
      return;
    }
    if (!chargeCategoryId) {
      toast.error("Please select Charge Category");
      return;
    }
    if (!chargeId) {
      toast.error("Please select Charge Name");
      return;
    }
    if (!date) {
      toast.error("Please select Date");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        date,
        chargeType: selectedChargeType?.name || "",
        chargeCategory: selectedChargeCategory?.name || "",
        chargeName: selectedCharge?.name || "",
        chargeId: selectedCharge?.id || "",
        chargeTypeId: chargeTypeId,
        chargeCategoryId: chargeCategoryId,
        note,
        qty,
        standardCharge,
        total,
        discount: discountAmount,
        tax: taxAmount,
        discountPercent,
        taxPercent,
        netAmount,
      },
    ]);

    // Reset form fields except date, charge type, and charge category
    setQty(1);
    setDiscountPercent(0);
    setNote("");
    setChargeId("");
  };

  const handleSubmit = async () => {
    if (!items.length) {
      toast.error("Please add at least one charge");
      return;
    }

    if (!ipdAdmissionId) {
      toast.error("IPD Admission ID is missing");
      return;
    }

    setLoading(true);

    const payload = {
      ipdAdmissionId,
      charges: items.map((i) => ({
        chargeTypeId: i.chargeTypeId,
        chargeCategoryId: i.chargeCategoryId,
        chargeId: i.chargeId,
        qty: i.qty,
        standardCharge: i.standardCharge,
        totalAmount: i.total, // total before discount (standardCharge * qty)
        discountPercent: i.discountPercent, // discount percentage (0-100)
        taxPercent: i.taxPercent, // tax percentage (0-100)
        note: i.note || null,
      })),
    };

    try {
      const result = await createIPDCharges(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Charges added successfully");
      onClose();
    } catch (error: any) {
      console.error("Error saving IPD charges:", error);
      toast.error(error.message || "Failed to save charges");
    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md">
      <div className="fixed inset-0 flex flex-col bg-background max-h-screen">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-dialog-header border-b border-dialog sticky top-0 z-10">
          <div className="flex items-center gap-2 text-white">
            <Receipt className="bg-dialog-header text-dialog-icon" />
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-header">Add Charges</h2>
              <p className="text-xs text-muted-foreground">
                Below charges will be added to the patient’s IPD bill after clicking
                <span className="font-medium text-primary"> Final Save</span>.
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onClose} color="red">✕</Button>
        </div>

        {/* CONTENT - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dialog-surface text-dialog">

          {/* DROPDOWNS */}
          <Card className="border-dialog-input bg-dialog-surface">
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-4">
              <div className="flex flex-col gap-2">
                <Label>Charge Type *</Label>
                <Select
                  value={chargeTypeId}
                  onValueChange={(value) => {
                    setChargeTypeId(value);
                    setChargeCategoryId("");
                    setChargeId("");
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="flex-1 w-full bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {chargeTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="select-dialog-item">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Charge Category *</Label>
                <Select
                  value={chargeCategoryId}
                  onValueChange={(value) => {
                    setChargeCategoryId(value);
                    setChargeId("");
                  }}
                  disabled={!chargeTypeId || loading}
                >
                  <SelectTrigger className="flex-1 w-full bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue
                      placeholder={
                        chargeTypeId ? "Select Category" : "Select Charge Type First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="select-dialog-item">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Charge Name *</Label>
                <Select
                  value={chargeId}
                  onValueChange={setChargeId}
                  disabled={!chargeCategoryId || loading}
                >
                  <SelectTrigger className="flex-1 w-full bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue
                      placeholder={
                        chargeCategoryId ? "Select Charge" : "Select Charge Category First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {filteredCharges.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="select-dialog-item">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Standard Charge</Label>
                <Input readOnly value={standardCharge} placeholder="Standard Charge" className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"/>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Qty</Label>
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(+e.target.value)} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"/>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAdd} className="gap-2 bg-primary w-full">
                  <PlusCircle className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TOTALS & DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <Card className="border-dialog-input bg-dialog-surface">
              <CardContent className="space-y-3 p-4 ">
                <div className="flex justify-between"><span>Total</span><span className="font-medium">₹ {total.toFixed(2)}</span></div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-orange-600"><Percent className="h-4 w-4" /> Discount</span>
                  <Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(+e.target.value)} className="w-24 bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"/>
                </div>
                <div className="flex justify-between text-blue-600"><span>Tax ({taxPercent}%)</span><span>₹ {taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-green-600"><span>Net Amount</span><span>₹ {netAmount.toFixed(2)}</span></div>
              </CardContent>
            </Card>

            <Card className="border-dialog-input bg-dialog-surface">
              <CardContent className="space-y-3 p-4">
                <Label className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"/>
                <Label className="flex items-center gap-1"><ClipboardEdit className="h-4 w-4" /> Charge Note</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary" />
              </CardContent>
            </Card>
          </div>
        <div className="space-y-2">
  
        {/* TABLE INFO */}
          <div className="rounded-lg border border-dialog-input bg-dialog-surface p-3">
            <h3 className="text-sm font-medium text-foreground">
              Added Charges Preview
            </h3>
            <p className="text-xs text-muted-foreground">
              You can remove any charge before saving.
            </p>
          </div>
          {/* TABLE */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Name / Note</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Std</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{i.date}</TableCell>
                    <TableCell>{i.chargeType}</TableCell>
                    <TableCell>{i.chargeCategory}</TableCell>
                    <TableCell>{i.chargeName}{i.note && ` - ${i.note}`}</TableCell>
                    <TableCell>{i.qty}</TableCell>
                    <TableCell>₹ {i.standardCharge}</TableCell>
                    <TableCell>₹ {i.total.toFixed(2)}</TableCell>
                    <TableCell>₹ {i.discount.toFixed(2)}</TableCell>
                    <TableCell>₹ {i.tax.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">₹ {i.netAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="destructive" onClick={() => setItems(items.filter((_, x) => x !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-dialog-header border-t border-dialog text-dialog-muted p-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="text-lg font-semibold text-primary flex items-center gap-1">
            <IndianRupee className="h-5 w-5" />
            {grandTotal.toFixed(2)}
          </div>
          <Button 
            size="lg" 
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {loading ? "Saving..." : "Final Save"}
          </Button>
        </div>

      </div>
    </div>
  );
}