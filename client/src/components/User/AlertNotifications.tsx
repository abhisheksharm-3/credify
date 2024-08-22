import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon, CircleAlertIcon } from "lucide-react";

export function AlertsNotifications() {
  return (
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
              We&apos;ve detected unusual activity on your account. Please review your recent activity and contact
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
  );
}