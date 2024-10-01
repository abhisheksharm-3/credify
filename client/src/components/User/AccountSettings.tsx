import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserIcon, LockIcon, CreditCardIcon, PuzzleIcon } from "lucide-react";

export function AccountSettings() {
  const settingsLinks = [
    { icon: UserIcon, text: "Profile", href: "/profile" },
    { icon: LockIcon, text: "Security", href: "/security" },
    { icon: CreditCardIcon, text: "Billing", href: "/billing" },
    { icon: PuzzleIcon, text: "Integrations", href: "/integrations" },
  ];

  return (
    <Card className="col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
        <CardDescription>Manage your Credify account and security</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {settingsLinks.map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              prefetch={false}
            >
              <link.icon className="h-5 w-5 mr-3 text-primary" />
              <span className="text-lg">{link.text}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}