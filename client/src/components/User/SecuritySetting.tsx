"use client";
import React, { useEffect, useState } from "react";
import { getLogDetails } from "@/lib/server/appwrite";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define types for the log entry and component state
interface LogEntry {
  event: string;
  user: string;
  deviceName: string;
  deviceBrand?: string;
  deviceModel?: string;
  osName: string;
  osVersion: string;
  timestamp: string;
}

interface LogResult {
  success: boolean;
  logs?: LogEntry[];
  error?: string;
}

function SecuritySetting(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      const result: LogResult = await getLogDetails();
      if (result.success) {
        setLogs(result.logs || []);
      } else {
        setError(result.error || "An unknown error occurred.");
      }
    };

    fetchLogs();
  }, []);

  if (error) {
    return (
      <Card className="border-2 rounded-xl p-6 bg-red-100 text-red-700">
        No Activity 
      </Card>
    );
  }

  return (
    <Card className="border-2 rounded-xl p-6 bg-card ">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Security Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account security and view recent login activity.</p>
      </div>
      <div className="grid gap-6 mt-6">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="account-activity" className="text-muted-foreground font-semibold text-sm pl-1">
              Account Activity
            </Label>
          </div>
          <div className="grid gap-1 text-sm">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-1   bg-card shadow-sm">
                <div>
                    <div>
                      {log.deviceName
                        ? (log.osName
                          ? `${log.osName} on ${log.deviceName}`
                          : `${log.deviceName}`)
                        : (log.osName
                          ? `${log.osName} on unknown device`
                          : 'Unknown Device')}
                      <div className="flex gap-2">
                      {log.deviceBrand && <p className="text-sm font-bold text-muted-foreground">{log.deviceBrand}</p>}
                      {log.deviceModel && <p className="text-sm font-bold  text-muted-foreground">{log.deviceModel}</p>}
                      </div>
                      <p className="text-sm text-gray-500">{log.timestamp}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SecuritySetting;
