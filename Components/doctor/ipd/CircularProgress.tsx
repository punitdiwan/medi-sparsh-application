type CircularProgressProps = {
  value: number;          // used amount
  max: number;            // credit limit
  size?: number;          // circle size (px)
  strokeWidth?: number;   // thickness
};


export function CircularProgress({
  value,
  max,
  size = 110,
  strokeWidth = 20,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // ✅ Safe handling when credit not available
  const safeValue = Math.min(value || 0, max || 0);
  const percentage = max > 0 
    ? Math.min((safeValue / max) * 100, 100)
    : 0;

  const offset = circumference * (1 - percentage / 100);

  // 🎨 Color logic
  const color =
    percentage < 60
      ? "text-emerald-600"
      : percentage < 85
      ? "text-orange-500"
      : "text-red-500";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-300"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className={`${color} transition-[stroke-dashoffset] duration-1000 ease-in-out`}
        />
      </svg>

      {/* Center text */}
      <div className="absolute text-center">
        <p className="text-lg font-semibold">{percentage.toFixed(0)}%</p>
        <p className="text-xs text-muted-foreground">
          {max > 0 ? "Used" : "No Credit"}
        </p>
      </div>
    </div>
  );
}

