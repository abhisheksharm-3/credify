import { User as UserType } from "@/lib/types";
import { User } from "lucide-react";

interface ProfileInfoProps {
  user: UserType;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="border-2 rounded-xl p-6 bg-card backdrop-blur-lg bg-opacity-30 border-white/20 shadow-lg">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold">Profile Information</div>
        <div className="text-sm text-gray-500">
          Update your personal details.
        </div>
      </div>
      <div className="grid gap-6 mt-12">
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="name">
            Name
          </label>
          <input
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none bg-opacity-30 border-white/20"
            id="name"
            defaultValue={user.name}
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="email">
            Email
          </label>
          <input
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none bg-opacity-30 border-white/20"
            id="email"
            type="email"
            defaultValue={user.email}
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm mb-3">Profile Picture</label>
          <div className="flex items-center gap-8 ml-3">
            <User size={34} color="#aaaaaa" strokeWidth={1.25} />
            <button className="border-[1px] dark:text-gray-300 text-[#2e2e2e] border-[#b9b9b9] p-2 rounded-lg text-sm font-semibold px-3 bg-opacity-30 border-white/20 shadow-lg">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
