"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Printer, Pencil, Trash2, CreditCard } from "lucide-react";
import AddIPDPaymentModal, { PaymentData } from "./ipdPaymentMode";

interface PaymentRecord extends PaymentData {
  id: string;
}

export default function IPDPaymentManagerPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<PaymentRecord | null>(null);

  const filtered = useMemo(() => {
    if (!search) return payments;
    return payments.filter(
      (p) =>
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.note?.toLowerCase().includes(search.toLowerCase()) ||
        p.paymentMode.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  const handleAddPayment = (payment: PaymentData) => {
    if (editPayment) {
      setPayments((prev) =>
        prev.map((p) => (p.id === editPayment.id ? { ...p, ...payment } : p))
      );
      setEditPayment(null);
    } else {
      const newPayment: PaymentRecord = {
        id: `TXN-${Date.now()}`,
        ...payment,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }
    setModalOpen(false);
  };

  const handleEdit = (payment: PaymentRecord) => {
    setEditPayment(payment);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      setPayments((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handlePrint = (payment: PaymentRecord) => {
    alert(`Print payment ${payment.id}`);
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER / SEARCH */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            Payment
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
             <Input
                placeholder="Search by transaction / note / mode"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="sm:w-72"
              />
            <Button
              onClick={() => { setModalOpen(true); setEditPayment(null); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="h-5 w-5" /> Add Payment
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* PAYMENTS TABLE */}
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-indigo-700 dark:text-white">Transaction ID</TableHead>
                <TableHead className="text-indigo-700 dark:text-white">Date</TableHead>
                <TableHead className="text-indigo-700 dark:text-white">Note</TableHead>
                <TableHead className="text-indigo-700 dark:text-white">Payment Mode</TableHead>
                <TableHead className="text-indigo-700 dark:text-white">Paid Amount</TableHead>
                <TableHead className="text-center text-indigo-700 dark:text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-gray-800 dark:text-white">{p.id}</TableCell>
                    <TableCell className="text-gray-600 dark:text-white">{p.date}</TableCell>
                    <TableCell className="text-gray-700 dark:text-white">{p.note || "—"}</TableCell>
                    <TableCell className="text-gray-700 dark:text-white">{p.paymentMode}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex gap-2 justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handlePrint(p)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handleEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="destructive" onClick={() => handleDelete(p.id)}>
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
                  <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD/EDIT PAYMENT MODAL */}
      {modalOpen && (
        <AddIPDPaymentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddPayment}
          paymentToEdit={editPayment || undefined}
        />
      )}
    </div>
  );
}
