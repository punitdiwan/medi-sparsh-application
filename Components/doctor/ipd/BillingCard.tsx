import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BillingCreditCard = ({
  creditLimit,
  used,
}: {
  creditLimit: number;
  used: number;
}) => {
  const balance = creditLimit - used;
  const usedPercentage = (used / creditLimit) * 100;

  return (
    <Card className="bg-overview-card border-overview-strong">
      <CardHeader>
        <CardTitle className="text-overview-label">Credit Limit Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Circle Progress */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="48"
              cy="48"
            />
            <circle
              className="text-emerald-600"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - usedPercentage / 100)}
              strokeLinecap="round"
              r="44"
              cx="48"
              cy="48"
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-semibold">
            {usedPercentage.toFixed(1)}%
          </div>
        </div>

        {/* Textual Info */}
        <div className="w-full space-y-1 text-sm text-gray-700">
          <div className="flex justify-between dark:text-white/80">
            <span>Credit Limit:</span>
            <span>₹{creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Used:</span>
            <span>₹{used.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-overview-warning ">
            <span>Balance:</span>
            <span>₹{balance.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
