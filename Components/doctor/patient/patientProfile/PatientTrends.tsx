import { TrendCard } from "./TrendCard";

export default function PatientTrends() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TrendCard
        title="HbA1c"
        unit="%"
        values={[8.2, 7.9, 7.8]}
        labels={["Jan", "Mar", "Jun"]}
      />

      <TrendCard
        title="Fasting Blood Sugar"
        unit="mg/dL"
        values={[165, 150, 142]}
        labels={["Jan", "Mar", "Jun"]}
      />

      <TrendCard
        title="Hemoglobin"
        unit="g/dL"
        values={[11.2, 10.9, 10.8]}
        labels={["Jan", "Mar", "Jun"]}
      />

      <TrendCard
        title="Total Cholesterol"
        unit="mg/dL"
        values={[210, 198, 190]}
        labels={["Jan", "Mar", "Jun"]}
      />
    </div>
  );
}
