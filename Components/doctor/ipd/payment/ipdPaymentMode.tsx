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
import { CreditCard, PlusCircle } from "lucide-react";

export interface PaymentData {
  date: string;
  amount: number;
  paymentMode: string;
  note?: string;
}

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: PaymentData) => void;
  paymentToEdit?: PaymentData; // optional prop for edit
}

const paymentModes = ["Cash", "Card", "UPI", "Bank Transfer"];

export default function AddIPDPaymentModal({
  open,
  onClose,
  onSubmit,
  paymentToEdit,
}: AddPaymentModalProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Populate fields if editing
  useEffect(() => {
    if (paymentToEdit) {
      setDate(paymentToEdit.date);
      setAmount(paymentToEdit.amount.toString());
      setPaymentMode(paymentToEdit.paymentMode);
      setNote(paymentToEdit.note || "");
    } else {
      // reset when opening for add
      setDate("");
      setAmount("");
      setPaymentMode("");
      setNote("");
    }
  }, [paymentToEdit, open]);

  const handleSave = () => {
    if (!date) { toast.error("Date is required"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error("Valid Amount is required"); return; }
    if (!paymentMode) { toast.error("Payment Mode is required"); return; }

    setIsLoading(true);
    onSubmit({
      date,
      amount: Number(amount),
      paymentMode,
      note: note.trim() || undefined,
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg">
        
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
              <SelectTrigger  className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary">
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent className="select-dialog-content">
                {paymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode} className="select-dialog-item">{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            disabled={isLoading}
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
