"use client"

import * as React from "react";
import { RecentActivity } from "@/components/User/RecentActivity";
import { VerificationTrends } from "@/components/User/VerificationTrendsChart";
import { AlertsNotifications } from "@/components/User/AlertNotifications";
import { ActionItems } from "@/components/User/ActionItems";
import { AccountSettings } from "@/components/User/AccountSettings";
import { AppwriteUser, CardData, ChartDataPoint, User, VideoData } from "@/lib/types";
import { TrendingUp } from "lucide-react";
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

const chartData: ChartDataPoint[] = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

const summaryCards: CardData[] = [
  { title: "Successful Verifications", description: "The number of videos that have been successfully verified.", value: 10987 },
  { title: "Detected Tampering", description: "The number of videos where tampering has been detected.", value: 345 },
  { title: "Pending Reviews", description: "The number of videos currently awaiting review.", value: 1013 },
];



const pieChartData = summaryCards.map(card => ({
  category: card.title,
  value: card.value,
  fill: `hsl(var(--chart-${summaryCards.indexOf(card) + 1}))`,
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



export default function Dashboard() {
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

  const totalVideos = React.useMemo(() => {
    return pieChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);

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
                <CardTitle>Video Statistics</CardTitle>
                <CardDescription>Overview of video verifications</CardDescription>
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
                                  {totalVideos.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Total Videos
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
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing total video statistics
                </div>
              </CardFooter>
            </Card>
            <RecentActivity userId={user?.$id || ""} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <VerificationTrends chartData={chartData} chartConfig={chartConfig} />
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