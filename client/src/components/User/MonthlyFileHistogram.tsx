import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { FileInfo } from '@/lib/types';
import { MonthlyFileHistogramProps } from '@/lib/frontend-types';

const processFileData = (files: FileInfo[]) => {
  const monthlyData: { [key: string]: { verified: number, unverified: number, tampered: number } } = {};

  files.forEach(file => {
    const date = new Date(file.$createdAt || "");
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { verified: 0, unverified: 0, tampered: 0 };
    }

    if (file.verified) {
      monthlyData[monthKey].verified++;
    } else if (file.tampered) {
      monthlyData[monthKey].tampered++;
    } else {
      monthlyData[monthKey].unverified++;
    }
  });

  return Object.entries(monthlyData)
    .map(([month, counts]) => ({ 
      month: month,
      ...counts
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const chartConfig: ChartConfig = {
  verified: {
    label: "Verified",
    color: "#7e22ce",
  },
  unverified: {
    label: "Unverified",
    color: "#b084f5",
  },
  tampered: {
    label: "Tampered",
    color: "#ffb142",
  },
};

export default function MonthlyFileHistogram({ files }: MonthlyFileHistogramProps) {
  const data = useMemo(() => processFileData(files), [files]);
  return (
    <Card className="col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>Multimedia Verification Status Trends</CardTitle>
        <CardDescription>This chart displays the number of tampered, verified, and unverified multimedia over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year.slice(2)}`;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="verified" fill="var(--color-verified)" radius={4} />
            <Bar dataKey="unverified" fill="var(--color-unverified)" radius={4} />
            <Bar dataKey="tampered" fill="var(--color-tampered)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}