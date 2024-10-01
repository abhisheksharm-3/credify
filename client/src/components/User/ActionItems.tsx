import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendIcon, MessageCircleIcon } from "lucide-react";
import UploadVideoDialog from "./UploadVideoDialog";

export function ActionItems() {
  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Action Items</CardTitle>
        <CardDescription>Quick actions to manage your content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <UploadVideoDialog />
          <Button variant="outline" className="w-full border-green-500 text-green-500">
            <SendIcon className="h-5 w-5 mr-2" />
            Request Review
          </Button>
          <Button variant="outline" className="w-full border-purple-500 text-purple-500">
            <MessageCircleIcon className="h-5 w-5 mr-2" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}