import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
export function LoadingSkeleton() {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex flex-col gap-8 p-4 sm:px-6 sm:py-8 md:gap-12 lg:px-8 xl:px-12">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60 mt-2" />
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[100px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }