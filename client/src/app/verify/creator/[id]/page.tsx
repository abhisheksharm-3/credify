'use client'

import React, { useEffect, useState } from 'react';
import { getUserById, setProfilePhoto } from '@/lib/server/appwrite'; // Adjust the import path as needed
import {
  StarIcon,
  FlagIcon,
  ShieldCheckIcon,
  ScaleIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from 'next/navigation';
import { RiCheckboxCircleFill, RiGraduationCapFill, RiGroupFill, RiVidicon2Fill } from '@remixicon/react';
import Layout from '@/components/Layout/Layout';
import { toast } from 'sonner';

// Define types
type UserStats = {
  totalVerifiedVideos: number;
  contentCredibilityScore: number;
  attributionsEarned: number;
  communityTrustLevel: string;
  videosFlagged: number;
  successfulVerifications: number;
  disputedClaims: number;
  appealsResolved: number;
};

type UserData = {
  name: string;
  isVerified: boolean;
  credibilityScore: number;
  profilePicture: string;
  stats: UserStats;
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({ icon: Icon, title, value }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

type CredibilityOverviewPageProps = {
  params: { creatorId: string };
};

export default function CredibilityOverviewPage() {
  const params = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProfilePicture, setUpdatingProfilePicture] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const creatorId = Array.isArray(params.creatorId) ? params.creatorId[0] : params.creatorId;
        const result = await getUserById(creatorId);
        if (result.success) {
          setUserData({
            name: result.user?.name ?? 'Unknown User',
            isVerified: result.user?.labels?.includes('verified') ?? false,
            credibilityScore: 85, // Assuming this is a separate value
            profilePicture: result.user?.prefs?.profilePhoto || "/placeholder.svg?height=128&width=128",
            stats: {
              totalVerifiedVideos: 120,
              contentCredibilityScore: 92,
              attributionsEarned: 45,
              communityTrustLevel: "High",
              videosFlagged: 3,
              successfulVerifications: 118,
              disputedClaims: 5,
              appealsResolved: 2
            }
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [params.creatorId]);

  const handleProfilePictureUpload = async (imageUrl: string) => {
    setUpdatingProfilePicture(true);
    try {
      const creatorId = Array.isArray(params.creatorId) ? params.creatorId[0] : params.creatorId;
      await setProfilePhoto(creatorId, imageUrl);
      setUserData((prevData) => ({
        ...prevData!,
        profilePicture: imageUrl,
      }));
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture. Please try again.');
    } finally {
      setUpdatingProfilePicture(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center h-screen">User not found</div>;
  }

  return (
    <Layout className="min-h-screen">
      <div className="container mx-auto p-6">
        <Card className="mb-8">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.profilePicture} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                {userData.isVerified && (
                  <Badge variant="secondary" className="mt-2">
                    <RiCheckboxCircleFill className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{userData.credibilityScore}%</div>
              <Progress value={userData.credibilityScore} className="w-40" />
              <div className="mt-2 text-sm text-muted-foreground">Credibility Score</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={RiVidicon2Fill}
            title="Verified Videos"
            value={userData.stats.totalVerifiedVideos}
          />
          <StatCard
            icon={StarIcon}
            title="Content Credibility"
            value={`${userData.stats.contentCredibilityScore}%`}
          />
          <StatCard
            icon={RiGroupFill}
            title="Attributions Earned"
            value={userData.stats.attributionsEarned}
          />
          <StatCard
            icon={RiGraduationCapFill}
            title="Community Trust"
            value={userData.stats.communityTrustLevel}
          />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Activity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <FlagIcon className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Videos Flagged</p>
                  <p className="text-2xl font-semibold">{userData.stats.videosFlagged}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Successful Verifications</p>
                  <p className="text-2xl font-semibold">{userData.stats.successfulVerifications}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ScaleIcon className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Disputed Claims</p>
                  <p className="text-2xl font-semibold">{userData.stats.disputedClaims}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <RiCheckboxCircleFill className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Appeals Resolved</p>
                  <p className="text-2xl font-semibold">{userData.stats.appealsResolved}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
        <Button variant="destructive">
          Report User
        </Button>
      </div>
      </div>
    </Layout>
  );
}