"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { TransactionPDF } from "@/Components/doctor/billing/TransactionPDF";
import { PDFViewer } from "@react-pdf/renderer";

type Transaction = {
  amount: number;
  appointmentDate: string;
  appointmentId: string;
  appointmentStatus: string;
  appointmentTime: string;
  createdAt: string;
  hospitalId: string;
  patientGender: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
};

export default function PrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/billing/print/${id}`);
        const data = await res.json();

        if (!data.success) {
          toast.error("Failed to load transaction");
          return;
        }

        setTransaction(data.data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading transaction");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading transaction...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <PDFViewer width="100%" height="100%">
        <TransactionPDF transaction={transaction} />
      </PDFViewer>
    </div>
  );
}
