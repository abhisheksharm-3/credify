import { User } from "lucide-react";
function ProfileInfo() {
  return (
    <div className="border-2 rounded-xl p-6 bg-card">
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
            className="border-[1px] text-sm rounded-md p-2 outline-none"
            id="name"
            defaultValue="John Doe"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="email">
            Email
          </label>
          <input
            className="border-[1px] text-sm rounded-md p-2 outline-none"
            id="email"
            type="email"
            defaultValue="john@example.com"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm mb-3">Profile Picture</label>
          <div className="flex items-center gap-8 ml-3">
            <User size={34} color="#aaaaaa" strokeWidth={1.25} />
            <button className="border-[1px] text-[#2e2e2e] border-[#b9b9b9]  p-2 rounded-lg text-sm font-semibold  px-3 ">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfileInfo;
