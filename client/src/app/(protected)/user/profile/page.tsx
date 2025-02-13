import ProfileInfo from "../../../../components/User/ProfileInfo"
import ChangePassword from "../../../../components/User/ChangePassword"
import VerificationSettings from "../../../../components/User/VerificationSettings"
import SecuritySetting from "../../../../components/User/SecuritySetting"
import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import LoggedInLayout from "@/components/Layout/LoggedInLayout"

export default async function Page() {
  const user = await getLoggedInUser();
  if (!user) redirect("/signup");
  return (
    <LoggedInLayout><div className="flex flex-col min-h-screen bg-muted dark:bg-inherit">
    <main className="flex-1 grid gap-8 p-4 sm:p-8 md:grid-cols-[1fr_300px]">
      <div className="space-y-8">
        <ProfileInfo user={user}/>
        <ChangePassword/>
      </div>
      <div className="space-y-8">
        <VerificationSettings/>
        <SecuritySetting/>
      </div>
    </main>
  </div></LoggedInLayout>
  )
}
