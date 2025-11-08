'use client';

import * as React from 'react';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

type StatusDistribution = {
  type: string;
  count: number;
};

interface PatientPieGraphProps {
  data: StatusDistribution[];
}

// --- Chart configuration ---
const chartConfig = {
  appointments: { label: 'Appointments' },
  scheduled: { label: 'Scheduled', color: 'var(--primary)' },
  confirmed: { label: 'Confirmed', color: 'var(--secondary)' },
  completed: { label: 'Completed', color: 'var(--success)' },
  cancelled: { label: 'Cancelled', color: 'var(--destructive)' },
  noshow: { label: 'No-show', color: 'var(--accent)' }
} satisfies ChartConfig;

// Color mapping for different status types
const statusColors: Record<string, string> = {
  scheduled: 'var(--primary)',
  confirmed: 'var(--secondary)',
  completed: 'var(--success)',
  cancelled: 'var(--destructive)',
  noshow: 'var(--accent)',
};

export default function PatientPieGraph({ data }: PatientPieGraphProps) {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      count: item.count,
      fill: statusColors[item.type.toLowerCase()] || 'var(--primary)'
    }));
  }, [data]);

  const totalPatients = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Patient Visit Distribution</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Total patient visits by type this month
          </span>
          <span className='@[540px]/card:hidden'>Patient visits</span>
        </CardDescription>
      </CardHeader>

      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.type}
                  id={`fill${item.type.replace(/\s+/g, '')}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='0%' stopColor={item.fill} stopOpacity={1 - index * 0.1} />
                  <stop offset='100%' stopColor={item.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData.map(item => ({
                ...item,
                fill: `url(#fill${item.type.replace(/\s+/g, '')})`
              }))}
              dataKey='count'
              nameKey='type'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalPatients.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Patients
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className='flex-col gap-2 text-sm'>
        {chartData.length > 0 && totalPatients > 0 ? (
          <>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {chartData[0].type} leads with{' '}
              {((chartData[0].count / totalPatients) * 100).toFixed(1)}%{' '}
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground leading-none'>
              Based on appointment data
            </div>
          </>
        ) : (
          <div className='text-muted-foreground leading-none'>
            No appointment data available
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
