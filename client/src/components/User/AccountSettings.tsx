import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserIcon, LockIcon, BarcodeIcon, ImportIcon } from "lucide-react";

export function AccountSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your Credify account and security settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>
          <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
            <LockIcon className="h-4 w-4" />
            Security
          </Link>
          <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
            <BarcodeIcon className="h-4 w-4" />
            Billing
          </Link>
          <Link href="#" className="flex items-center gap-2 text-primary" prefetch={false}>
            <ImportIcon className="h-4 w-4" />
            Integrations
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}