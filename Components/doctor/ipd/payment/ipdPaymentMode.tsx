"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, PlusCircle, Calculator } from "lucide-react";
import { createIPDPayment, getIPDPaymentSummary } from "@/app/actions/ipdPaymentActions";

import { Switch } from "@/components/ui/switch";

export interface PaymentData {
  date: string;
  amount: number;
  paymentMode: string;
  note?: string;
  toCredit?: boolean;
  referenceId?: string;
}

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: PaymentData) => void;
  paymentToEdit?: PaymentData; // optional prop for edit
  ipdId: string;
}

const paymentModes = ["Cash", "Card", "UPI", "Bank Transfer", "Credit Limit"];

export default function AddIPDPaymentModal({
  open,
  onClose,
  onSubmit,
  paymentToEdit,
  ipdId,
}: AddPaymentModalProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [note, setNote] = useState("");
  const [isCreditLimitIncrease, setIsCreditLimitIncrease] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Summary State
  const [summary, setSummary] = useState<{ totalCharges: number; totalPaid: number,payable:number, IpdCreditLimit: number, usedCredit: number } | null >(null);
  // Populate fields if editing
  useEffect(() => {
    if (paymentToEdit) {
      setDate(paymentToEdit.date);
      setAmount(paymentToEdit.amount.toString());
      setPaymentMode(paymentToEdit.paymentMode);
      setNote(paymentToEdit.note || "");
      setIsCreditLimitIncrease(paymentToEdit.toCredit || false);
      setReferenceId(paymentToEdit.referenceId || "");
    } else {
      // reset when opening for add
      setDate(new Date().toISOString().split('T')[0]);
      setAmount("");
      setPaymentMode("");
      setNote("");
      setIsCreditLimitIncrease(false);
      setReferenceId("");
    }

    // Fetch Summary
    if (open) {
      fetchSummary();
    }
  }, [paymentToEdit, open, ipdId]);

  // Handle default note for credit usage
  useEffect(() => {
    if (isCreditLimitIncrease && !paymentToEdit) {
      setNote("Added to credit payment");
      return;
    }
    if (paymentMode === "Credit Limit" && !isCreditLimitIncrease && !paymentToEdit) {
      setNote("Paid from credit limit");
    } else if (note === "Paid from credit limit" && (paymentMode !== "Credit Limit" || isCreditLimitIncrease)) {
      setNote("");
    } 
  }, [paymentMode, isCreditLimitIncrease]);

  const fetchSummary = async () => {
    const res = await getIPDPaymentSummary(ipdId);
    if (res.success && res.data) {
      setSummary(res.data);
      if (!paymentToEdit) {
        const availableCredit = res.data.IpdCreditLimit - res.data.usedCredit;
        const safeBalance = Math.max(res.data.payable, 0);
        setAmount(safeBalance.toFixed(2));
      }
    }
  };

  const handleSave = async () => {
    if (!date) { toast.error("Date is required"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error("Valid Amount is required"); return; }
    if (!paymentMode) { toast.error("Payment Mode is required"); return; }

    setIsLoading(true);

    const paymentData: PaymentData = {
      date,
      amount: Number(amount),
      paymentMode,
      note: note.trim() || undefined,
      toCredit: isCreditLimitIncrease,
      referenceId: ["UPI", "Card", "Bank Transfer"].includes(paymentMode) ? referenceId.trim() : undefined,
    };

    if (paymentToEdit) {
      // Edit logic here if needed (not requested yet)
      onSubmit(paymentData);
    } else {
      const res = await createIPDPayment(paymentData, ipdId);
      if (res.success) {
        toast.success("Payment added successfully");
        onSubmit(paymentData);
      } else {
        toast.error("Failed to add payment");
      }
    }

    setIsLoading(false);
  };

  const filteredPaymentModes = isCreditLimitIncrease
    ? paymentModes.filter(mode => mode !== "Credit Limit")
    : paymentModes;

  const currentAmount = Number(amount || 0);
  const availableCredit = summary ? summary.IpdCreditLimit : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg">

        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <CreditCard className="bg-dialog-header text-dialog-icon" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {paymentToEdit ? "Edit Payment" : "Add Payment"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">

          {/* Summary Section */}
          {summary && (
            <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Applied Charges</p>
                <p className="font-semibold text-sm">₹{summary.totalCharges.toFixed(2)}</p>
              </div>
              <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground">Paid Charges</p>
                <p className="font-semibold text-sm">₹{summary.totalPaid.toFixed(2)}</p>
              </div>
              <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground">Available Credit</p>
                <p className="font-semibold text-sm text-green-600">
                  ₹{(isCreditLimitIncrease
                    ? availableCredit + currentAmount
                    : (paymentMode === "Credit Limit"
                      ? availableCredit - currentAmount
                      : availableCredit)).toFixed(2)}
                </p>
              </div>
              <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground">Payable Balance</p>
                <p className="font-semibold text-sm text-red-600">
                  ₹{Math.max(summary.payable, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Credit Limit Increase</Label>
              <p className="text-xs text-muted-foreground">Add this amount to patient's credit limit</p>
            </div>
            <Switch
              checked={isCreditLimitIncrease}
              onCheckedChange={(checked) => {
                setIsCreditLimitIncrease(checked);
                if (checked && paymentMode === "Credit Limit") {
                  setPaymentMode("");
                }
              }}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Date <span className="text-destructive">*</span></Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Amount <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Payment Mode <span className="text-destructive">*</span></Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary">
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent className="select-dialog-content">
                {filteredPaymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode} className="select-dialog-item">{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {["UPI", "Card", "Bank Transfer"].includes(paymentMode) && (
            <div>
              <Label className="text-sm font-medium">Reference ID</Label>
              <Input
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="Enter reference ID"
                className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Note</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-dialog-muted">
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isLoading || (summary ? (summary?.payable <= 0 && !isCreditLimitIncrease) : false)}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {isLoading ? "Saving..." : paymentToEdit ? "Update Payment" : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
