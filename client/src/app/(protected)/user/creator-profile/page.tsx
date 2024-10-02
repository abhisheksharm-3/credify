"use client";
import LoggedInLayout from '@/components/Layout/LoggedInLayout';
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics';
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends';
import VerifiedVideos from '@/components/ProfileDetails/UserVideos';
import UserHeader from '@/components/ProfileDetails/UserHeader';
import { useUser } from '@/hooks/useUser';
import { useFiles } from '@/hooks/useFiles';
import { Loader2 } from 'lucide-react';

const TrustDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const { files, verifiedCount, unverifiedCount, tamperedCount, monthlyData } = useFiles();

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <LoggedInLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <UserHeader user={user} />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <TrustStatistics
            verifiedCount={verifiedCount}
            unverifiedCount={unverifiedCount}
            tamperedCount={tamperedCount}
          />
          <TrustScoreTrend monthlyData={monthlyData} />
          <VerifiedVideos files={files} />
        </main>
      </div>
    </LoggedInLayout>
  );
};

export default TrustDashboard;
