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
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
      setPassword("");
    }
  };

  return (
    <Card className="backdrop-blur-lg bg-opacity-30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={user.name} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user.email} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={!isEditing}
              ref={phoneInputRef}
            />
            {isEditing ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={loading}>
                    {loading ? "Updating..." : "Done"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Enter your password</DialogTitle>
                    <DialogDescription>
                      To update your phone number, please enter your account password.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={handleDoneClick} disabled={loading}>
                      {loading ? "Updating..." : "Confirm"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="secondary" onClick={handleEditClick}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;