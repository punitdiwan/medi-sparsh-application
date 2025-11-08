"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type MonthlyTrend = {
  month: string;
  consultations: number;
  followups: number;
};

interface AppointmentAreaGraphProps {
  data: MonthlyTrend[];
}

// --- Chart configuration ---
const chartConfig = {
  appointments: { label: "Appointments" },
  consultations: { label: "Consultations", color: "var(--primary)" },
  followups: { label: "Follow-ups", color: "var(--secondary)" },
} satisfies ChartConfig;

export default function AppointmentAreaGraph({ data }: AppointmentAreaGraphProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Appointments Overview</CardTitle>
        <CardDescription>
          Showing consultations and follow-ups for the last 6 months
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient
                id="fillConsultations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-consultations)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-consultations)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillFollowups" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-followups)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-followups)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              dataKey="followups"
              type="natural"
              fill="url(#fillFollowups)"
              stroke="var(--color-followups)"
              stackId="a"
            />
            <Area
              dataKey="consultations"
              type="natural"
              fill="url(#fillConsultations)"
              stroke="var(--color-consultations)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 8.4% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              May - October 2025
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
