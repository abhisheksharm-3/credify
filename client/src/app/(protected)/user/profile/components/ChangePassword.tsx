import React from "react";

function ChangePassword() {
  return (
    <div className="border-2 rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold">Change Password</div>
        <div className="text-sm text-gray-500">
          Update your account password.
        </div>
      </div>
      <div className="grid gap-6 mt-12">
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="current-password">
            Current Password
          </label>
          <input
            className="border-[1px] text-sm rounded-md p-2 outline-none"
            id="current-password"
            type="password"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="new-password">
            New Password
          </label>
          <input
            className="border-[1px] text-sm rounded-md p-2 outline-none"
            id="new-password"
            type="password"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            className="border-[1px] text-sm rounded-md p-2 outline-none"
            id="confirm-password"
            type="password"
          />
        </div>
      </div>
      <button className="mt-6 m-3 p-2 px-3 rounded-lg text-sm text-[#faf6f6] bg-[#ec1e3d]">Update Password</button>
    </div>
  );
}

export default ChangePassword;
