"use client";
import { useState, useRef } from "react";
import { updatePhoneNumber } from "@/lib/server/appwrite";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileInfoProps } from "@/lib/frontend-types";

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user.phone || "No Number Provided");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setPhone("");
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  };

  const handleDoneClick = async () => {
    setLoading(true);
    if (phone === "") {
      setPhone(user.phone || "No Number Provided");
      setIsEditing(false);
      setLoading(false);
      return;
    }

    try {
      const result = await updatePhoneNumber(phone, password);

      if (result.success) {
        setIsEditing(false);
        setPhone(phone);
        toast.success("Phone Number updated successfully!");
      } else {
        toast.error(result.error || "Unknown error occurred");
        setPhone(user.phone || "No Number Provided");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      setPhone(user.phone || "No Number Provided");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 rounded-xl p-6 bg-card backdrop-blur-lg bg-opacity-30  shadow-lg">
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
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none bg-opacity-30 "
            id="name"
            defaultValue={user.name}
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="email">
            Email
          </label>
          <input
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none bg-opacity-30 "
            id="email"
            type="email"
            defaultValue={user.email}
          />
        </div>
        <div className="grid gap-2 items-center">
          <label className="font-semibold text-sm" htmlFor="phone">
            Phone Number
          </label>
          <div className="flex gap-2 items-center bg-card">
            <input
              className="border-[1px]  text-sm bg-card rounded-md p-2 outline-none   flex-1"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={!isEditing}
              ref={phoneInputRef}
            />
            {isEditing ? (
              <Dialog>
                <DialogTrigger>
                  <button
                    className="p-2 px-3 rounded-lg text-sm text-[#faf6f6] bg-green-700"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Done"}
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-opacity-90 bg-card ">
                  <DialogHeader>
                    <DialogTitle>Enter your password</DialogTitle>
                    <DialogDescription>
                      To update your phone number, please enter your account password.
                    </DialogDescription>
                  </DialogHeader>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[1px] text-sm bg-card rounded-md p-2 outline-none bg-opacity-30  w-full mt-4"
                  />
                  <div className="flex justify-end mt-6">
                    <button
                      className="p-2 px-3 rounded-lg text-sm text-white bg-green-600"
                      onClick={handleDoneClick}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Confirm"}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <button
                className="p-2 px-3 rounded-lg text-sm text-[#faf6f6] bg-rose-700"
                onClick={handleEditClick}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileInfo;
