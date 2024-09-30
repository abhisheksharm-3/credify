"use client"
import * as React from "react";
import { RecentActivity } from "@/components/User/RecentActivity";
import { AlertsNotifications } from "@/components/User/AlertNotifications";
import { ActionItems } from "@/components/User/ActionItems";
import { AccountSettings } from "@/components/User/AccountSettings";
import { AppwriteUser, CardData, ChartDataPoint, FileInfo } from "@/lib/types";
import { Label, Pie, PieChart } from "recharts";

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
import { getLoggedInUser } from "@/lib/server/appwrite";
import { LoadingSkeleton } from "@/components/Layout/LoadingSkeleton";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { UploadVideoDialog } from "@/components/User/UploadVideoDialog";
import { useFiles } from "@/hooks/useFiles";
import MonthlyFileHistogram from "@/components/User/MonthlyFileHistogram";

function processFilesForChart(files: FileInfo[]): ChartDataPoint[] {
  const monthlyData: { [key: string]: number } = {};

  files.forEach(file => {
    const date = new Date(file.$createdAt || "");
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

export default function Dashboard() {
  const { verifiedCount, unverifiedCount, tamperedCount, totalCount, files } = useFiles();
  const [user, setUser] = React.useState<AppwriteUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const chartConfig = {
    desktop: {
      label: "Total Videos",
      color: "hsl(var(--chart-1))",
    },
  };

  const summaryCards: CardData[] = [
    {
      title: "Successful Verifications",
      description: "The number of videos that have been successfully verified.",
      value: verifiedCount,
    },
    {
      title: "Detected Tampering",
      description: "The number of videos where tampering has been detected.",
      value: tamperedCount,
    },
    {
      title: "Pending Reviews",
      description: "The number of videos currently awaiting review.",
      value: unverifiedCount,
    },
  ];

  const pieChartData = summaryCards.map((card, index) => ({
    category: card.title,
    value: card.value,
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  const pieChartConfig: ChartConfig = Object.fromEntries(
    summaryCards.map((card, index) => [
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

  return (
    <LoggedInLayout>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
          {user && (
            <div className="mb-4 flex flex-col md:flex-row w-full justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
                <p>Email: {user.email}</p>
              </div>
              <UploadVideoDialog />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Multimedia Statistics</CardTitle>
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
            <AlertsNotifications />
            <div className="flex gap-4 flex-col">
              <ActionItems />
              <AccountSettings />
            </div>
          </div>
        </main>
      </div>
    </LoggedInLayout>
  );
}