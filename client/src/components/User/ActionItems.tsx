import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendIcon, MessageCircleIcon } from "lucide-react";
import { UploadVideoDialog } from "./UploadVideoDialog";

export function ActionItems() {
  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Quick actions you can take to manage your content.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <UploadVideoDialog />
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
  );
}