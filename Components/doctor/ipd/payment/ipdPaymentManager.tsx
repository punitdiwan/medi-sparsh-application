"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Printer, Pencil, Trash2, CreditCard } from "lucide-react";
import AddIPDPaymentModal, { PaymentData } from "./ipdPaymentMode";
import { getIPDPayments, deleteIPDPayment } from "@/app/actions/ipdPaymentActions";
import { getIPDAdmissionDetails } from "@/lib/actions/ipdActions";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";

import { useAuth } from "@/context/AuthContext";

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMode: string;
  note?: string;
  paymentAmount: string; // From DB
  paymentDate: Date; // From DB
  paymentNote: string | null; // From DB
  isDeleted: boolean;
}

import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { useDischarge } from "../DischargeContext";
import { IpdPaymentPdf } from "@/Components/pdf/IpdPaymentPdf";

export default function IPDPaymentManagerPage({ ipdId }: { ipdId: string }) {
  const { isDischarged } = useDischarge();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<PaymentRecord | null>(null);
  const { user } = useAuth();
  const [ipdData, setIpdData] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchPayments = async () => {
    const res = await getIPDPayments(ipdId);
    if (res.success && res.data) {
      // Map DB fields to UI fields
      const mappedPayments = res.data.map((p: any) => ({
        id: p.id,
        date: new Date(p.paymentDate).toISOString().split('T')[0],
        amount: Number(p.paymentAmount),
        paymentMode: p.paymentMode,
        note: p.paymentNote || "",
        paymentAmount: p.paymentAmount,
        paymentDate: p.paymentDate,
        paymentNote: p.paymentNote,
        isDeleted: p.isDeleted || false
      }));
      setPayments(mappedPayments);
    }
  };

  const fetchIpdDetails = async () => {
    const res = await getIPDAdmissionDetails(ipdId);
    if (res.data) {
      setIpdData(res.data);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchIpdDetails();
  }, [ipdId, modalOpen]);

  const filtered = useMemo(() => {
    if (!search) return payments;
    return payments.filter(
      (p) =>
        p.paymentMode.toLowerCase().includes(search.toLowerCase()) ||
        (p.note && p.note.toLowerCase().includes(search.toLowerCase()))
    );
  }, [payments, search]);

  const handleAddPayment = () => {
    fetchPayments();
    setModalOpen(false);
  };


  const handleDeleteClick = (id: string) => {
    confirmDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (!id) return;

    const res = await deleteIPDPayment(id, ipdId);
    if (res.success) {
      toast.success("Payment deleted");
      fetchPayments();
    } else {
      toast.error("Failed to delete payment");
    }
    setIsDeleteConfirmOpen(false);
  };

  const handlePrint = async (payment: PaymentRecord) => {
    if (!user?.hospital || !ipdData) {
      toast.error("Hospital or IPD information missing");
      return;
    }

    try {
      setIsPrinting(true);
      const pdfDoc = (
        <IpdPaymentPdf
          title="Payment Receipt"
          patientName={ipdData.patientName}
          ipdNo={ipdId}
          phone={ipdData.phone || ""}
          payments={[payment]}
          organization={{
            name: user.hospital.name,
            metadata: user.hospital.metadata
          }}
          orgModeCheck={user.hospital.metadata?.orgMode === "hospital"}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintAll = async () => {
    if (!user?.hospital || !ipdData) {
      toast.error("Hospital or IPD information missing");
      return;
    }

    const nonDeletedPayments = filtered.filter(p => !p.isDeleted);
    if (nonDeletedPayments.length === 0) {
      toast.error("No active transactions to print");
      return;
    }

    try {
      setIsPrinting(true);
      const pdfDoc = (
        <IpdPaymentPdf
          title="Consolidated Payment Report"
          patientName={ipdData.patientName}
          ipdNo={ipdId}
          phone={ipdData.phone || ""}
          payments={nonDeletedPayments}
          organization={{
            name: user.hospital.name,
            metadata: user.hospital.metadata
          }}
          orgModeCheck={user.hospital.metadata?.orgMode === "hospital"}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="py-2 space-y-6">

      {/* HEADER / SEARCH */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <CreditCard className="bg-dialog-header text-dialog-icon" />
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
              variant="outline"
              disabled={isPrinting || filtered.length === 0}
              onClick={handlePrintAll}
              className="flex items-center gap-2 border-dialog-primary text-dialog hover:bg-muted"
            >
              <Printer className="h-4 w-4" /> Print All
            </Button>
            {!isDischarged && (
              <Button
                onClick={() => { setModalOpen(true); setEditPayment(null); }}
                className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
              >
                <PlusCircle className="h-5 w-5" /> Add Payment
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* PAYMENTS TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Transaction ID</TableHead>
                <TableHead className="text-dialog-icon">Date</TableHead>
                <TableHead className="text-dialog-icon">Note</TableHead>
                <TableHead className="text-dialog-icon">Payment Mode</TableHead>
                <TableHead className="text-dialog-icon">Paid Amount</TableHead>
                <TableHead className="text-center text-dialog-icon">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map(p => (
                  <TableRow key={p.id} className={`odd:bg-muted/40 even:bg-transparent transition-colors ${p.isDeleted ? 'opacity-60 bg-red-50/10 grayscale-[0.2]' : 'hover:bg-muted/60'}`}>
                    <TableCell className="font-medium text-gray-800 dark:text-white">
                      <div className="flex flex-col gap-1">
                        <span>{p.id.substring(0, 8)}...</span>
                        {p.isDeleted && <span className="text-[10px] font-bold text-red-500 uppercase">Deleted</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-dialog-muted">{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-dialog-muted">{p.note || "—"}</TableCell>
                    <TableCell className="text-dialog-muted">{p.paymentMode}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex gap-2 justify-center">
                          {!p.isDeleted && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" onClick={() => handlePrint(p)}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Print</TooltipContent>
                            </Tooltip>
                          )}

                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handleEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip> */}

                          {!isDischarged && !p.isDeleted && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <ConfirmDialog
                                    trigger={
                                      <Button size="icon" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    }
                                    title="Delete Payment"
                                    description="Are you sure you want to delete this payment? This action cannot be undone."
                                    actionLabel="Delete"
                                    onConfirm={() => handleDeleteClick(p.id)}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          )}
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
          paymentToEdit={editPayment ? {
            date: editPayment.date,
            amount: editPayment.amount,
            paymentMode: editPayment.paymentMode,
            note: editPayment.note
          } : undefined}
          ipdId={ipdId}
        />
      )}

      {/* Delete Confirmation Dialog - Actually handled by the trigger above, but let's check if we need a separate state controlled one. 
          The ConfirmDialog component uses AlertDialogTrigger, so it handles open state internally via trigger.
          However, onConfirm needs to execute the delete.
          Wait, the ConfirmDialog implementation takes onConfirm prop.
          So I can just pass the delete logic directly to onConfirm in the loop.
      */}
    </div>
  );
}
