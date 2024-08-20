// src/app/account/page.tsx
"use client"

import Layout from "@/components/Layout/Layout";
import { SummaryCard } from "@/components/User/SummaryCard";
import { RecentActivity } from "@/components/User/RecentActivity";
import { VerificationTrends } from "@/components/User/VerificationTrendsChart";
import { AlertsNotifications } from "@/components/User/AlertNotifications";
import { ActionItems } from "@/components/User/ActionItems";
import { AccountSettings } from "@/components/User/AccountSettings";
import { CardData, ChartDataPoint, VideoData } from "@/lib/types";

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
  { title: "Total Videos Verified", description: "The total number of videos that have been verified.", value: 12345 },
  { title: "Successful Verifications", description: "The number of videos that have been successfully verified.", value: 10987 },
  { title: "Detected Tampering", description: "The number of videos where tampering has been detected.", value: 345 },
  { title: "Pending Reviews", description: "The number of videos currently awaiting review.", value: 1013 },
];

const recentVideos: VideoData[] = [
  { title: "Acme Product Launch", uploadDate: "Uploaded 2 days ago", status: "Verified" },
  { title: "Credify Onboarding", uploadDate: "Uploaded 1 week ago", status: "Pending" },
  { title: "Sustainability Report", uploadDate: "Uploaded 3 weeks ago", status: "Pending" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card, index) => (
              <SummaryCard key={index} {...card} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <RecentActivity videos={recentVideos} />
            <VerificationTrends chartData={chartData} chartConfig={chartConfig} />
            <AlertsNotifications />
            <ActionItems />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AccountSettings />
          </div>
        </main>
      </div>
    </Layout>
  );
}