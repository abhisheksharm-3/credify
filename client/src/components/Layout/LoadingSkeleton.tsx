import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LoadingSkeleton() {
  const summaryCards = Array(4).fill(null)

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-gray-900">
        <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
          {/* Welcome Section */}
          <div className="mb-4 flex flex-col md:flex-row w-full justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="mr-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-40" />
                </div>
                <div className="mt-2 flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-32" /> {/* Upload button */}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((_, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pie Chart Card */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>
                  <Skeleton className="h-7 w-48" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div className="aspect-square max-h-[250px] mx-auto">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Skeleton className="h-4 w-48" />
              </CardFooter>
            </Card>

            {/* Recent Activity Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-7 w-48" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(4).fill(null).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Monthly Histogram */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-7 w-48" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-7 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3).fill(null).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-7 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3).fill(null).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}