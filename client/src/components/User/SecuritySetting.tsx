"use client";

import React, { useEffect, useState } from "react";
import { getLogDetails } from "@/lib/server/appwrite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LogEntry, LogResult } from "@/lib/frontend-types";
import { Loader2, AlertCircle, Monitor } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function SecuritySetting(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const result: LogResult = await getLogDetails();
      if (result.success) {
        setLogs(result.logs || []);
      } else {
        setError(result.error || "Unable to fetch account activity. Please try again later.");
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Card className="border-2 rounded-xl p-6">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 rounded-xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="border-2 rounded-xl">
      <CardHeader>
        <CardTitle className="">Security Overview</CardTitle>
        <CardDescription>Review your recent account activity and manage security settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="">Recent Account Activity</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {log.deviceName
                        ? (log.osName ? `${log.osName} on ${log.deviceName}` : `${log.deviceName}`)
                        : (log.osName ? `${log.osName} on unknown device` : 'Unknown Device')}
                    </p>
                    {(log.deviceBrand || log.deviceModel) && (
                      <p className="text-sm text-muted-foreground">
                        {[log.deviceBrand, log.deviceModel].filter(Boolean).join(" ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SecuritySetting;