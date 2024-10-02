"use client"
import React, { useState, useEffect } from "react";
import { RecentActivity } from "@/components/User/RecentActivity";
import { ActionItems } from "@/components/User/ActionItems";
import { AccountSettings } from "@/components/User/AccountSettings";
import { AppwriteUser, CardData, ChartDataPoint, FileInfo } from "@/lib/types";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getLoggedInUser } from "@/lib/server/appwrite";
import { LoadingSkeleton } from "@/components/Layout/LoadingSkeleton";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import UploadVideoDialog from "@/components/User/UploadVideoDialog";
import { useFiles } from "@/hooks/useFiles";
import MonthlyFileHistogram from "@/components/User/MonthlyFileHistogram";
import { Camera, FilePlus2, FileWarning, FileCheck2, ShieldCheck, ShieldAlert } from 'lucide-react';

function processFilesForChart(files: FileInfo[]): ChartDataPoint[] {
  const monthlyData: { [key: string]: number } = {};

  files.forEach(file => {
    const date = new Date(file.$createdAt?.toString() || "");
    const monthKey = date.toLocaleString('default', { month: 'long' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey]++;
  });

  const chartData: ChartDataPoint[] = Object.entries(monthlyData).map(([month, desktop]) => ({
    month,
    desktop
  }));

  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return chartData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
}

const Dashboard: React.FC = () => {
  const { verifiedCount, unverifiedCount, tamperedCount, totalCount, files } = useFiles();
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getLoggedInUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const chartData = React.useMemo(() => processFilesForChart(files), [files]);
  const chartConfig: ChartConfig = {
    desktop: {
      label: "Total Videos",
      color: "hsl(var(--chart-1))",
    },
  };

  const summaryCards: CardData[] = [
    {
      title: "Successful Verifications",
      description: "Videos successfully verified",
      value: verifiedCount,
      icon: <FileCheck2 className="h-6 w-6 text-green-500" />,
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Detected Tampering",
      description: "Videos with detected tampering",
      value: tamperedCount,
      icon: <FileWarning className="h-6 w-6 text-red-500" />,
      color: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Pending Reviews",
      description: "Videos awaiting review",
      value: unverifiedCount,
      icon: <FilePlus2 className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Total Videos",
      description: "Total number of videos",
      value: totalCount,
      icon: <Camera className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-900",
    },
  ];

  const pieChartData = [
    { category: "Unverified", value: unverifiedCount, fill: "hsl(var(--chart-1))" },
    { category: "Tampered", value: tamperedCount, fill: "hsl(var(--chart-2))" },
  ];

  const pieChartConfig: ChartConfig = Object.fromEntries(
    summaryCards.slice(0, 3).map((card, index) => [
      card.title.toLowerCase().replace(/\s+/g, '-'),
      {
        label: card.title,
        color: `hsl(var(--chart-${index + 1}))`,
      },
    ])
  );

  if (loading) {
    return (
      <LoggedInLayout>
        <LoadingSkeleton />
      </LoggedInLayout>
    );
  }
  const isVerified = user?.labels?.includes('verified') || false;
  return (
    <LoggedInLayout>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-gray-900">
        <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
        {user && (
            <div className="mb-4 flex flex-col md:flex-row w-full justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="mb-4 md:mb-0 flex items-center">
                <div className="mr-4">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user.name}!</h1>
                  <div className={`mt-2 flex items-center ${isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                    {isVerified ? (
                      <>
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Verified Creator Profile</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Unverified Creator Profile</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <UploadVideoDialog />
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
              <Card key={index} className={`${card.color} transition-all hover:shadow-lg`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-2xl font-bold">Multimedia Statistics</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={pieChartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {totalCount}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Total Multimedia
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                  Multimedia Statistics Overview
                </div>
              </CardFooter>
            </Card>
            <RecentActivity files={files} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MonthlyFileHistogram files={files} />
            <ActionItems />
            <AccountSettings />
          </div>
        </main>
      </div>
    </LoggedInLayout>
  );
};

export default Dashboard;