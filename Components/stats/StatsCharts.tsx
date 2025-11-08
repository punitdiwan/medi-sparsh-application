"use client";
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF69B4",
];

type ChartProps = {
  selectedCard: string;
  timePeriod: string;
  data: any;
};

const StatsChart: React.FC<ChartProps> = ({
  selectedCard,
  timePeriod,
  data,
}) => {
  // Generic pie chart renderer
  const renderPieChart = (
    chartData: any[],
    valueKey: string,
    nameKey: string
  ) => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  // Line chart for revenue
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data.revenue}>
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip formatter={(value: number) => `₹${value}`} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#00C49F"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Mapping selected card to chart content
  const chartKeyMap: Record<string, any> = {
    Patients: () => (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Patients ({timePeriod})</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPieChart(data.patients, "count", "type")}
        </CardContent>
      </Card>
    ),

    Appointments: () => (
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Appointment Types ({timePeriod})</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPieChart(data.appointments.types, "count", "type")}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Most Treated Diseases ({timePeriod})</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPieChart(data.appointments.diseases, "count", "type")}
          </CardContent>
        </Card>
      </div>
    ),

    Revenue: () => (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Revenue ({timePeriod})</CardTitle>
        </CardHeader>
        <CardContent>{renderLineChart()}</CardContent>
      </Card>
    ),

    "Pending Bills": () => (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Pending Bills ({timePeriod})</CardTitle>
        </CardHeader>
        <CardContent>{renderPieChart(data.bills, "value", "name")}</CardContent>
      </Card>
    ),
  };

  return <>{chartKeyMap[selectedCard]()}</>;
};

export default StatsChart;
