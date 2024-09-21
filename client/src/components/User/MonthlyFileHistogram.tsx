import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { FilterIcon, CalendarIcon } from "lucide-react";
import { FileInfo } from '@/lib/types';

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
    .map(([month, counts]) => ({ month, ...counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

interface MonthlyFileHistogramProps {
  files: FileInfo[];
}

const MonthlyFileHistogram: React.FC<MonthlyFileHistogramProps> = ({ files }) => {
  const data = useMemo(() => processFileData(files), [files]);

  return (
    <Card className="col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>Content Trends</CardTitle>
        <CardDescription>A chart showing trends in content over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year}`;
              }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="verified" fill="#7e22ce" name="Verified" />
            <Bar dataKey="unverified" fill="#b084f5" name="Unverified" />
            <Bar dataKey="tampered" fill="#ffb142" name="Tampered" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-end gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
                <FilterIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Verified</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Tampered</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Date Range</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Date Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>Last 90 days</DropdownMenuItem>
              <DropdownMenuItem>Custom range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyFileHistogram;