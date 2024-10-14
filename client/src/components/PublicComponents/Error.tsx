import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ErrorSectionProps } from '@/lib/frontend-types';

export default function ErrorSection({ error }: ErrorSectionProps) {
  return (
    <Card className="mb-8 border-destructive">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}