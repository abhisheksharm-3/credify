import ProfileInfo from "../../../../components/User/ProfileInfo"
import ChangePassword from "../../../../components/User/ChangePassword"
import VerificationSettings from "../../../../components/User/VerificationSettings"
import SupportAndHelp from "../../../../components/User/SupportAndHelp"
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
        <SupportAndHelp/>
      </div>
    </main>
    <footer className="bg-background border-t px-4 sm:px-6 py-4 flex items-center justify-between">
      <button className=" p-2 px-4 rounded-lg text-md text-[#faf6f6] bg-rose-700">Save Changes</button>
    </footer>
  </div></LoggedInLayout>
  )
}
