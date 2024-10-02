import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';

interface GeminiAnalysisTabProps {
  geminiAnalysis: string;
}

export default function GeminiAnalysisTab({ geminiAnalysis }: GeminiAnalysisTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setAnalysis(geminiAnalysis);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [geminiAnalysis]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <svg fill="none" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)" />
              <defs>
                <radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                  <stop offset=".067" stopColor="#9168C0" />
                  <stop offset=".343" stopColor="#5684D1" />
                  <stop offset=".672" stopColor="#1BA1E3" />
                </radialGradient>
              </defs>
            </svg>
            AI Content Analysis
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : analysis ? (
          <ReactMarkdown className="prose prose-sm max-w-none">
            {analysis}
          </ReactMarkdown>
        ) : (
          <p className="text-muted-foreground">No AI analysis available for this content yet. Please check back later.</p>
        )}
      </CardContent>
    </Card>
  );
}