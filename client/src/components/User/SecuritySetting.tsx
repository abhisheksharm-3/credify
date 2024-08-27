/* "use client"
import React, { useEffect, useState } from "react";
import { getLogDetails } from "@/lib/server/appwrite";

// Define types for the log entry and component state
interface LogEntry {
  event: string;
  user: string;
  device: string;
  location: string;
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
    return <div>Error: {error}</div>;
  }

  return (
    <div className="border-2 rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold">Security Settings</div>
        <div className="text-sm text-gray-500">
          Manage your account security.
        </div>
      </div>
      <div className="grid gap-6 mt-10">
        <div className="grid gap-2">
          <label className="text-[#9b9999] font-semibold text-sm" htmlFor="account-activity">
            Account Activity
          </label>
          <div className="grid gap-4">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{log.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-[#9b9999] font-semibold text-sm" htmlFor="connected-devices">
            Connected Devices
          </label>
          <div className="grid gap-4">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{log.device}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySetting;
 */