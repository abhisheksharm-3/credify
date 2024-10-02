"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function VerificationSettings() {
  const [selectedOption, setSelectedOption] = useState("all");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const options = [
    { value: "all", label: "All Notifications" },
    { value: "important", label: "Important Notifications Only" },
    { value: "none", label: "No Notifications" },
  ];

  return (
    <Card className="border-2 rounded-xl">
      <CardHeader>
        <CardTitle>Verification Settings</CardTitle>
        <CardDescription>Customize your account verification and notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notification-preferences">Notification Preferences</Label>
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger id="notification-preferences">
              <SelectValue placeholder="Select notification preference" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="two-factor-auth"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
            <Label htmlFor="two-factor-auth">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {twoFactorEnabled
              ? "Two-factor authentication is currently enabled, providing an extra layer of security for your account."
              : "Enable two-factor authentication for enhanced account security."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default VerificationSettings;