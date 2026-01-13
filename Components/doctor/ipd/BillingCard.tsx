import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";

export const BillingCreditCard = ({
  creditLimit,
  used,
}: {
  creditLimit: number;
  used: number;
}) => {
  const safeUsed = Math.min(used, creditLimit);
  const balance = Math.max(creditLimit - used, 0);
  const safeValue = Math.min(safeUsed, creditLimit);
  const percentage = Math.min((safeValue / creditLimit) * 100, 100);
  const color =
    percentage < 60
      ? "text-emerald-600"
      : percentage < 85
      ? "text-orange-500"
      : "text-red-500";
  return (
    <Card className="bg-overview-card border-overview-strong ">
      <CardHeader>
        <CardTitle className="text-overview-label ">
          Credit Limit Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-row items-center gap-2 ">
        {/* Circle */}
        <CircularProgress value={safeUsed} max={creditLimit} />

        {/* Info */}
        <div className="w-full space-y-2 text-sm">
          <div className="flex justify-between text-black dark:text-gray-300 ">
            <span>Credit Limit</span>
            <span>₹{creditLimit.toLocaleString()}</span>
          </div>

          <div className={`flex justify-between ${color}`}>
            <span>Used</span>
            <span>₹{safeUsed.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-semibold text-overview-warning">
            <span>Balance</span>
            <span>₹{balance.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
