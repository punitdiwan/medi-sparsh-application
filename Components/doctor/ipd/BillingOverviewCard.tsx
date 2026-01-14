"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "./CircularProgress";

interface Props {
  totalAmount: number;
  totalPaid: number;
  creditLimit: number;
}

export const BillingSingleSummaryCard = ({
  totalAmount,
  totalPaid,
  creditLimit,
}: Props) => {
  const remainingAfterPayment = Math.max(totalAmount - totalPaid, 0);

  const creditUsed = Math.min(remainingAfterPayment, creditLimit);
  const pendingAfterCredit = Math.max(
    remainingAfterPayment - creditLimit,
    0
  );

  const creditPercentage = creditLimit
    ? Math.round((creditUsed / creditLimit) * 100)
    : 0;

  const paymentPercentage = totalAmount
    ? Math.round((totalPaid / totalAmount) * 100)
    : 0;

  const status =
    pendingAfterCredit === 0
      ? { label: "Clear (Credit Covered)", color: "bg-emerald-600" }
      : paymentPercentage >= 50
      ? { label: "Partially Paid", color: "bg-amber-500" }
      : { label: "Payment Due", color: "bg-rose-600" };

  return (
    <Card className="bg-overview-card border-overview-strong">
      <CardHeader>
        <CardTitle className="text-overview-label">
          Billing Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Credit Usage */}
        <div className="flex justify-center">
          <CircularProgress value={creditUsed} max={creditLimit} />
        </div>

        {/* Amounts */}
        <div className="space-y-2 text-sm">
          <Row label="Total Bill" value={`₹${totalAmount.toLocaleString()}`} />
          <Row
            label="Paid Amount"
            value={`₹${totalPaid.toLocaleString()}`}
            valueClass="text-emerald-600 font-medium"
          />
          <Row
            label="Credit Used"
            value={`₹${creditUsed.toLocaleString()}`}
            valueClass="text-orange-600"
          />
          <Row
            label="Pending Payable"
            value={`₹${pendingAfterCredit.toLocaleString()}`}
            valueClass="text-rose-600 font-semibold"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Progress value={paymentPercentage} className="h-2" />
          <div className="flex justify-between items-center text-xs">
            <span>{paymentPercentage}% Paid</span>
            <Badge className={`${status.color} text-white`}>
              {status.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Row = ({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);
