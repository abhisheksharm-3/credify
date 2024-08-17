import React from "react";

function SecuritySetting() {
  return (
    <div className="border-2 rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold"> Security Settings</div>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Signed in from New York</p>
                <p className="text-sm text-muted-foreground">
                  Oct 8, 2023 at 9:15 AM
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Signed in from San Francisco</p>
                <p className="text-sm text-muted-foreground">
                  Oct 5, 2023 at 2:30 PM
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-[#9b9999] font-semibold text-sm" htmlFor="connected-devices">
            Connected Devices
          </label>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">iPhone 13 Pro</p>
                <p className="text-sm text-muted-foreground">
                  Oct 8, 2023 at 9:15 AM
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">MacBook Pro</p>
                <p className="text-sm text-muted-foreground">
                  Oct 5, 2023 at 2:30 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySetting;
