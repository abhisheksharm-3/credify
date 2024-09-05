import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function AnalyzingSection() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Clock className="w-6 h-6 animate-spin text-primary" />
          <div>
            <h3 className="font-semibold">Verifying Content</h3>
            <p className="text-sm text-muted-foreground">Please wait while we verify your content.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}