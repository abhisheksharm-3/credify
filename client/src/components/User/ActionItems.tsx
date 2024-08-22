import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, SendIcon, MessageCircleIcon } from "lucide-react";

export function ActionItems() {
  return (
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
  );
}