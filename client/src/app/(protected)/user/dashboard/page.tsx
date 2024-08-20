// src/app/account/page.jsx
"use client"
import {
  createSessionClient,
  getLoggedInUser,
} from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CartesianGrid, XAxis, Line, LineChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { BarcodeIcon, CalendarIcon, CircleAlertIcon, FilterIcon, ImportIcon, LockIcon, MessageCircleIcon, SendIcon, TrendingUp, TriangleAlertIcon, UploadIcon, UserIcon } from "lucide-react";
import Layout from "@/components/Layout/Layout";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig


export default function Dashboard() {

  return (
    <Layout><div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Videos Verified</CardTitle>
              <CardDescription>The total number of videos that have been verified.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">12,345</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Successful Verifications</CardTitle>
              <CardDescription>The number of videos that have been successfully verified.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">10,987</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detected Tampering</CardTitle>
              <CardDescription>The number of videos where tampering has been detected.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">345</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>The number of videos currently awaiting review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">1,013</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A list of recently verified videos and their status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Acme Product Launch</div>
                      <div className="text-sm text-muted-foreground">Uploaded 2 days ago</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Verified</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href="#" className="text-primary" prefetch={false}>
                        View Report
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Credify Onboarding</div>
                      <div className="text-sm text-muted-foreground">Uploaded 1 week ago</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href="#" className="text-primary" prefetch={false}>
                        Request Review
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Sustainability Report</div>
                      <div className="text-sm text-muted-foreground">Uploaded 3 weeks ago</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href="#" className="text-primary" prefetch={false}>
                        View Report
                      </Link>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card className="col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>Verification Trends</CardTitle>
              <CardDescription>A chart showing trends in video verification over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="desktop"
                    type="natural"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
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
                    <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Tampered</DropdownMenuCheckboxItem>
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
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Alerts &amp; Notifications</CardTitle>
              <CardDescription>Important issues requiring your attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Alert variant="destructive">
                  <TriangleAlertIcon className="h-4 w-4" />
                  <AlertTitle>Suspicious Activity Detected</AlertTitle>
                  <AlertDescription>
                    We've detected unusual activity on your account. Please review your recent activity and contact
                    support if you have any concerns.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <CircleAlertIcon className="h-4 w-4" />
                  <AlertTitle>Pending Video Reviews</AlertTitle>
                  <AlertDescription>
                    You have 12 videos awaiting review. Please submit your requests to ensure timely processing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Quick actions you can take to manage your content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Button>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload New Video
                </Button>
                <Button variant="outline">
                  <SendIcon className="h-4 w-4 mr-2" />
                  Request Review
                </Button>
                <Button variant="outline">
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your Credify account and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
                <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
                  <LockIcon className="h-4 w-4" />
                  Security
                </Link>
                <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
                  <BarcodeIcon className="h-4 w-4" />
                  Billing
                </Link>
                <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
                  <ImportIcon className="h-4 w-4" />
                  Integrations
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div></Layout>
  );
}
